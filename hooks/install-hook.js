const fs = require('fs');
const os = require('os');
const path = require('path');

const settingsPath = path.join(os.homedir(), '.gemini', 'antigravity-cli', 'settings.json');
const isWindows = os.platform() === 'win32';
const hookExt = isWindows ? 'status-line.cmd' : 'status-line.sh';
const hookPath = path.join(os.homedir(), '.gemini', 'config', 'plugins', 'agy-hud', 'hooks', hookExt);

let settings = {};
if (fs.existsSync(settingsPath)) {
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (err) {
    console.error('Failed to parse settings.json:', err);
    process.exit(1);
  }
}

settings.statusLine = {
  type: 'command',
  command: hookPath,
  enabled: true
};

try {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
  console.log('Successfully updated settings.json with agy-hud status-line hook.');
} catch (err) {
  console.error('Failed to write settings.json:', err);
  process.exit(1);
}
