import test from "node:test";
import assert from "node:assert/strict";
import { decodeUsageMetadata, extractContextTree, readVarint, skipField } from "../src/protobuf";

function encodeVarint(val: number): Uint8Array {
  const bytes: number[] = [];
  while (val >= 0x80) {
    bytes.push((val & 0x7f) | 0x80);
    val = Math.floor(val / 128);
  }
  bytes.push(val & 0x7f);
  return new Uint8Array(bytes);
}

function encodeTag(fieldNum: number, wireType: number): Uint8Array {
  return encodeVarint(fieldNum * 8 + wireType);
}

function encodeLengthDelimited(fieldNum: number, content: Uint8Array): Uint8Array {
  const tag = encodeTag(fieldNum, 2);
  const len = encodeVarint(content.length);
  const res = new Uint8Array(tag.length + len.length + content.length);
  res.set(tag, 0);
  res.set(len, tag.length);
  res.set(content, tag.length + len.length);
  return res;
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((acc, a) => acc + a.length, 0);
  const res = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    res.set(a, offset);
    offset += a.length;
  }
  return res;
}

test("readVarint decodes 1-byte, 2-byte, and multi-byte varints correctly", () => {
  // 1-byte: 0, 42, 127
  assert.deepEqual(readVarint(new Uint8Array([0]), 0), [0, 1]);
  assert.deepEqual(readVarint(new Uint8Array([42]), 0), [42, 1]);
  assert.deepEqual(readVarint(new Uint8Array([127]), 0), [127, 1]);

  // 2-byte: 128 (0x80 0x01), 300 (0xAC 0x02)
  assert.deepEqual(readVarint(new Uint8Array([0x80, 0x01]), 0), [128, 2]);
  assert.deepEqual(readVarint(new Uint8Array([0xac, 0x02]), 0), [300, 2]);

  // multi-byte: 100,000 (0xA0 0x8D 0x06)
  const enc100k = encodeVarint(100_000);
  assert.deepEqual(readVarint(enc100k, 0), [100_000, enc100k.length]);

  // Large turn context: 180,000
  const enc180k = encodeVarint(180_000);
  assert.deepEqual(readVarint(enc180k, 0), [180_000, enc180k.length]);
});

test("readVarint handles truncated and invalid buffers safely", () => {
  // Truncated: continuation bit set but EOF reached
  assert.equal(readVarint(new Uint8Array([0x80]), 0), null);
  assert.equal(readVarint(new Uint8Array([0xac, 0x82]), 0), null);

  // Buffer offset beyond end
  assert.equal(readVarint(new Uint8Array([42]), 1), null);

  // Overflowing varint (> 64 bits of continuation)
  const overflow = new Uint8Array(11).fill(0x80);
  assert.equal(readVarint(overflow, 0), null);
});

test("skipField correctly advances past varint, 64-bit, length-delimited, and 32-bit fields", () => {
  // WireType 0 (varint): 300 at offset 0
  const varintBuf = new Uint8Array([0xac, 0x02, 0xff]);
  assert.equal(skipField(varintBuf, 0, 0, varintBuf.length), 2);

  // WireType 1 (64-bit): 8 bytes
  const bit64Buf = new Uint8Array(10).fill(1);
  assert.equal(skipField(bit64Buf, 1, 0, bit64Buf.length), 8);
  assert.equal(skipField(bit64Buf, 1, 5, bit64Buf.length), null); // truncated

  // WireType 2 (length-delimited): len 4 + 4 bytes
  const ldBuf = new Uint8Array([4, 10, 20, 30, 40, 99]);
  assert.equal(skipField(ldBuf, 2, 0, ldBuf.length), 5);
  // Truncated length-delimited
  const ldTrunc = new Uint8Array([10, 1, 2]); // claims len 10 but only 2 bytes follow
  assert.equal(skipField(ldTrunc, 2, 0, ldTrunc.length), null);

  // WireType 5 (32-bit): 4 bytes
  const bit32Buf = new Uint8Array(6).fill(1);
  assert.equal(skipField(bit32Buf, 5, 0, bit32Buf.length), 4);
  assert.equal(skipField(bit32Buf, 5, 3, bit32Buf.length), null); // truncated

  // Unsupported wire type
  assert.equal(skipField(new Uint8Array(10), 3, 0, 10), null);
});

test("decodeUsageMetadata decodes prompt_tokens and candidates_tokens from nested GenerationMetadata", () => {
  // Build UsageMetadata: field 2 (prompt_tokens) = 15000, field 3 (candidates_tokens) = 1200
  const promptField = concat(encodeTag(2, 0), encodeVarint(15000));
  const candidateField = concat(encodeTag(3, 0), encodeVarint(1200));
  const usagePayload = concat(promptField, candidateField);

  // Wrap in Field 4 (UsageMetadata)
  const usageMetadataField = encodeLengthDelimited(4, usagePayload);

  // Wrap in Field 1 (GenerationMetadata)
  const genMetadataField = encodeLengthDelimited(1, usageMetadataField);

  const result = decodeUsageMetadata(genMetadataField);
  assert.ok(result);
  assert.equal(result.promptTokens, 15000);
  assert.equal(result.candidatesTokens, 1200);
});

test("decodeUsageMetadata handles arbitrary wire ordering and extra fields gracefully", () => {
  // Extra field 1 in UsageMetadata (varint = 42)
  const extraUsageField = concat(encodeTag(1, 0), encodeVarint(42));
  // Out of order: candidates_tokens (field 3) before prompt_tokens (field 2)
  const candidateField = concat(encodeTag(3, 0), encodeVarint(450));
  const promptField = concat(encodeTag(2, 0), encodeVarint(2200));
  // Extra 64-bit field in UsageMetadata
  const extra64 = concat(encodeTag(7, 1), new Uint8Array(8).fill(9));

  const usagePayload = concat(extraUsageField, candidateField, promptField, extra64);
  const usageMetadataField = encodeLengthDelimited(4, usagePayload);

  // Extra field in GenerationMetadata (field 2 = length-delimited string)
  const extraGenField = encodeLengthDelimited(2, new Uint8Array([0x61, 0x62, 0x63]));
  const genPayload = concat(extraGenField, usageMetadataField);
  const genMetadataField = encodeLengthDelimited(1, genPayload);

  // Extra top-level field (field 3 = varint 99)
  const topExtra = concat(encodeTag(3, 0), encodeVarint(99));
  const topPayload = concat(topExtra, genMetadataField);

  const result = decodeUsageMetadata(topPayload);
  assert.ok(result);
  assert.equal(result.promptTokens, 2200);
  assert.equal(result.candidatesTokens, 450);
});

test("decodeUsageMetadata returns null on truncated, empty, or missing metadata blobs", () => {
  // Empty
  assert.equal(decodeUsageMetadata(new Uint8Array([])), null);

  // Truncated top-level length-delimited
  assert.equal(decodeUsageMetadata(new Uint8Array([0x0a, 0x50, 0x01])), null);

  // Valid protobuf but no GenerationMetadata or UsageMetadata
  const unrelated = encodeLengthDelimited(5, new Uint8Array([1, 2, 3]));
  assert.equal(decodeUsageMetadata(unrelated), null);
});

function encodeString(fieldNum: number, str: string): Uint8Array {
  return encodeLengthDelimited(fieldNum, new TextEncoder().encode(str));
}

function createContextTreeBlob(categories: Array<{ name: string; tokens: number; subItems?: Record<string, number> }>): Uint8Array {
  const categoryBuffers: Uint8Array[] = [];
  for (const cat of categories) {
    const parts: Uint8Array[] = [
      encodeString(1, cat.name),
      concat(encodeTag(4, 0), encodeVarint(cat.tokens)),
    ];
    if (cat.subItems) {
      for (const [sName, sTok] of Object.entries(cat.subItems)) {
        const subParts = concat(
          encodeString(1, sName),
          concat(encodeTag(3, 0), encodeVarint(sTok))
        );
        parts.push(encodeLengthDelimited(5, subParts));
      }
    }
    categoryBuffers.push(encodeLengthDelimited(1, concat(...parts)));
  }

  const f3 = encodeLengthDelimited(3, concat(...categoryBuffers));
  const f10 = encodeLengthDelimited(10, f3);
  const f9 = encodeLengthDelimited(9, f10);
  return encodeLengthDelimited(1, f9);
}

test("extractContextTree correctly calculates total_active with System Prompt, skills subtraction, Tools, and Chat Messages", () => {
  const blob = createContextTreeBlob([
    { name: "System Prompt", tokens: 7000, subItems: { skills: 4000 } },
    { name: "Tools", tokens: 5800 },
    { name: "Chat Messages", tokens: 87500 },
  ]);

  // sys_prompt_tok = 7000 - 4000 = 3000
  // total_active = 3000 (sys_prompt) + 5800 (tools) + 4000 (skills) + 87500 (chat) = 100300
  const total = extractContextTree(blob);
  assert.equal(total, 100300);
});

test("extractContextTree falls back to sum of category tokens if non-standard categories present", () => {
  const blob = createContextTreeBlob([
    { name: "CustomCategoryA", tokens: 12000 },
    { name: "CustomCategoryB", tokens: 8500 },
  ]);

  const total = extractContextTree(blob);
  assert.equal(total, 20500);
});

test("extractContextTree returns null on empty, truncated, or missing context tree blobs", () => {
  assert.equal(extractContextTree(new Uint8Array([])), null);
  assert.equal(extractContextTree(new Uint8Array([1, 2, 3])), null);

  // Field 1 present but no field 9
  const onlyF1 = encodeLengthDelimited(1, encodeLengthDelimited(4, new Uint8Array([1, 2])));
  assert.equal(extractContextTree(onlyF1), null);
});

