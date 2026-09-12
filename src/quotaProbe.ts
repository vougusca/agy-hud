import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { execFileSync } from "node:child_process";

export interface LanguageServerInfo {
  pid: string;
  csrfToken: string;
  kind?: string;
}

export interface ProbeRuntime {
  _isDefault?: boolean;
  ps(): string;
  lsof(pid: string): string;
  request(port: number, csrfToken: string, protocol?: "http:" | "https:", hostname?: string): Promise<unknown | null>;
  now(): Date;
  writeFile(filePath: string, data: string): void;
  mkdir(dirPath: string): void;
  readFile?(filePath: string): string;
  processIdentity?(pid: string): string | null;
}

export interface EnvServerConfig {
  protocol?: "http:" | "https:";
  host: string;
  port: number;
  csrfToken: string;
  source: string;
}

export function parseEnvServerConfig(env: NodeJS.ProcessEnv = process.env): EnvServerConfig | null {
  const token = env.ANTIGRAVITY_CSRF_TOKEN || env.GEMINI_CLI_IDE_AUTH_TOKEN || "";

  if (env.ANTIGRAVITY_LS_ADDRESS) {
    const raw = env.ANTIGRAVITY_LS_ADDRESS.trim().replace(/\/+$/, "");
    let protocol: "http:" | "https:" | undefined;
    let hostPort = raw;
    if (raw.startsWith("http://")) {
      protocol = "http:";
      hostPort = raw.slice(7);
    } else if (raw.startsWith("https://")) {
      protocol = "https:";
      hostPort = raw.slice(8);
    }
    let host = "127.0.0.1";
    let portStr = hostPort;
    if (hostPort.includes(":")) {
      const lastColon = hostPort.lastIndexOf(":");
      host = hostPort.slice(0, lastColon).replace(/^\[|\]$/g, "") || "127.0.0.1";
      portStr = hostPort.slice(lastColon + 1);
    }
    const port = Number(portStr);
    if (Number.isInteger(port) && port > 0 && port <= 65535) {
      return { protocol, host, port, csrfToken: token, source: "ANTIGRAVITY_LS_ADDRESS" };
    }
  }

  if (env.GEMINI_CLI_IDE_SERVER_PORT && /^\d+$/.test(env.GEMINI_CLI_IDE_SERVER_PORT)) {
    const port = Number(env.GEMINI_CLI_IDE_SERVER_PORT);
    if (port > 0 && port <= 65535) {
      return { host: "127.0.0.1", port, csrfToken: token, source: "GEMINI_CLI_IDE_SERVER_PORT" };
    }
  }

  return null;
}

interface ServerHint {
  pid: string;
  port: number;
  identity: string;
  discoveredAt: string;
}

export interface RefreshResult {
  ok: boolean;
  message: string;
  cachePath?: string;
  summary?: string;
}

export function parseLanguageServerInfo(psOutput: string): LanguageServerInfo | null {
  for (const line of psOutput.split(/\r?\n/)) {
    if (!line.includes("language_server") || !line.includes("--csrf_token")) {
      continue;
    }
    const parts = line.trim().split(/\s+/);
    const pid = parts.length > 1 ? parts[1] : "";
    const tokenMatch = line.match(/--csrf_token\s+([a-zA-Z0-9-]+)/);
    if (pid !== "" && /^\d+$/.test(pid) && tokenMatch) {
      return { pid, csrfToken: tokenMatch[1] };
    }
  }
  return null;
}

export function parseAgyServerInfos(psOutput: string, defaultToken = ""): LanguageServerInfo[] {
  const infos: LanguageServerInfo[] = [];
  for (const line of psOutput.split(/\r?\n/)) {
    if (!/(^|\s)(?:\/\S+\/)?agy(\s|$)/.test(line)) {
      continue;
    }
    const parts = line.trim().split(/\s+/);
    const pid = parts.length > 1 ? parts[1] : "";
    if (pid !== "" && /^\d+$/.test(pid)) {
      infos.push({ pid, csrfToken: defaultToken, kind: "agy" });
    }
  }
  return infos;
}

export function parseListeningPorts(lsofOutput: string): number[] {
  const ports = new Set<number>();
  for (const line of lsofOutput.split(/\r?\n/)) {
    if (!line.includes("LISTEN")) {
      continue;
    }
    const match = line.match(/(?:127\.0\.0\.1|localhost|\*|\[::1\]):(\d+)\b/);
    if (match) {
      ports.add(Number(match[1]));
    }
  }
  return [...ports];
}

export function buildQuotaCache(rawResponse: unknown, now: Date): { cache: unknown; summary: string } | null {
  if (!isRecord(rawResponse)) {
    return null;
  }
  const userStatus = asRecord(rawResponse.userStatus);
  const email = typeof userStatus.email === "string" ? maskEmail(userStatus.email) : "masked@email.com";
  const planStatus = asRecord(userStatus.planStatus);
  const planInfo = asRecord(planStatus.planInfo);
  const planName = typeof planInfo.planName === "string" ? planInfo.planName : "Free";
  const cascade = asRecord(userStatus.cascadeModelConfigData);
  const configs = Array.isArray(cascade.clientModelConfigs) ? cascade.clientModelConfigs : [];
  const models: Record<string, { remainingFraction: number; resetTime: string }> = {};

  for (const item of configs) {
    const model = asRecord(item);
    const label = typeof model.label === "string" ? model.label : "";
    const quotaInfo = asRecord(model.quotaInfo);
    if (label === "" || Object.keys(quotaInfo).length === 0) {
      continue;
    }
    const resetTime = typeof quotaInfo.resetTime === "string" ? quotaInfo.resetTime : "";
    const remainingFraction = typeof quotaInfo.remainingFraction === "number" ? quotaInfo.remainingFraction : resetTime === "" ? 1.0 : 0.0;
    models[label] = { remainingFraction, resetTime };
  }
  if (Object.keys(models).length === 0) {
    return null;
  }

  const cache = {
    timestamp: now.toISOString().replace(".000Z", "Z"),
    email,
    plan_name: planName,
    models
  };
  const lines = ["=== QUOTA SUMMARY ===", `Plan: ${planName}`, `Cache Timestamp: ${cache.timestamp}`];
  for (const [model, quota] of Object.entries(models)) {
    const usedPct = Math.trunc((1 - quota.remainingFraction) * 100 + 0.5);
    let line = `- ${model.padEnd(30, " ")} : Usage ${String(usedPct).padStart(3, " ")}%`;
    if (usedPct > 0 && quota.resetTime !== "") {
      line += ` | Reset ${quota.resetTime}`;
    }
    lines.push(line);
  }
  lines.push("=====================");
  return { cache, summary: lines.join("\n") };
}

export async function refreshQuota(cachePath: string, runtime: ProbeRuntime = defaultRuntime()): Promise<RefreshResult> {
  const envServer = parseEnvServerConfig(process.env);

  if (envServer) {
    const rawResponse = await tryRequest(runtime, envServer.port, envServer.csrfToken, envServer.protocol, envServer.host);
    if (rawResponse) {
      const built = buildQuotaCache(rawResponse, runtime.now());
      if (!built) {
        return { ok: false, message: "GetUserStatus returned malformed quota data." };
      }
      return saveQuotaCache(cachePath, built, runtime, `using ${envServer.source} ${envServer.port}`);
    }
    return { ok: false, message: `Failed to query GetUserStatus from ${envServer.source} at ${envServer.host}:${envServer.port}.` };
  }

  if (process.platform === "win32") {
    const isBackground = process.argv.includes("refresh");
    if (!isBackground && runtime._isDefault) {
      return { ok: false, message: "Bypassing foreground process discovery on Windows to prevent timeouts." };
    }
  }

  const hint = loadServerHint(cachePath, runtime);
  if (hint) {
    const raw = await tryRequest(runtime, hint.port, "");
    const built = buildQuotaCache(raw, runtime.now());
    if (built) return saveQuotaCache(cachePath, built, runtime);
    // This is a disposable discovery hint, never quota or credentials. A concurrent replacement
    // lost here only costs another discovery; it cannot suppress or corrupt the quota refresh.
    saveServerHint(cachePath, null, runtime);
  }

  let psOutput = "";
  try {
    psOutput = runtime.ps();
  } catch (err) {
    return { ok: false, message: `Failed to list processes: ${err instanceof Error ? err.message : String(err)}` };
  }
  const defaultAgyToken = process.env.ANTIGRAVITY_CSRF_TOKEN || process.env.GEMINI_CLI_IDE_AUTH_TOKEN || "";
  const languageServer = parseLanguageServerInfo(psOutput);
  const candidates = [...parseAgyServerInfos(psOutput, defaultAgyToken), ...(languageServer ? [languageServer] : [])];
  if (candidates.length === 0) {
    return { ok: false, message: "No running language_server or agy quota server found." };
  }

  let sawPort = false;
  let sawResponse = false;
  for (const info of candidates) {
    // Identity is required only for hint reuse. If targeted inspection fails, full discovery
    // must remain available; the optional optimization must never disable quota refreshes.
    const identity = info.kind === "agy" ? processIdentity(runtime, info.pid) : null;
    let ports: number[];
    try {
      ports = parseListeningPorts(runtime.lsof(info.pid));
    } catch {
      continue;
    }
    if (ports.length > 0) {
      sawPort = true;
    }
    for (const port of ports) {
      const rawResponse = await tryRequest(runtime, port, info.csrfToken);
      if (rawResponse) sawResponse = true;
      const built = buildQuotaCache(rawResponse, runtime.now());
      if (built) {
        const result = saveQuotaCache(cachePath, built, runtime, `using discovered port ${port}`);
        if (identity) {
          saveServerHint(cachePath, { pid: info.pid, port, identity, discoveredAt: runtime.now().toISOString() }, runtime);
        }
        return result;
      }
    }
  }
  if (!sawPort) {
    return { ok: false, message: "No listening ports found on quota server." };
  }
  if (!sawResponse) {
    return { ok: false, message: "Failed to query GetUserStatus from all identified ports." };
  }
  return { ok: false, message: "GetUserStatus returned malformed quota data." };
}

function saveQuotaCache(cachePath: string, built: NonNullable<ReturnType<typeof buildQuotaCache>>, runtime: ProbeRuntime, methodMessage?: string): RefreshResult {
  runtime.mkdir(path.dirname(cachePath));
  runtime.writeFile(cachePath, `${JSON.stringify(built.cache, null, 2)}\n`);
  return {
    ok: true,
    message: `Successfully cached processed quota data to ${cachePath}${methodMessage ? ` (${methodMessage})` : ""}`,
    cachePath,
    summary: built.summary
  };
}

function loadServerHint(cachePath: string, runtime: ProbeRuntime): ServerHint | null {
  try {
    const raw = runtime.readFile?.(`${cachePath}.server.json`);
    if (!raw || raw.length > 4096) return null;
    const hint = JSON.parse(raw) as ServerHint | null;
    if (!hint || typeof hint.pid !== "string" || !/^[1-9]\d{0,9}$/.test(hint.pid) || Number(hint.pid) > 2147483647 ||
      !Number.isInteger(hint.port) || hint.port < 1 || hint.port > 65535 ||
      typeof hint.identity !== "string" || hint.identity === "" || typeof hint.discoveredAt !== "string") return null;
    const age = runtime.now().getTime() - Date.parse(hint.discoveredAt);
    if (!Number.isFinite(age) || age < 0 || age >= 5 * 60 * 1000) return null;
    return processIdentity(runtime, hint.pid) === hint.identity ? hint : null;
  } catch {
    return null;
  }
}

function processIdentity(runtime: ProbeRuntime, pid: string): string | null {
  try {
    return runtime.processIdentity?.(pid) || null;
  } catch {
    return null;
  }
}

function saveServerHint(cachePath: string, hint: ServerHint | null, runtime: ProbeRuntime): void {
  try {
    runtime.writeFile(`${cachePath}.server.json`, `${JSON.stringify(hint)}\n`);
  } catch {
    // A missing, truncated or unwritable hint only disables this optimization.
  }
}

async function tryRequest(
  runtime: ProbeRuntime,
  port: number,
  csrfToken: string,
  protocol?: "http:" | "https:",
  hostname?: string
): Promise<unknown | null> {
  try {
    return await runtime.request(port, csrfToken, protocol, hostname);
  } catch {
    return null;
  }
}

function defaultRuntime(): ProbeRuntime {
  const isWin = process.platform === "win32";
  return {
    _isDefault: true,
    ps: () => {
      if (isWin) {
        return windowsPs();
      }
      return execFileSync("ps", ["aux"], { encoding: "utf8", windowsHide: true });
    },
    lsof: (pid: string) => {
      if (isWin) {
        return windowsLsof(pid);
      }
      return execFileSync("lsof", ["-nP", "-iTCP", "-a", "-p", pid], { encoding: "utf8", windowsHide: true });
    },
    request: queryLanguageServer,
    now: () => new Date(),
    readFile: filePath => fs.readFileSync(filePath, "utf8"),
    processIdentity: pid => {
      if (isWin) {
        return null;
      }
      const identity = execFileSync("ps", ["-p", pid, "-o", "lstart=", "-o", "comm="], {
        encoding: "utf8", timeout: 1000, env: { ...process.env, LC_ALL: "C" }, windowsHide: true
      }).trim();
      const match = identity.match(/^\w{3}\s+\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\s+\d{4}\s+(.+)$/);
      return match && path.basename(match[1]) === "agy" ? identity : null;
    },
    // The cache carries a masked email, plan name, and per-model quota, so keep it private instead
    // of leaving it world-readable under the default umask.
    writeFile: (filePath: string, data: string) =>
      fs.writeFileSync(filePath, data, { encoding: "utf8", mode: 0o600 }),
    mkdir: (dirPath: string) => fs.mkdirSync(dirPath, { recursive: true, mode: 0o700 })
  };
}

function windowsPs(): string {
  try {
    const script = `Get-CimInstance Win32_Process -Filter "Name='language_server.exe' or Name='agy.exe'" | ForEach-Object { $_.ProcessId.ToString() + "` + "`t" + `" + $_.CommandLine }`;
    const cimOut = execFileSync("powershell", ["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", script], {
      encoding: "utf8",
      windowsHide: true,
      stdio: ["ignore", "pipe", "ignore"]
    });
    const lines: string[] = [];
    cimOut.split(/\r?\n/).forEach(line => {
      const parts = line.trim().split("\t");
      if (parts.length >= 2) {
        const pid = parts[0];
        let cmd = parts.slice(1).join("\t").trim();
        let exe = "";
        let args = "";
        if (cmd.startsWith('"')) {
          const closingQuote = cmd.indexOf('"', 1);
          if (closingQuote >= 0) {
            exe = cmd.substring(1, closingQuote);
            args = cmd.substring(closingQuote + 1);
          } else {
            exe = cmd.replace(/"/g, "");
          }
        } else {
          const firstSpace = cmd.indexOf(" ");
          if (firstSpace >= 0) {
            exe = cmd.substring(0, firstSpace);
            args = cmd.substring(firstSpace);
          } else {
            exe = cmd;
          }
        }
        const lastSlash = Math.max(exe.lastIndexOf("/"), exe.lastIndexOf("\\"));
        if (lastSlash >= 0) {
          exe = exe.substring(lastSlash + 1);
        }
        exe = exe.replace(/\.exe/gi, "");
        cmd = (exe + " " + args).trim().split(/\s+/).join(" ");
        lines.push(`user ${pid} 0.0 ${cmd}`);
      }
    });
    return lines.join("\n");
  } catch {
    return "";
  }
}

function windowsLsof(pid: string): string {
  try {
    const netstat = execFileSync("netstat", ["-ano"], { encoding: "utf8", windowsHide: true });
    const lines = netstat.split(/\r?\n/).filter(line => {
      const trimmed = line.trim();
      const parts = trimmed.split(/\s+/);
      return parts.map(p => p.toUpperCase()).includes("LISTENING") && parts[parts.length - 1] === pid;
    }).map(line => {
      const parts = line.trim().split(/\s+/);
      const local = parts[1] || "";
      return `app ${pid} user 10u IPv4 0 TCP ${local} (LISTEN)`;
    });
    return lines.join("\n");
  } catch (err) {
    throw new Error(`netstat failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

interface RequestOutcome {
  data: unknown | null;
  tlsError: boolean;
  httpStatus?: number;
}

async function queryLanguageServer(
  port: number,
  csrfToken: string,
  protocol?: "http:" | "https:",
  hostname = "127.0.0.1"
): Promise<unknown | null> {
  const endpoint = `/exa.language_server_pb.LanguageServerService/GetUserStatus`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Connect-Protocol-Version": "1"
  };
  if (csrfToken !== "") {
    headers["X-Codeium-Csrf-Token"] = csrfToken;
  }

  if (protocol === "http:") {
    const outcome = await requestJson(http, {
      protocol: "http:",
      hostname,
      port,
      path: endpoint,
      method: "POST",
      headers
    });
    return outcome.data;
  }

  if (protocol === "https:") {
    const outcome = await requestJson(https, {
      protocol: "https:",
      hostname,
      port,
      path: endpoint,
      method: "POST",
      headers,
      rejectUnauthorized: false
    });
    return outcome.data;
  }

  const httpsResult = await requestJson(https, {
    protocol: "https:",
    hostname,
    port,
    path: endpoint,
    method: "POST",
    headers,
    rejectUnauthorized: false
  });
  if (httpsResult.data !== null) {
    return httpsResult.data;
  }

  // Only fall back to plain HTTP if HTTPS failed with a TLS/connection error before receiving any HTTP response.
  // If the HTTPS server actually answered (e.g. 401 unauthenticated, 403, 404, 500), it IS an HTTPS server;
  // retrying over plain HTTP to an HTTPS server triggers "client sent an HTTP request to an HTTPS server" TLS handshake errors.
  if (httpsResult.tlsError) {
    const httpResult = await requestJson(http, {
      protocol: "http:",
      hostname,
      port,
      path: endpoint,
      method: "POST",
      headers
    });
    return httpResult.data;
  }

  return null;
}

function requestJson(
  mod: typeof http | typeof https,
  options: http.RequestOptions & { rejectUnauthorized?: boolean }
): Promise<RequestOutcome> {
  return new Promise(resolve => {
    let responded = false;
    const req = mod.request(options, res => {
      responded = true;
      const chunks: Buffer[] = [];
      res.on("data", chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      res.on("end", () => {
        const httpStatus = res.statusCode;
        if (!httpStatus || httpStatus < 200 || httpStatus >= 300) {
          resolve({ data: null, tlsError: false, httpStatus });
          return;
        }
        try {
          resolve({ data: JSON.parse(Buffer.concat(chunks).toString("utf8")), tlsError: false, httpStatus });
        } catch {
          resolve({ data: null, tlsError: false, httpStatus });
        }
      });
    });
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ data: null, tlsError: !responded });
    });
    req.on("error", () => {
      resolve({ data: null, tlsError: !responded });
    });
    req.write("{}");
    req.end();
  });
}

function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at < 0) {
    return "masked@email.com";
  }
  return `${email.slice(0, 3)}***${email.slice(at)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}
