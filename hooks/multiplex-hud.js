const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

// Read the JSON payload from stdin
const rawPayload = fs.readFileSync(0, 'utf-8');

// Log the payload to a file for inspection
// const logPath = path.join(__dirname, 'multiplex-payloads.log');
// fs.appendFileSync(logPath, rawPayload + '\n\n');

let payload;
try {
  payload = JSON.parse(rawPayload);
} catch (e) {
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

// 3. Call the agy-hud plugin
const hudPath = path.join(__dirname, '..', 'dist', 'agy-hud.js');
const result = spawnSync('node', [hudPath, 'statusline'], {
  input: rawPayload,
  encoding: 'utf-8'
});

// 4. Print default status line, tip on next line, then agy-hud output
if (defaultLine) {
  console.log(defaultLine);
}
// console.log(`\x1b[90m${activeTip}\x1b[0m`);
if (result.stdout) {
  process.stdout.write(result.stdout);
}
