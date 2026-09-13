import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { decodeUsageMetadata, extractContextTree } from "./protobuf";
import type { Payload } from "./statusline";

// Targeted filter for experimental SQLite warning
try {
  const origEmitWarning = process.emitWarning;
  if (typeof origEmitWarning === "function") {
    (process as any).emitWarning = function (warning: any, ...args: any[]) {
      const msg = typeof warning === "string" ? warning : (warning?.message || "");
      if (/sqlite/i.test(msg)) {
        return;
      }
      return origEmitWarning.call(process, warning, ...args);
    };
  }
} catch {
  // ignore
}

import type { DatabaseSync as DatabaseSyncType } from "node:sqlite";

// Resilient loading of node:sqlite
let DatabaseSyncClass: typeof DatabaseSyncType | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sqlite = require("node:sqlite");
  DatabaseSyncClass = sqlite?.DatabaseSync ?? null;
} catch {
  DatabaseSyncClass = null;
}

export interface AgentTokenStats {
  index: number;         // 0 for root, 1, 2, ... for subagents
  id: string;            // UUID
  role: string;          // "root" for root, agent_name for subagents
  status: string;        // "running" | "idle"
  isRunning: boolean;    // not_fully_idle === 1 && killed === 0
  activeTokens: number;  // latest context window tokens
  cumulativeTokens: number; // total ingested prompt + output
}

export interface SubagentTrackerResult {
  hasActiveSubagents: boolean;
  agents: AgentTokenStats[];
}

export interface SubagentTrackerOptions {
  geminiHome?: string;
  cachePath?: string;
  databaseSync?: typeof DatabaseSyncType | null;
}

export function sanitizeSubId(subId: unknown): string {
  if (!subId || typeof subId !== "string") return "";
  return subId.trim().replace(/[^a-zA-Z0-9_-]/g, "");
}

export interface CachedSubagent {
  rowid?: number;
  id: string;
  role: string;
  status: string;
  notFullyIdle: number;
  killed: number;
  lastIdx: number;
  activeTokens: number;
  cumulativeTokens: number;
  stepCount?: number | null;
}

export interface SubagentCacheData {
  version: 3;
  updatedAt: string;
  rootLastIdx?: number;
  rootCumulative?: number;
  rootActiveTokens?: number;
  summariesMtime?: number;
  summariesWalMtime?: number;
  summariesWalSize?: number;
  summariesDbSize?: number;
  summariesRowCount?: number;
  agents: Record<string, CachedSubagent>;
}

interface SummaryRow {
  rowid: number;
  conversation_id: string;
  agent_name: string | null;
  status: string | null;
  not_fully_idle: number | null;
  step_count: number | null;
  killed: number | null;
}

interface GenMetadataRow {
  idx: number;
  data: Uint8Array;
}

export function getSubagentStats(
  conversationId: string,
  payload: Payload,
  options: SubagentTrackerOptions = {}
): SubagentTrackerResult {
  const rootInputTokens = payload.context_window?.total_input_tokens ?? 0;
  const rootOutputTokens = payload.context_window?.total_output_tokens ?? 0;

  const DbClass = options.databaseSync !== undefined ? options.databaseSync : DatabaseSyncClass;
  if (!DbClass || !conversationId) {
    const rootAgent: AgentTokenStats = {
      index: 0,
      id: conversationId || "",
      role: "root",
      status: payload.agent_state || "idle",
      isRunning: false,
      activeTokens: rootInputTokens,
      cumulativeTokens: rootInputTokens + rootOutputTokens,
    };
    return { hasActiveSubagents: false, agents: [rootAgent] };
  }

  let geminiHome = options.geminiHome || process.env.ANTIGRAVITY_CLI_HOME;
  if (!geminiHome) {
    const envHome = process.env.GEMINI_HOME || process.env.GEMINI_DIR;
    if (envHome) {
      const sub = path.join(envHome, "antigravity-cli");
      if (fs.existsSync(path.join(sub, "conversation_summaries.db"))) {
        geminiHome = sub;
      } else if (fs.existsSync(path.join(envHome, "conversation_summaries.db"))) {
        geminiHome = envHome;
      }
    }
  }
  if (!geminiHome) {
    geminiHome = path.join(os.homedir(), ".gemini", "antigravity-cli");
  }

  // Load cache if available
  let cache: SubagentCacheData = {
    version: 3,
    updatedAt: new Date().toISOString(),
    rootLastIdx: -1,
    rootCumulative: 0,
    rootActiveTokens: 0,
    agents: {},
  };
  let cacheModified = false;
  const cachePath = options.cachePath;
  if (cachePath) {
    try {
      if (fs.existsSync(cachePath)) {
        const raw = JSON.parse(fs.readFileSync(cachePath, "utf8"));
        if (raw && raw.version === 3 && typeof raw.agents === "object" && raw.agents !== null) {
          cache = raw as SubagentCacheData;
          if (!cache.agents) {
            cache.agents = {};
          }
        } else {
          cacheModified = true;
        }
      }
    } catch {
      cache = {
        version: 3,
        updatedAt: new Date().toISOString(),
        rootLastIdx: -1,
        rootCumulative: 0,
        rootActiveTokens: 0,
        agents: {},
      };
      cacheModified = true;
    }
  }

  const flushCache = () => {
    if (cacheModified && cachePath) {
      try {
        fs.mkdirSync(path.dirname(cachePath), { recursive: true });
        cache.updatedAt = new Date().toISOString();
        fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), "utf8");
      } catch {
        // ignore cache write error
      }
    }
  };

  // 1. Root token computation & incremental caching
  let rootActiveTokens = (cache.rootActiveTokens && cache.rootActiveTokens > 0) ? cache.rootActiveTokens : rootInputTokens;
  let rootCumulativeTokens = cache.rootCumulative ?? 0;
  let rootLastIdx = cache.rootLastIdx ?? -1;

  const convsDir = path.resolve(geminiHome, "conversations");
  const sanitizedRootId = sanitizeSubId(conversationId);
  const rootDbPath = path.resolve(convsDir, `${sanitizedRootId}.db`);

  if (rootDbPath.startsWith(convsDir) && fs.existsSync(rootDbPath)) {
    let rootRows: GenMetadataRow[] = [];
    try {
      const rootDb = new DbClass(rootDbPath, { readOnly: true });
      try {
        rootDb.exec("PRAGMA busy_timeout = 200;");
        const stmt = rootDb.prepare("SELECT idx, data FROM gen_metadata WHERE idx > ? ORDER BY idx ASC");
        rootRows = stmt.all(rootLastIdx) as unknown as GenMetadataRow[];
      } finally {
        rootDb.close();
      }
    } catch {
      // ignore read error
    }

    if (rootRows.length > 0) {
      let latestRootPrompt = 0;
      for (const rRow of rootRows) {
        if (rRow.data) {
          const usage = decodeUsageMetadata(rRow.data);
          if (usage) {
            latestRootPrompt = usage.promptTokens;
            rootCumulativeTokens += usage.promptTokens + usage.candidatesTokens;
            rootLastIdx = rRow.idx;
            cacheModified = true;
          }
        }
      }

      let treeTokens: number | null = null;
      for (let j = rootRows.length - 1; j >= 0; j--) {
        if (rootRows[j].data) {
          treeTokens = extractContextTree(rootRows[j].data);
          if (treeTokens !== null && treeTokens > 0) {
            break;
          }
        }
      }

      if (treeTokens !== null && treeTokens > 0) {
        rootActiveTokens = treeTokens;
      } else if (latestRootPrompt > 0) {
        rootActiveTokens = latestRootPrompt;
      } else if (rootActiveTokens === 0 && rootInputTokens > 0) {
        rootActiveTokens = rootInputTokens;
      }

      cache.rootLastIdx = rootLastIdx;
      cache.rootCumulative = rootCumulativeTokens;
      cache.rootActiveTokens = rootActiveTokens;
    }
  }

  // Fallback if root cumulative is still 0 (no DB or no gen_metadata rows)
  if (rootCumulativeTokens === 0) {
    rootCumulativeTokens = rootInputTokens + rootOutputTokens;
  }

  const rootAgent: AgentTokenStats = {
    index: 0,
    id: conversationId || "",
    role: "root",
    status: payload.agent_state || "idle",
    isRunning: false,
    activeTokens: rootActiveTokens,
    cumulativeTokens: rootCumulativeTokens,
  };

  const summariesDbPath = path.join(geminiHome, "conversation_summaries.db");
  const summariesWalPath = summariesDbPath + "-wal";

  let dbStat: fs.Stats | null = null;
  try {
    dbStat = fs.statSync(summariesDbPath);
  } catch {
    // summaries db does not exist or cannot be accessed
  }

  if (!dbStat) {
    flushCache();
    return { hasActiveSubagents: false, agents: [rootAgent] };
  }

  let walStat: fs.Stats | null = null;
  try {
    walStat = fs.statSync(summariesWalPath);
  } catch {
    // WAL file may not exist
  }

  const currentDbMtime = dbStat.mtimeMs;
  const currentWalMtime = walStat ? walStat.mtimeMs : 0;
  const currentWalSize = walStat ? walStat.size : 0;
  const currentDbSize = dbStat.size;

  const agentState = (payload.agent_state || "idle").trim().toLowerCase();
  const isAgentActive = agentState !== "idle";

  const hasActiveInCache = Object.values(cache.agents).some(
    a => a.status === "running" || a.status === "CASCADE_RUN_STATUS_RUNNING" || (a.notFullyIdle === 1 && a.killed === 0)
  );

  // WAL Stat Guard (Tier 1):
  // If cache stats match current file stats, root agent is idle, and no active subagents in cache,
  // return cached result immediately without opening conversation_summaries.db!
  if (
    !isAgentActive &&
    !hasActiveInCache &&
    cache.summariesMtime !== undefined &&
    cache.summariesWalMtime !== undefined &&
    cache.summariesWalSize !== undefined &&
    cache.summariesMtime === currentDbMtime &&
    cache.summariesWalMtime === currentWalMtime &&
    cache.summariesWalSize === currentWalSize &&
    (cache.summariesDbSize === undefined || cache.summariesDbSize === currentDbSize)
  ) {
    flushCache();
    const cachedAgents = Object.values(cache.agents).sort((a, b) => (a.rowid ?? 0) - (b.rowid ?? 0));
    const subagents: AgentTokenStats[] = cachedAgents.map((a, idx) => ({
      index: idx + 1,
      id: a.id,
      role: a.role,
      status: a.status,
      isRunning: false,
      activeTokens: a.activeTokens,
      cumulativeTokens: a.cumulativeTokens,
    }));
    return {
      hasActiveSubagents: false,
      agents: [rootAgent, ...subagents],
    };
  }

  let rows: SummaryRow[] = [];
  try {
    const db = new DbClass(summariesDbPath, { readOnly: true });
    try {
      db.exec("PRAGMA busy_timeout = 200;");
      const stmt = db.prepare(
        "SELECT rowid, conversation_id, agent_name, status, not_fully_idle, step_count, killed " +
        "FROM conversation_summaries WHERE parent_conversation_id = ? ORDER BY rowid ASC"
      );
      rows = stmt.all(conversationId) as unknown as SummaryRow[];
    } finally {
      db.close();
    }
  } catch {
    flushCache();
    return { hasActiveSubagents: false, agents: [rootAgent] };
  }

  if (
    cache.summariesMtime !== currentDbMtime ||
    cache.summariesWalMtime !== currentWalMtime ||
    cache.summariesWalSize !== currentWalSize ||
    cache.summariesDbSize !== currentDbSize ||
    cache.summariesRowCount !== rows.length
  ) {
    cache.summariesMtime = currentDbMtime;
    cache.summariesWalMtime = currentWalMtime;
    cache.summariesWalSize = currentWalSize;
    cache.summariesDbSize = currentDbSize;
    cache.summariesRowCount = rows.length;
    cacheModified = true;
  }

  if (rows.length === 0) {
    flushCache();
    return { hasActiveSubagents: false, agents: [rootAgent] };
  }

  const subagents: AgentTokenStats[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const subId = sanitizeSubId(row.conversation_id);
    if (!subId) {
      continue;
    }
    const role = (row.agent_name && row.agent_name.trim() !== "") ? row.agent_name.trim() : "subagent";
    const notFullyIdle = Number(row.not_fully_idle ?? 0);
    const killed = Number(row.killed ?? 0);
    const isRunning = (notFullyIdle === 1 || row.status === "CASCADE_RUN_STATUS_RUNNING" || row.status === "running") && killed === 0;
    const status = isRunning ? "running" : "idle";

    const cached = cache.agents[subId];

    let activeTokens = 0;
    let cumulativeTokens = 0;
    let lastIdx = cached?.lastIdx ?? -1;

    const wasRunning = cached && (cached.status === "running" || cached.status === "CASCADE_RUN_STATUS_RUNNING" || (cached.notFullyIdle === 1 && cached.killed === 0));

    // 1. Idle subagent short-circuit: If not running, was not previously running, and cached, never open <uuid>.db
    if (!isRunning && cached && !wasRunning) {
      activeTokens = cached.activeTokens;
      cumulativeTokens = cached.cumulativeTokens;
      if (
        cached.status !== status ||
        cached.notFullyIdle !== notFullyIdle ||
        cached.killed !== killed ||
        cached.rowid !== row.rowid
      ) {
        cached.status = status;
        cached.notFullyIdle = notFullyIdle;
        cached.killed = killed;
        cached.rowid = row.rowid;
        cacheModified = true;
      }
      if (row.step_count !== null && row.step_count !== undefined && cached.stepCount !== row.step_count) {
        cached.stepCount = row.step_count;
        cacheModified = true;
      }
    } else {
      // 2. Running subagent (isRunning === true), subagent transitioning to idle (wasRunning === true),
      // or uncached subagent: ALWAYS query SELECT idx, data FROM gen_metadata WHERE idx > ? ORDER BY idx ASC.
      // (Because idx is primary key and only 1-2 subagents run concurrently, this indexed seek takes <1ms
      // and guarantees live real-time token updates on every turn without relying on lagging step_count).
      const subDbPath = path.resolve(convsDir, `${subId}.db`);
      let fetchedRows: GenMetadataRow[] = [];
      if (subDbPath.startsWith(convsDir) && fs.existsSync(subDbPath)) {
        try {
          const subDb = new DbClass(subDbPath, { readOnly: true });
          try {
            subDb.exec("PRAGMA busy_timeout = 200;");
            const stmt = subDb.prepare("SELECT idx, data FROM gen_metadata WHERE idx > ? ORDER BY idx ASC");
            fetchedRows = stmt.all(lastIdx) as unknown as GenMetadataRow[];
          } finally {
            subDb.close();
          }
        } catch {
          // ignore read error
        }
      }

      if (cached) {
        activeTokens = cached.activeTokens;
        cumulativeTokens = cached.cumulativeTokens;
      }

      if (fetchedRows.length > 0) {
        let latestPromptTokens = 0;
        for (const fRow of fetchedRows) {
          if (fRow.data) {
            const usage = decodeUsageMetadata(fRow.data);
            if (usage) {
              latestPromptTokens = usage.promptTokens;
              cumulativeTokens += usage.promptTokens + usage.candidatesTokens;
              lastIdx = fRow.idx;
            }
          }
        }

        let treeTokens: number | null = null;
        for (let j = fetchedRows.length - 1; j >= 0; j--) {
          if (fetchedRows[j].data) {
            treeTokens = extractContextTree(fetchedRows[j].data);
            if (treeTokens !== null && treeTokens > 0) {
              break;
            }
          }
        }

        if (treeTokens !== null && treeTokens > 0) {
          activeTokens = treeTokens;
        } else if (latestPromptTokens > 0) {
          activeTokens = latestPromptTokens;
        }
      }

      const prev = cache.agents[subId];
      if (
        !prev ||
        prev.rowid !== row.rowid ||
        prev.status !== status ||
        prev.notFullyIdle !== notFullyIdle ||
        prev.killed !== killed ||
        prev.lastIdx !== lastIdx ||
        prev.activeTokens !== activeTokens ||
        prev.cumulativeTokens !== cumulativeTokens ||
        prev.stepCount !== row.step_count
      ) {
        cache.agents[subId] = {
          rowid: row.rowid,
          id: subId,
          role,
          status,
          notFullyIdle,
          killed,
          lastIdx,
          activeTokens,
          cumulativeTokens,
          stepCount: isRunning ? row.step_count : (row.step_count ?? undefined),
        };
        cacheModified = true;
      }
    }

    subagents.push({
      index: subagents.length + 1,
      id: subId,
      role,
      status,
      isRunning,
      activeTokens,
      cumulativeTokens,
    });
  }

  flushCache();

  const hasActiveSubagents = subagents.some(a => a.isRunning);
  return {
    hasActiveSubagents,
    agents: [rootAgent, ...subagents],
  };
}
