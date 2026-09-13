import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getSubagentStats, AgentTokenStats, sanitizeSubId } from "../src/subagentTracker";
import { DatabaseSync } from "node:sqlite";
import type { Payload } from "../src/statusline";

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

function createGenMetadataBlob(promptTokens: number, candidatesTokens: number): Uint8Array {
  const promptField = concat(encodeTag(2, 0), encodeVarint(promptTokens));
  const candidateField = concat(encodeTag(3, 0), encodeVarint(candidatesTokens));
  const usageMetadata = encodeLengthDelimited(4, concat(promptField, candidateField));
  return encodeLengthDelimited(1, usageMetadata);
}

function createTestEnvironment() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agy-hud-tracker-test-"));
  const convsDir = path.join(tmpDir, "conversations");
  fs.mkdirSync(convsDir, { recursive: true });

  const summariesDbPath = path.join(tmpDir, "conversation_summaries.db");
  const db = new DatabaseSync(summariesDbPath);
  db.exec(`
    CREATE TABLE conversation_summaries (
      rowid INTEGER PRIMARY KEY,
      conversation_id TEXT,
      agent_name TEXT,
      status TEXT,
      not_fully_idle INTEGER,
      step_count INTEGER,
      killed INTEGER,
      parent_conversation_id TEXT
    );
  `);
  db.close();

  return {
    tmpDir,
    convsDir,
    summariesDbPath,
    cleanup: () => {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        // ignore cleanup error
      }
    }
  };
}

test("getSubagentStats returns root agent with correct token calculations", () => {
  const env = createTestEnvironment();
  try {
    const payload: Payload = {
      conversation_id: "root-conv-123",
      agent_state: "thinking",
      context_window: {
        total_input_tokens: 2200,
        total_output_tokens: 42800,
      }
    };

    const result = getSubagentStats("root-conv-123", payload, { geminiHome: env.tmpDir });
    assert.equal(result.hasActiveSubagents, false);
    assert.equal(result.agents.length, 1);

    const root = result.agents[0];
    assert.equal(root.index, 0);
    assert.equal(root.role, "root");
    assert.equal(root.activeTokens, 2200);
    assert.equal(root.cumulativeTokens, 45000);
    assert.equal(root.status, "thinking");
  } finally {
    env.cleanup();
  }
});

test("getSubagentStats orders subagents by rowid ASC and parses token usage", () => {
  const env = createTestEnvironment();
  try {
    const parentId = "root-conv-1";
    const sub1Id = "sub-1-dev";
    const sub2Id = "sub-2-rev";

    // Create subagent databases
    const sub1DbPath = path.join(env.convsDir, `${sub1Id}.db`);
    const s1 = new DatabaseSync(sub1DbPath);
    s1.exec("CREATE TABLE gen_metadata (idx INTEGER PRIMARY KEY, data BLOB, size INTEGER);");
    const blob1 = createGenMetadataBlob(15000, 25000);
    s1.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(0, blob1, blob1.length);
    s1.close();

    const sub2DbPath = path.join(env.convsDir, `${sub2Id}.db`);
    const s2 = new DatabaseSync(sub2DbPath);
    s2.exec("CREATE TABLE gen_metadata (idx INTEGER PRIMARY KEY, data BLOB, size INTEGER);");
    const blob2 = createGenMetadataBlob(8000, 14000);
    s2.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(0, blob2, blob2.length);
    s2.close();

    // Populate conversation_summaries
    const db = new DatabaseSync(env.summariesDbPath);
    db.prepare(`
      INSERT INTO conversation_summaries (rowid, conversation_id, agent_name, status, not_fully_idle, step_count, killed, parent_conversation_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(10, sub1Id, "dev", "running", 1, 5, 0, parentId);
    db.prepare(`
      INSERT INTO conversation_summaries (rowid, conversation_id, agent_name, status, not_fully_idle, step_count, killed, parent_conversation_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(20, sub2Id, "code-reviewer", "running", 1, 3, 0, parentId);
    db.close();

    const payload: Payload = {
      conversation_id: parentId,
      context_window: { total_input_tokens: 2000, total_output_tokens: 40000 }
    };

    const cachePath = path.join(env.tmpDir, "cache.json");
    const result = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir, cachePath });

    assert.equal(result.hasActiveSubagents, true);
    assert.equal(result.agents.length, 3);

    // Root
    assert.equal(result.agents[0].index, 0);

    // Subagent 1
    assert.equal(result.agents[1].index, 1);
    assert.equal(result.agents[1].id, sub1Id);
    assert.equal(result.agents[1].role, "dev");
    assert.equal(result.agents[1].activeTokens, 15000);
    assert.equal(result.agents[1].cumulativeTokens, 40000); // 15k + 25k
    assert.equal(result.agents[1].isRunning, true);

    // Subagent 2
    assert.equal(result.agents[2].index, 2);
    assert.equal(result.agents[2].id, sub2Id);
    assert.equal(result.agents[2].role, "code-reviewer");
    assert.equal(result.agents[2].activeTokens, 8000);
    assert.equal(result.agents[2].cumulativeTokens, 22000); // 8k + 14k
    assert.equal(result.agents[2].isRunning, true);
  } finally {
    env.cleanup();
  }
});

test("getSubagentStats short-circuits idle subagents from cache without opening DB", () => {
  const env = createTestEnvironment();
  try {
    const parentId = "root-conv-cache";
    const subId = "sub-cached";

    const subDbPath = path.join(env.convsDir, `${subId}.db`);
    const s1 = new DatabaseSync(subDbPath);
    s1.exec("CREATE TABLE gen_metadata (idx INTEGER PRIMARY KEY, data BLOB, size INTEGER);");
    const blob1 = createGenMetadataBlob(12000, 18000);
    s1.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(0, blob1, blob1.length);
    s1.close();

    // Insert active subagent into summaries
    const db = new DatabaseSync(env.summariesDbPath);
    db.prepare(`
      INSERT INTO conversation_summaries (rowid, conversation_id, agent_name, status, not_fully_idle, step_count, killed, parent_conversation_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(1, subId, "dev", "running", 1, 1, 0, parentId);
    db.close();

    const cachePath = path.join(env.tmpDir, "sub_cache.json");
    const payload: Payload = { conversation_id: parentId };

    // First call: populates cache
    const firstResult = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir, cachePath });
    assert.equal(firstResult.hasActiveSubagents, true);
    assert.equal(firstResult.agents[1].activeTokens, 12000);
    assert.equal(firstResult.agents[1].cumulativeTokens, 30000);

    // Mark subagent idle in conversation_summaries
    const db2 = new DatabaseSync(env.summariesDbPath);
    db2.prepare("UPDATE conversation_summaries SET not_fully_idle = 0, status = 'idle' WHERE conversation_id = ?").run(subId);
    db2.close();

    // Delete subagent database completely to prove it is NEVER opened
    fs.unlinkSync(subDbPath);
    assert.equal(fs.existsSync(subDbPath), false);

    // Second call: subagent is idle and cached -> must succeed and read from cache!
    const secondResult = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir, cachePath });
    assert.equal(secondResult.hasActiveSubagents, false);
    assert.equal(secondResult.agents.length, 2);
    assert.equal(secondResult.agents[1].isRunning, false);
    assert.equal(secondResult.agents[1].activeTokens, 12000);
    assert.equal(secondResult.agents[1].cumulativeTokens, 30000);
  } finally {
    env.cleanup();
  }
});

test("getSubagentStats incrementally updates cumulative tokens on new turns", () => {
  const env = createTestEnvironment();
  try {
    const parentId = "root-conv-inc";
    const subId = "sub-inc";

    const subDbPath = path.join(env.convsDir, `${subId}.db`);
    const s = new DatabaseSync(subDbPath);
    s.exec("CREATE TABLE gen_metadata (idx INTEGER PRIMARY KEY, data BLOB, size INTEGER);");
    // Turn 0: prompt 5000, candidates 500
    const blob0 = createGenMetadataBlob(5000, 500);
    s.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(0, blob0, blob0.length);
    s.close();

    const db = new DatabaseSync(env.summariesDbPath);
    db.prepare(`
      INSERT INTO conversation_summaries (rowid, conversation_id, agent_name, status, not_fully_idle, step_count, killed, parent_conversation_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(1, subId, "dev", "running", 1, 1, 0, parentId);
    db.close();

    const cachePath = path.join(env.tmpDir, "inc_cache.json");
    const payload: Payload = { conversation_id: parentId };

    // Turn 0 query
    const res0 = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir, cachePath });
    assert.equal(res0.agents[1].activeTokens, 5000);
    assert.equal(res0.agents[1].cumulativeTokens, 5500);

    // Turn 1 added: prompt 6000, candidates 600
    const s2 = new DatabaseSync(subDbPath);
    const blob1 = createGenMetadataBlob(6000, 600);
    s2.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(1, blob1, blob1.length);
    s2.close();

    const db2 = new DatabaseSync(env.summariesDbPath);
    db2.prepare("UPDATE conversation_summaries SET step_count = 2 WHERE conversation_id = ?").run(subId);
    db2.close();

    // Turn 1 query: activeTokens is latest prompt (6000), cumulative is 5500 + 6600 = 12100
    const res1 = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir, cachePath });
    assert.equal(res1.agents[1].activeTokens, 6000);
    assert.equal(res1.agents[1].cumulativeTokens, 12100);
  } finally {
    env.cleanup();
  }
});

test("getSubagentStats treats killed agents as not running", () => {
  const env = createTestEnvironment();
  try {
    const parentId = "root-conv-kill";
    const subId = "sub-killed";

    const db = new DatabaseSync(env.summariesDbPath);
    db.prepare(`
      INSERT INTO conversation_summaries (rowid, conversation_id, agent_name, status, not_fully_idle, step_count, killed, parent_conversation_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(1, subId, "dev", "cancelled", 1, 2, 1, parentId);
    db.close();

    const payload: Payload = { conversation_id: parentId };
    const res = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir });
    assert.equal(res.hasActiveSubagents, false);
    assert.equal(res.agents[1].isRunning, false);
    assert.equal(res.agents[1].status, "idle");
  } finally {
    env.cleanup();
  }
});

test("getSubagentStats recognizes CASCADE_RUN_STATUS_RUNNING and resolves GEMINI_HOME subdirectory", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agy-gemini-home-"));
  try {
    const antigravityDir = path.join(tmpRoot, "antigravity-cli");
    const convsDir = path.join(antigravityDir, "conversations");
    fs.mkdirSync(convsDir, { recursive: true });

    const summariesDbPath = path.join(antigravityDir, "conversation_summaries.db");
    const db = new DatabaseSync(summariesDbPath);
    db.exec(`
      CREATE TABLE conversation_summaries (
        rowid INTEGER PRIMARY KEY,
        conversation_id TEXT,
        agent_name TEXT,
        status TEXT,
        not_fully_idle NUMERIC,
        step_count INTEGER,
        killed NUMERIC,
        parent_conversation_id TEXT
      );
    `);
    const parentId = "parent-env-test";
    const subId = "sub-running-status";
    db.prepare(`
      INSERT INTO conversation_summaries (rowid, conversation_id, agent_name, status, not_fully_idle, step_count, killed, parent_conversation_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(1, subId, "debugger", "CASCADE_RUN_STATUS_RUNNING", 0, 0, 0, parentId);
    db.close();

    const oldGeminiHome = process.env.GEMINI_HOME;
    const oldAgyHome = process.env.ANTIGRAVITY_CLI_HOME;
    delete process.env.ANTIGRAVITY_CLI_HOME;
    process.env.GEMINI_HOME = tmpRoot;

    try {
      const payload: Payload = { conversation_id: parentId };
      const res = getSubagentStats(parentId, payload);
      assert.equal(res.hasActiveSubagents, true);
      assert.equal(res.agents.length, 2);
      assert.equal(res.agents[1].role, "debugger");
      assert.equal(res.agents[1].isRunning, true);
      assert.equal(res.agents[1].status, "running");
    } finally {
      if (oldGeminiHome !== undefined) process.env.GEMINI_HOME = oldGeminiHome;
      else delete process.env.GEMINI_HOME;
      if (oldAgyHome !== undefined) process.env.ANTIGRAVITY_CLI_HOME = oldAgyHome;
      else delete process.env.ANTIGRAVITY_CLI_HOME;
    }
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test("sanitizeSubId sanitizes paths and handles nullish inputs safely", () => {
  assert.equal(sanitizeSubId("0bf58f0c-c1bd-491b-a208-4aee9d0a0536"), "0bf58f0c-c1bd-491b-a208-4aee9d0a0536");
  assert.equal(sanitizeSubId("../../../etc/passwd"), "etcpasswd");
  assert.equal(sanitizeSubId("..\\..\\secret-conv_1"), "secret-conv_1");
  assert.equal(sanitizeSubId("sub-agent:123/evil"), "sub-agent123evil");
  assert.equal(sanitizeSubId(null), "");
  assert.equal(sanitizeSubId(undefined), "");
  assert.equal(sanitizeSubId(""), "");
  assert.equal(sanitizeSubId(999 as any), "");
});

test("getSubagentStats degrades gracefully when databaseSync is unavailable", () => {
  const payload: Payload = {
    conversation_id: "root-conv-no-sqlite",
    context_window: { total_input_tokens: 100, total_output_tokens: 200 }
  };
  const result = getSubagentStats("root-conv-no-sqlite", payload, { databaseSync: null });
  assert.equal(result.hasActiveSubagents, false);
  assert.equal(result.agents.length, 1);
  assert.equal(result.agents[0].role, "root");
  assert.equal(result.agents[0].activeTokens, 100);
  assert.equal(result.agents[0].cumulativeTokens, 300);
});

test("getSubagentStats accumulates all newly completed turns when multiple turns elapse between renders", () => {
  const env = createTestEnvironment();
  try {
    const parentId = "root-conv-multi-turn";
    const subId = "sub-multi";

    const subDbPath = path.join(env.convsDir, `${subId}.db`);
    const s = new DatabaseSync(subDbPath);
    s.exec("CREATE TABLE gen_metadata (idx INTEGER PRIMARY KEY, data BLOB, size INTEGER);");

    // Turn 0: prompt 1000, candidates 100 -> 1100 tokens
    const blob0 = createGenMetadataBlob(1000, 100);
    s.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(0, blob0, blob0.length);
    s.close();

    const db = new DatabaseSync(env.summariesDbPath);
    db.prepare(`
      INSERT INTO conversation_summaries (rowid, conversation_id, agent_name, status, not_fully_idle, step_count, killed, parent_conversation_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(1, subId, "dev", "running", 1, 1, 0, parentId);
    db.close();

    const cachePath = path.join(env.tmpDir, "multi_cache.json");
    const payload: Payload = { conversation_id: parentId };

    // First render: turn 0
    const res0 = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir, cachePath });
    assert.equal(res0.agents[1].activeTokens, 1000);
    assert.equal(res0.agents[1].cumulativeTokens, 1100);

    // Subagent executes MULTIPLE turns between statusline renders: Turn 1 AND Turn 2
    const s2 = new DatabaseSync(subDbPath);
    // Turn 1: prompt 2000, candidates 200 -> 2200 tokens
    const blob1 = createGenMetadataBlob(2000, 200);
    s2.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(1, blob1, blob1.length);
    // Turn 2: prompt 3000, candidates 300 -> 3300 tokens
    const blob2 = createGenMetadataBlob(3000, 300);
    s2.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(2, blob2, blob2.length);
    s2.close();

    const db2 = new DatabaseSync(env.summariesDbPath);
    db2.prepare("UPDATE conversation_summaries SET step_count = 3 WHERE conversation_id = ?").run(subId);
    db2.close();

    // Second render: must incrementally sum BOTH turn 1 (2200) and turn 2 (3300) into cumulativeTokens:
    // 1100 + 2200 + 3300 = 6600
    // and activeTokens must be latest turn's promptTokens (3000)
    const res1 = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir, cachePath });
    assert.equal(res1.agents[1].activeTokens, 3000);
    assert.equal(res1.agents[1].cumulativeTokens, 6600);
  } finally {
    env.cleanup();
  }
});

test("getSubagentStats uncached discovery sums all existing turns across subagent history", () => {
  const env = createTestEnvironment();
  try {
    const parentId = "root-conv-uncached-multi";
    const subId = "sub-uncached-multi";

    const subDbPath = path.join(env.convsDir, `${subId}.db`);
    const s = new DatabaseSync(subDbPath);
    s.exec("CREATE TABLE gen_metadata (idx INTEGER PRIMARY KEY, data BLOB, size INTEGER);");

    // Pre-populate turns 0, 1, 2
    const blob0 = createGenMetadataBlob(1000, 100); // 1100
    const blob1 = createGenMetadataBlob(2000, 200); // 2200
    const blob2 = createGenMetadataBlob(4000, 400); // 4400
    s.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(0, blob0, blob0.length);
    s.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(1, blob1, blob1.length);
    s.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(2, blob2, blob2.length);
    s.close();

    const db = new DatabaseSync(env.summariesDbPath);
    db.prepare(`
      INSERT INTO conversation_summaries (rowid, conversation_id, agent_name, status, not_fully_idle, step_count, killed, parent_conversation_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(1, subId, "dev", "running", 1, 3, 0, parentId);
    db.close();

    const payload: Payload = { conversation_id: parentId };
    const res = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir });
    // Cumulative: 1100 + 2200 + 4400 = 7700
    assert.equal(res.agents[1].activeTokens, 4000);
    assert.equal(res.agents[1].cumulativeTokens, 7700);
  } finally {
    env.cleanup();
  }
});

test("warning filter preserves other warning listeners and emits non-sqlite warnings", async () => {
  let customWarningEmitted = false;
  let sqliteWarningEmitted = false;
  const testListener = (warning: any) => {
    const msg = typeof warning === "string" ? warning : (warning?.message || "");
    if (msg.includes("TestCustomWarning123")) {
      customWarningEmitted = true;
    }
    if (/sqlite/i.test(msg)) {
      sqliteWarningEmitted = true;
    }
  };
  process.on("warning", testListener);
  try {
    // Emit experimental sqlite warning: must be suppressed
    process.emitWarning("SQLite is an experimental feature", "ExperimentalWarning");
    // Emit non-sqlite warning: must not be suppressed
    process.emitWarning("TestCustomWarning123", "CustomWarning");

    await new Promise((resolve) => setTimeout(resolve, 20));

    assert.equal(sqliteWarningEmitted, false);
    assert.equal(customWarningEmitted, true);
  } finally {
    process.removeListener("warning", testListener);
  }
});

test("getSubagentStats calculates root cumulative tokens across multiple turns from gen_metadata", () => {
  const env = createTestEnvironment();
  try {
    const parentId = "root-conv-multi";
    const rootDbPath = path.join(env.convsDir, `${parentId}.db`);
    const rDb = new DatabaseSync(rootDbPath);
    rDb.exec("CREATE TABLE gen_metadata (idx INTEGER PRIMARY KEY, data BLOB, size INTEGER);");
    const b0 = createGenMetadataBlob(5000, 1000);
    const b1 = createGenMetadataBlob(8000, 2000);
    const b2 = createGenMetadataBlob(12000, 3000);
    rDb.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(0, b0, b0.length);
    rDb.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(1, b1, b1.length);
    rDb.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(2, b2, b2.length);
    rDb.close();

    const cachePath = path.join(env.tmpDir, "cache_v2.json");
    const payload: Payload = {
      conversation_id: parentId,
      context_window: { total_input_tokens: 12000, total_output_tokens: 3000 },
    };

    const res = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir, cachePath });
    const root = res.agents[0];
    assert.equal(root.activeTokens, 12000);
    assert.equal(root.cumulativeTokens, 31000); // 6000 + 10000 + 15000

    // Verify cache file
    const cacheContent = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    assert.equal(cacheContent.version, 3);
    assert.equal(cacheContent.rootLastIdx, 2);
    assert.equal(cacheContent.rootCumulative, 31000);
  } finally {
    env.cleanup();
  }
});

test("getSubagentStats incrementally updates root tokens on subsequent calls", () => {
  const env = createTestEnvironment();
  try {
    const parentId = "root-conv-inc";
    const rootDbPath = path.join(env.convsDir, `${parentId}.db`);
    const rDb = new DatabaseSync(rootDbPath);
    rDb.exec("CREATE TABLE gen_metadata (idx INTEGER PRIMARY KEY, data BLOB, size INTEGER);");
    const b0 = createGenMetadataBlob(5000, 1000);
    rDb.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(0, b0, b0.length);
    rDb.close();

    const cachePath = path.join(env.tmpDir, "cache_inc.json");
    const payload1: Payload = {
      conversation_id: parentId,
      context_window: { total_input_tokens: 5000, total_output_tokens: 1000 },
    };

    const res1 = getSubagentStats(parentId, payload1, { geminiHome: env.tmpDir, cachePath });
    assert.equal(res1.agents[0].cumulativeTokens, 6000);

    // Add turn 1 to root DB
    const rDb2 = new DatabaseSync(rootDbPath);
    const b1 = createGenMetadataBlob(10000, 4000);
    rDb2.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(1, b1, b1.length);
    rDb2.close();

    const payload2: Payload = {
      conversation_id: parentId,
      context_window: { total_input_tokens: 10000, total_output_tokens: 4000 },
    };

    const res2 = getSubagentStats(parentId, payload2, { geminiHome: env.tmpDir, cachePath });
    assert.equal(res2.agents[0].activeTokens, 10000);
    assert.equal(res2.agents[0].cumulativeTokens, 20000); // 6000 + 14000

    const cacheContent = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    assert.equal(cacheContent.rootLastIdx, 1);
    assert.equal(cacheContent.rootCumulative, 20000);
  } finally {
    env.cleanup();
  }
});

test("getSubagentStats invalidates and resets cache when cache version !== 3", () => {
  const env = createTestEnvironment();
  try {
    const parentId = "root-conv-v1-inval";
    const subId = "sub-v1-inval";

    // Setup subagent db with 2 turns (total 25000)
    const subDbPath = path.join(env.convsDir, `${subId}.db`);
    const sDb = new DatabaseSync(subDbPath);
    sDb.exec("CREATE TABLE gen_metadata (idx INTEGER PRIMARY KEY, data BLOB, size INTEGER);");
    const b0 = createGenMetadataBlob(10000, 2000);
    const b1 = createGenMetadataBlob(11000, 2000);
    sDb.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(0, b0, b0.length);
    sDb.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(1, b1, b1.length);
    sDb.close();

    // Summaries table
    const db = new DatabaseSync(env.summariesDbPath);
    db.prepare(`
      INSERT INTO conversation_summaries (rowid, conversation_id, agent_name, status, not_fully_idle, step_count, killed, parent_conversation_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(1, subId, "dev", "running", 1, 2, 0, parentId);
    db.close();

    // Write stale v2 cache file
    const cachePath = path.join(env.tmpDir, "cache_v2.json");
    fs.writeFileSync(cachePath, JSON.stringify({
      version: 2,
      updatedAt: "2025-01-01T00:00:00.000Z",
      rootCumulative: 999,
      agents: {
        [subId]: {
          id: subId,
          role: "dev",
          status: "running",
          notFullyIdle: 1,
          killed: 0,
          lastIdx: 1,
          activeTokens: 11000,
          cumulativeTokens: 50, // stale single turn or corrupted data
        }
      }
    }), "utf8");

    const payload: Payload = {
      conversation_id: parentId,
      context_window: { total_input_tokens: 3000, total_output_tokens: 500 },
    };

    const res = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir, cachePath });
    // Stale v2 cache must have been discarded: subagent tokens computed from idx=0
    assert.equal(res.agents[1].cumulativeTokens, 25000);
    assert.equal(res.agents[1].activeTokens, 11000);

    // Overwritten cache should now be version 3
    const freshCache = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    assert.equal(freshCache.version, 3);
    assert.equal(freshCache.agents[subId].cumulativeTokens, 25000);
  } finally {
    env.cleanup();
  }
});

function encodeString(fieldNum: number, str: string): Uint8Array {
  return encodeLengthDelimited(fieldNum, new TextEncoder().encode(str));
}

function createFullGenMetadataBlob(
  promptTokens: number,
  candidatesTokens: number,
  categories: Array<{ name: string; tokens: number; subItems?: Record<string, number> }>
): Uint8Array {
  const promptField = concat(encodeTag(2, 0), encodeVarint(promptTokens));
  const candidateField = concat(encodeTag(3, 0), encodeVarint(candidatesTokens));
  const usageMetadata = encodeLengthDelimited(4, concat(promptField, candidateField));

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

  return encodeLengthDelimited(1, concat(usageMetadata, f9));
}

test("getSubagentStats extracts context tree active tokens when present in gen_metadata", () => {
  const env = createTestEnvironment();
  try {
    const parentId = "root-tree-parent";
    const subId = "sub-tree-1";

    const subDbPath = path.join(env.convsDir, `${subId}.db`);
    const sDb = new DatabaseSync(subDbPath);
    sDb.exec("CREATE TABLE gen_metadata (idx INTEGER PRIMARY KEY, data BLOB, size INTEGER);");

    // Turn 0: promptTokens=4000, candidatesTokens=500, but ContextTree has 100,300 total active tokens
    const blob0 = createFullGenMetadataBlob(4000, 500, [
      { name: "System Prompt", tokens: 7000, subItems: { skills: 4000 } },
      { name: "Tools", tokens: 5800 },
      { name: "Chat Messages", tokens: 87500 },
    ]);
    sDb.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(0, blob0, blob0.length);
    sDb.close();

    const db = new DatabaseSync(env.summariesDbPath);
    db.prepare(`
      INSERT INTO conversation_summaries (rowid, conversation_id, agent_name, status, not_fully_idle, step_count, killed, parent_conversation_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(1, subId, "dev", "running", 1, 1, 0, parentId);
    db.close();

    const payload: Payload = {
      conversation_id: parentId,
      context_window: { total_input_tokens: 2000, total_output_tokens: 500 },
    };

    const res = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir });
    assert.equal(res.agents[1].activeTokens, 100300); // exact context tree active, NOT 4000!
    assert.equal(res.agents[1].cumulativeTokens, 4500); // 4000 + 500
  } finally {
    env.cleanup();
  }
});

test("verify live subagent f202ae42-ad02-47e3-a967-89528bfbdc3b matches web app active and cumulative tokens", () => {
  const liveDbPath = path.join(
    os.homedir(),
    ".gemini",
    "antigravity-cli",
    "conversations",
    "f202ae42-ad02-47e3-a967-89528bfbdc3b.db"
  );
  if (!fs.existsSync(liveDbPath)) {
    return;
  }

  const liveDb = new DatabaseSync(liveDbPath, { readOnly: true });
  const row = liveDb.prepare("SELECT data FROM gen_metadata ORDER BY idx DESC LIMIT 1").get() as { data: Uint8Array } | undefined;
  assert.ok(row && row.data);

  // Test full subagentTracker against parent eaecf19a-6e95-4830-9fbe-0c34a47ef60c
  const parentId = "eaecf19a-6e95-4830-9fbe-0c34a47ef60c";
  const stats = getSubagentStats(parentId, { context_window: { total_input_tokens: 1000, total_output_tokens: 500 } });
  const targetSub = stats.agents.find(a => a.id === "f202ae42-ad02-47e3-a967-89528bfbdc3b");
  assert.ok(targetSub, "Target subagent f202ae42-ad02-47e3-a967-89528bfbdc3b found in tracker stats");
  assert.ok(targetSub.activeTokens >= 100000, `Expected subagent activeTokens >= 100k, got ${targetSub.activeTokens}`);
  assert.ok(targetSub.cumulativeTokens >= 331000, `Expected subagent cumulativeTokens >= 331k, got ${targetSub.cumulativeTokens}`);
});

test("WAL Stat Guard (Tier 1): returns cached result immediately without opening summaries DB when stats match and no active subagents", () => {
  const env = createTestEnvironment();
  try {
    const parentId = "root-wal-guard";
    const subId = "sub-idle-wal";

    const subDbPath = path.join(env.convsDir, `${subId}.db`);
    const s = new DatabaseSync(subDbPath);
    s.exec("CREATE TABLE gen_metadata (idx INTEGER PRIMARY KEY, data BLOB, size INTEGER);");
    const blob = createGenMetadataBlob(4000, 1000);
    s.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(0, blob, blob.length);
    s.close();

    const db = new DatabaseSync(env.summariesDbPath);
    db.prepare(`
      INSERT INTO conversation_summaries (rowid, conversation_id, agent_name, status, not_fully_idle, step_count, killed, parent_conversation_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(1, subId, "dev", "idle", 0, 1, 0, parentId);
    db.close();

    const cachePath = path.join(env.tmpDir, "wal_cache.json");
    const payload: Payload = { conversation_id: parentId };

    const openedPaths: string[] = [];
    class TrackingDb extends DatabaseSync {
      constructor(location: string, options?: any) {
        super(location, options);
        openedPaths.push(location);
      }
    }

    // First call: populates cache with summaries file stats
    const res1 = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir, cachePath, databaseSync: TrackingDb as any });
    assert.equal(res1.hasActiveSubagents, false);
    assert.equal(res1.agents.length, 2);
    assert.equal(res1.agents[1].activeTokens, 4000);
    assert.equal(res1.agents[1].cumulativeTokens, 5000);
    assert.ok(openedPaths.includes(env.summariesDbPath));

    const cacheContent = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    assert.ok(typeof cacheContent.summariesMtime === "number" && cacheContent.summariesMtime > 0);
    assert.equal(cacheContent.summariesWalMtime, 0);
    assert.equal(cacheContent.summariesWalSize, 0);

    // Second call: WAL stat guard engages -> 0 DB opens!
    openedPaths.length = 0;
    const res2 = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir, cachePath, databaseSync: TrackingDb as any });
    assert.equal(openedPaths.length, 0, "No database files should be opened when WAL stat guard is active");
    assert.equal(res2.hasActiveSubagents, false);
    assert.equal(res2.agents.length, 2);
    assert.equal(res2.agents[1].id, subId);
    assert.equal(res2.agents[1].activeTokens, 4000);
    assert.equal(res2.agents[1].cumulativeTokens, 5000);

    // Now write to WAL file: stat guard must invalidate and open summaries DB!
    const walPath = env.summariesDbPath + "-wal";
    fs.writeFileSync(walPath, "dummy-wal-content");
    openedPaths.length = 0;

    const res3 = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir, cachePath, databaseSync: TrackingDb as any });
    assert.ok(openedPaths.includes(env.summariesDbPath), "Summaries DB should be opened when WAL file stat changes");
    const updatedCache = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    assert.ok(updatedCache.summariesWalSize > 0);
  } finally {
    env.cleanup();
  }
});

test("WAL Stat Guard (Tier 1): does NOT skip opening summaries DB when active subagent is in cache", () => {
  const env = createTestEnvironment();
  try {
    const parentId = "root-wal-active";
    const subId = "sub-active-wal";

    const subDbPath = path.join(env.convsDir, `${subId}.db`);
    const s = new DatabaseSync(subDbPath);
    s.exec("CREATE TABLE gen_metadata (idx INTEGER PRIMARY KEY, data BLOB, size INTEGER);");
    const blob = createGenMetadataBlob(3000, 500);
    s.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(0, blob, blob.length);
    s.close();

    const db = new DatabaseSync(env.summariesDbPath);
    db.prepare(`
      INSERT INTO conversation_summaries (rowid, conversation_id, agent_name, status, not_fully_idle, step_count, killed, parent_conversation_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(1, subId, "dev", "running", 1, 1, 0, parentId);
    db.close();

    const cachePath = path.join(env.tmpDir, "wal_active_cache.json");
    const payload: Payload = { conversation_id: parentId };

    const openedPaths: string[] = [];
    class TrackingDb extends DatabaseSync {
      constructor(location: string, options?: any) {
        super(location, options);
        openedPaths.push(location);
      }
    }

    // First call: active agent is running
    const res1 = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir, cachePath, databaseSync: TrackingDb as any });
    assert.equal(res1.hasActiveSubagents, true);

    // Second call: summaries DB files are identical, but active subagent is in cache -> must NOT skip summaries DB!
    openedPaths.length = 0;
    const res2 = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir, cachePath, databaseSync: TrackingDb as any });
    assert.ok(openedPaths.includes(env.summariesDbPath), "Summaries DB must be opened when active subagent is in cache");
  } finally {
    env.cleanup();
  }
});

test("Active Subagent: always queries subagent DB and updates tokens even when step_count in summaries is unchanged", () => {
  const env = createTestEnvironment();
  try {
    const parentId = "root-step-gate";
    const subId = "sub-active-step";

    const subDbPath = path.join(env.convsDir, `${subId}.db`);
    const s = new DatabaseSync(subDbPath);
    s.exec("CREATE TABLE gen_metadata (idx INTEGER PRIMARY KEY, data BLOB, size INTEGER);");
    // Turn 0: prompt 7000, candidates 1500
    const blob0 = createGenMetadataBlob(7000, 1500);
    s.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(0, blob0, blob0.length);
    s.close();

    const db = new DatabaseSync(env.summariesDbPath);
    db.prepare(`
      INSERT INTO conversation_summaries (rowid, conversation_id, agent_name, status, not_fully_idle, step_count, killed, parent_conversation_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(1, subId, "dev", "running", 1, 5, 0, parentId);
    db.close();

    const cachePath = path.join(env.tmpDir, "step_gate_cache.json");
    const payload: Payload = { conversation_id: parentId };

    const openedPaths: string[] = [];
    class TrackingDb extends DatabaseSync {
      constructor(location: string, options?: any) {
        super(location, options);
        openedPaths.push(location);
      }
    }

    // First call: populates cache with turn 0 and stepCount = 5
    const res1 = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir, cachePath, databaseSync: TrackingDb as any });
    assert.equal(res1.hasActiveSubagents, true);
    assert.equal(res1.agents[1].activeTokens, 7000);
    assert.equal(res1.agents[1].cumulativeTokens, 8500);
    assert.ok(openedPaths.includes(subDbPath));

    const cacheContent = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    assert.equal(cacheContent.agents[subId].stepCount, 5);

    // Turn 1 added to subDbPath, but step_count in conversation_summaries remains 5 (lagging step_count)!
    const s2 = new DatabaseSync(subDbPath);
    const blob1 = createGenMetadataBlob(9000, 2000);
    s2.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(1, blob1, blob1.length);
    s2.close();

    // Second call: step_count is STILL 5 -> subagent DB MUST be queried and tokens updated live!
    openedPaths.length = 0;
    const res2 = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir, cachePath, databaseSync: TrackingDb as any });
    assert.ok(openedPaths.includes(env.summariesDbPath), "Summaries DB was checked");
    assert.ok(openedPaths.includes(subDbPath), "Running subagent DB MUST always be queried for live updates");
    assert.equal(res2.agents[1].activeTokens, 9000);
    assert.equal(res2.agents[1].cumulativeTokens, 19500); // 8500 + 11000

    // Third call without new turns: subagent DB is still queried but tokens remain current
    openedPaths.length = 0;
    const res3 = getSubagentStats(parentId, payload, { geminiHome: env.tmpDir, cachePath, databaseSync: TrackingDb as any });
    assert.ok(openedPaths.includes(subDbPath));
    assert.equal(res3.agents[1].activeTokens, 9000);
    assert.equal(res3.agents[1].cumulativeTokens, 19500);
  } finally {
    env.cleanup();
  }
});

test("WAL Stat Guard (Tier 1): does NOT skip opening summaries DB when payload.agent_state !== 'idle'", () => {
  const env = createTestEnvironment();
  try {
    const parentId = "root-wal-state-check";
    const subId = "sub-idle-agent";

    const subDbPath = path.join(env.convsDir, `${subId}.db`);
    const s = new DatabaseSync(subDbPath);
    s.exec("CREATE TABLE gen_metadata (idx INTEGER PRIMARY KEY, data BLOB, size INTEGER);");
    const blob = createGenMetadataBlob(2000, 500);
    s.prepare("INSERT INTO gen_metadata (idx, data, size) VALUES (?, ?, ?)").run(0, blob, blob.length);
    s.close();

    const db = new DatabaseSync(env.summariesDbPath);
    db.prepare(`
      INSERT INTO conversation_summaries (rowid, conversation_id, agent_name, status, not_fully_idle, step_count, killed, parent_conversation_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(1, subId, "dev", "idle", 0, 1, 0, parentId);
    db.close();

    const cachePath = path.join(env.tmpDir, "wal_active_state_cache.json");
    const payloadIdle: Payload = { conversation_id: parentId, agent_state: "idle" };

    const openedPaths: string[] = [];
    class TrackingDb extends DatabaseSync {
      constructor(location: string, options?: any) {
        super(location, options);
        openedPaths.push(location);
      }
    }

    // Call 1: populates cache
    getSubagentStats(parentId, payloadIdle, { geminiHome: env.tmpDir, cachePath, databaseSync: TrackingDb as any });
    assert.ok(openedPaths.includes(env.summariesDbPath));

    // Call 2: idle with unchanged stats -> WAL stat guard engages (0 opens)
    openedPaths.length = 0;
    getSubagentStats(parentId, payloadIdle, { geminiHome: env.tmpDir, cachePath, databaseSync: TrackingDb as any });
    assert.equal(openedPaths.length, 0, "Should skip DB opens when idle and files unchanged");

    // Call 3: agent_state is 'thinking' -> WAL stat guard must NOT skip opening summaries DB!
    openedPaths.length = 0;
    const payloadActive: Payload = { conversation_id: parentId, agent_state: "thinking" };
    const resActive = getSubagentStats(parentId, payloadActive, { geminiHome: env.tmpDir, cachePath, databaseSync: TrackingDb as any });
    assert.ok(openedPaths.includes(env.summariesDbPath), "Summaries DB must be opened when payload.agent_state !== 'idle'");
    assert.equal(resActive.agents[0].status, "thinking");
  } finally {
    env.cleanup();
  }
});

