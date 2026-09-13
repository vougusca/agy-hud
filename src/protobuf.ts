export interface UsageMetadata {
  promptTokens: number;
  candidatesTokens: number;
}

/**
 * Reads a varint from buffer starting at offset up to end.
 * Returns [value, nextOffset] or null if truncated or malformed.
 */
export function readVarint(buffer: Uint8Array, offset: number, end: number = buffer.length): [number, number] | null {
  let value = 0;
  let shift = 0;
  while (offset < end) {
    if (shift >= 64) {
      return null;
    }
    const byte = buffer[offset++];
    value += (byte & 0x7f) * Math.pow(2, shift);
    shift += 7;
    if ((byte & 0x80) === 0) {
      return [value, offset];
    }
  }
  return null;
}

/**
 * Skips a field based on wire type.
 * Returns next offset or null if buffer is truncated / wire type unsupported.
 */
export function skipField(buffer: Uint8Array, wireType: number, offset: number, end: number): number | null {
  switch (wireType) {
    case 0: { // Varint
      const res = readVarint(buffer, offset, end);
      return res ? res[1] : null;
    }
    case 1: { // 64-bit
      return offset + 8 <= end ? offset + 8 : null;
    }
    case 2: { // Length-delimited
      const res = readVarint(buffer, offset, end);
      if (!res) return null;
      const next = res[1] + res[0];
      return next <= end ? next : null;
    }
    case 5: { // 32-bit
      return offset + 4 <= end ? offset + 4 : null;
    }
    default:
      return null;
  }
}

/**
 * Decodes UsageMetadata from GenerationMetadata blob in gen_metadata table.
 * Extracts field 1 (GenerationMetadata) -> field 4 (UsageMetadata):
 *   - subfield 2: prompt_tokens (active context)
 *   - subfield 3: candidates_tokens (output tokens)
 *
 * Handles arbitrary wire order, bounds checking on all length-delimited fields,
 * and returns null on malformed or truncated blobs.
 */
export function decodeUsageMetadata(buffer: Uint8Array): UsageMetadata | null {
  let offset = 0;
  const end = buffer.length;
  let promptTokens = 0;
  let candidatesTokens = 0;
  let found = false;

  while (offset < end) {
    const res = readVarint(buffer, offset, end);
    if (!res) break;
    const [tag, nextOffset] = res;
    offset = nextOffset;
    const wireType = tag & 7;
    const fieldNum = Math.floor(tag / 8);

    if (fieldNum === 1 && wireType === 2) {
      const lenRes = readVarint(buffer, offset, end);
      if (!lenRes) break;
      const [len, contentOffset] = lenRes;
      if (contentOffset + len > end) break;
      const subEnd = contentOffset + len;
      let subOffset = contentOffset;

      while (subOffset < subEnd) {
        const subRes = readVarint(buffer, subOffset, subEnd);
        if (!subRes) break;
        const [subTag, subNext] = subRes;
        subOffset = subNext;
        const subWire = subTag & 7;
        const subField = Math.floor(subTag / 8);

        if (subField === 4 && subWire === 2) {
          const uLenRes = readVarint(buffer, subOffset, subEnd);
          if (!uLenRes) break;
          const [uLen, uContentOffset] = uLenRes;
          if (uContentOffset + uLen > subEnd) break;
          const uEnd = uContentOffset + uLen;
          let uCur = uContentOffset;

          while (uCur < uEnd) {
            const fRes = readVarint(buffer, uCur, uEnd);
            if (!fRes) break;
            const [fTag, fNext] = fRes;
            uCur = fNext;
            const fWire = fTag & 7;
            const fNum = Math.floor(fTag / 8);

            if (fNum === 2 && fWire === 0) {
              const valRes = readVarint(buffer, uCur, uEnd);
              if (!valRes) break;
              promptTokens = valRes[0];
              uCur = valRes[1];
              found = true;
            } else if (fNum === 3 && fWire === 0) {
              const valRes = readVarint(buffer, uCur, uEnd);
              if (!valRes) break;
              candidatesTokens = valRes[0];
              uCur = valRes[1];
              found = true;
            } else {
              const next = skipField(buffer, fWire, uCur, uEnd);
              if (next === null) break;
              uCur = next;
            }
          }
          subOffset = uEnd;
        } else {
          const next = skipField(buffer, subWire, subOffset, subEnd);
          if (next === null) break;
          subOffset = next;
        }
      }
      offset = subEnd;
    } else {
      const next = skipField(buffer, wireType, offset, end);
      if (next === null) break;
      offset = next;
    }
  }

  return found ? { promptTokens, candidatesTokens } : null;
}

const textDecoder = new TextDecoder("utf-8", { fatal: false });

/**
 * Finds a length-delimited field range [contentStart, contentEnd] within [start, end].
 */
function getLengthDelimitedRange(
  buffer: Uint8Array,
  start: number,
  end: number,
  targetField: number
): [number, number] | null {
  let offset = start;
  while (offset < end) {
    const res = readVarint(buffer, offset, end);
    if (!res) break;
    const [tag, nextOffset] = res;
    offset = nextOffset;
    const wireType = tag & 7;
    const fieldNum = Math.floor(tag / 8);

    if (fieldNum === targetField && wireType === 2) {
      const lenRes = readVarint(buffer, offset, end);
      if (!lenRes) return null;
      const [len, contentOffset] = lenRes;
      if (contentOffset + len > end) return null;
      return [contentOffset, contentOffset + len];
    } else {
      const next = skipField(buffer, wireType, offset, end);
      if (next === null) break;
      offset = next;
    }
  }
  return null;
}

/**
 * Extracts total active context tokens from GenerationMetadata blob:
 * field 1 (bytes) -> field 9 (bytes) -> field 10 (bytes) -> field 3 (bytes).
 * Inside field 3, iterates repeated field 1 entries. Each entry contains:
 *   - field 1 (bytes): category name string (e.g. "System Prompt", "Tools", "skills", "Chat Messages")
 *   - field 4 (varint): category token count
 *   - field 5 (bytes): sub-items (contains field 1 name, field 3 tokens)
 * Calculates total_active exactly as in calc_db_tokens.py (lines 75-138):
 *   sys_cat tokens - skills_tok + tools_tok + skills_tok + chat_tok (or simply sum category tokens).
 * Returns total_active if > 0, or null if missing/malformed.
 */
export function extractContextTree(buffer: Uint8Array): number | null {
  const l1 = getLengthDelimitedRange(buffer, 0, buffer.length, 1);
  if (!l1) return null;
  const l2 = getLengthDelimitedRange(buffer, l1[0], l1[1], 9);
  if (!l2) return null;
  const l3 = getLengthDelimitedRange(buffer, l2[0], l2[1], 10);
  if (!l3) return null;
  const l4 = getLengthDelimitedRange(buffer, l3[0], l3[1], 3);
  if (!l4) return null;

  const categories: Record<string, { tokens: number; subItems: Record<string, number> }> = {};
  let cur = l4[0];
  const end = l4[1];

  while (cur < end) {
    const res = readVarint(buffer, cur, end);
    if (!res) break;
    const [tag, nextOffset] = res;
    cur = nextOffset;
    const wireType = tag & 7;
    const fieldNum = Math.floor(tag / 8);

    if (fieldNum === 1 && wireType === 2) {
      const lenRes = readVarint(buffer, cur, end);
      if (!lenRes) break;
      const [entryLen, entryStart] = lenRes;
      cur = entryStart + entryLen;
      if (cur > end) break;

      let catName = "";
      let catTok = 0;
      const subItems: Record<string, number> = {};
      let eCur = entryStart;
      const eEnd = entryStart + entryLen;

      while (eCur < eEnd) {
        const eRes = readVarint(buffer, eCur, eEnd);
        if (!eRes) break;
        const [eTag, eNext] = eRes;
        eCur = eNext;
        const eWire = eTag & 7;
        const eNum = Math.floor(eTag / 8);

        if (eNum === 1 && eWire === 2) {
          const sRes = readVarint(buffer, eCur, eEnd);
          if (!sRes) break;
          const [sLen, sStart] = sRes;
          eCur = sStart + sLen;
          if (eCur > eEnd) break;
          catName = textDecoder.decode(buffer.subarray(sStart, sStart + sLen));
        } else if (eNum === 4 && eWire === 0) {
          const vRes = readVarint(buffer, eCur, eEnd);
          if (!vRes) break;
          catTok = vRes[0];
          eCur = vRes[1];
        } else if (eNum === 5 && eWire === 2) {
          const subRes = readVarint(buffer, eCur, eEnd);
          if (!subRes) break;
          const [subLen, subStart] = subRes;
          eCur = subStart + subLen;
          if (eCur > eEnd) break;

          let sCur = subStart;
          const sEnd = subStart + subLen;
          let subName = "";
          let subTok = 0;
          while (sCur < sEnd) {
            const snRes = readVarint(buffer, sCur, sEnd);
            if (!snRes) break;
            const [snTag, snNext] = snRes;
            sCur = snNext;
            const snWire = snTag & 7;
            const snNum = Math.floor(snTag / 8);

            if (snNum === 1 && snWire === 2) {
              const strRes = readVarint(buffer, sCur, sEnd);
              if (!strRes) break;
              const [strLen, strStart] = strRes;
              sCur = strStart + strLen;
              if (sCur > sEnd) break;
              subName = textDecoder.decode(buffer.subarray(strStart, strStart + strLen));
            } else if (snNum === 3 && snWire === 0) {
              const svRes = readVarint(buffer, sCur, sEnd);
              if (!svRes) break;
              subTok = svRes[0];
              sCur = svRes[1];
            } else {
              const nxt = skipField(buffer, snWire, sCur, sEnd);
              if (nxt === null) break;
              sCur = nxt;
            }
          }
          if (subName) {
            subItems[subName] = subTok;
          }
        } else {
          const nxt = skipField(buffer, eWire, eCur, eEnd);
          if (nxt === null) break;
          eCur = nxt;
        }
      }

      if (catName) {
        categories[catName] = { tokens: catTok, subItems };
      }
    } else {
      const nxt = skipField(buffer, wireType, cur, end);
      if (nxt === null) break;
      cur = nxt;
    }
  }

  if (Object.keys(categories).length === 0) return null;

  const sysCat = categories["System Prompt"];
  const skillsTok = sysCat?.subItems?.["skills"] ?? 0;
  const sysCatTokens = sysCat?.tokens ?? 0;
  const sysPromptTok = Math.max(0, sysCatTokens - skillsTok);
  const toolsTok = categories["Tools"]?.tokens ?? 0;
  const chatTok = categories["Chat Messages"]?.tokens ?? 0;
  let totalActive = sysPromptTok + toolsTok + skillsTok + chatTok;

  if (totalActive === 0) {
    for (const cat of Object.values(categories)) {
      totalActive += cat.tokens;
    }
  }

  return totalActive > 0 ? totalActive : null;
}
