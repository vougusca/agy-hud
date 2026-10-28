const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const { Readable } = require('node:stream');
const path = require('node:path');
const os = require('node:os');

// Read the JSON payload from stdin
let rawPayload;
try {
  rawPayload = fs.readFileSync(0, 'utf-8');
  if (!rawPayload || !rawPayload.trim()) {
    process.exit(0);
  }
} catch (e) {
  process.exit(0);
}

// Log the payload to a file for inspection
// const logPath = path.join(__dirname, 'multiplex-payloads.log');
// fs.appendFileSync(logPath, rawPayload + '\n\n');

// Check if statusLine is explicitly disabled in settings.json
try {
  const home = os.homedir();
  const settingsPath = path.join(home, '.gemini', 'antigravity-cli', 'settings.json');
  if (fs.existsSync(settingsPath)) {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    if (settings && settings.statusLine && settings.statusLine.enabled === false) {
      process.exit(0);
    }
  }
} catch (e) {
  // Ignore settings read errors
}

let payload;
try {
  payload = JSON.parse(rawPayload);
} catch (e) {
  process.exit(0);
}

if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
  process.exit(0);
}

// Extract variables
const state = payload.agent_state || 'idle';
const cycleMode = payload.cycle_mode;
const sandbox = payload.sandbox;
const artifactCount = payload.artifact_count || 0;
const toolPending = payload.tool_confirmation_pending || false;
const exceedsTokens = payload.exceeds_200k_tokens;

// 1. Replicated Default Elements (Only cycle mode, sandbox, artifacts, and tool prompts)
const parts = [];

// Cycle Mode Badge
const modeMap = {
  'plan': '\x1b[32m[Plan Mode]\x1b[0m',
  'accept-edits': '\x1b[33m[Accept Edits Mode]\x1b[0m',
  'fix': '\x1b[31m[Fix Mode]\x1b[0m',
};
if (cycleMode) {
  parts.push(modeMap[cycleMode] || `\x1b[35m[${cycleMode}]\x1b[0m`);
}

// Sandbox Warning
if (sandbox && sandbox.enabled === false) {
  parts.push('\x1b[31m🔓 Unsandboxed\x1b[0m');
}

// Token Warning
if (exceedsTokens) {
  parts.push('\x1b[31;1m⚠️ >200k Tokens\x1b[0m');
}

// Tool Confirmation Pending
if (toolPending) {
  parts.push('\x1b[31;1m⚠️ Tool Confirmation Pending\x1b[0m');
}

// Artifact Count
if (artifactCount > 0) {
  parts.push(`\x1b[36m📂 Artifacts: ${artifactCount} active\x1b[0m`);
}

// 2. Context-Aware Tip System
const tips = [];
if (toolPending) {
  tips.push('💡 Tip: Propose a command or press Enter/Approve in your terminal.');
} else if (artifactCount > 0) {
  tips.push('💡 Tip: Run /artifacts to view active plans.');
}

if (cycleMode === 'plan') {
  tips.push('💡 Tip: Use /accept to review and apply the planned edits.');
  tips.push('💡 Tip: Run /tasks to view active execution logs.');
} else if (cycleMode === 'accept-edits') {
  tips.push('💡 Tip: Run /accept to apply, or /reject to discard.');
} else if (state === 'idle') {
  tips.push('💡 Tip: Use /goal to run thorough long-running tasks.');
  tips.push('💡 Tip: Use /plan to plan complex changes before execution.');
  tips.push('💡 Tip: Try /grill-me to align on a plan via interactive interview.');
} else {
  tips.push('💡 Tip: Run /tasks to see active execution logs in real-time.');
  tips.push('💡 Tip: Run /agents to monitor background subagents.');
}

// Rotate tips every 6 seconds
const activeTip = tips[Math.floor(Date.now() / 6000) % tips.length];

// Assemble final top line
const defaultLine = parts.join(' | ');

// 3. Call the agy-hud plugin (~45ms in-process module execution, avoiding ~270ms nested Node VM spawn overhead)
const hudPath = path.join(__dirname, '..', 'dist', 'agy-hud.js');

async function renderHud() {
  if (defaultLine) {
    console.log(defaultLine);
  }

  let hudModule;
  try {
    hudModule = require(hudPath);
  } catch {
    // If requiring dist/agy-hud.js failed (e.g. module load error), attempt fallback to CLI spawn
    try {
      const result = spawnSync(process.execPath || 'node', [hudPath, 'statusline'], {
        input: rawPayload,
        encoding: 'utf-8',
        windowsHide: true,
        timeout: 1500
      });
      if (result && result.stdout) {
        process.stdout.write(result.stdout);
      }
    } catch {
      // Graceful degradation
    }
    return;
  }

  if (hudModule && typeof hudModule.runCli === 'function') {
    try {
      let hudOutput = '';
      let timer;
      const timeoutPromise = new Promise(resolve => {
        timer = setTimeout(() => resolve(), 1500);
        if (timer.unref) {
          timer.unref();
        }
      });

      const cliPromise = hudModule.runCli(['statusline'], {
        stdin: Readable.from([rawPayload]),
        stdout: chunk => {
          hudOutput += chunk;
        },
        stderr: () => {}
      });

      await Promise.race([cliPromise, timeoutPromise]);
      if (timer) {
        clearTimeout(timer);
      }
      if (hudOutput) {
        process.stdout.write(hudOutput);
      }
    } catch {
      // Graceful degradation if in-process statusline throws
    }
  }
}

renderHud()
  .then(() => process.exit(0))
  .catch(() => process.exit(0));
