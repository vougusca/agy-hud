import { Config } from "./config";
import { truncateColumns, visibleLen } from "./ansi";
import { Cache, matchModel, usagePercent as quotaUsagePercent } from "./quota";
import { AgentTokenStats, SubagentTrackerResult } from "./subagentTracker";
import path from "node:path";

const colorReset = "\x1b[0m";
const colorBlue = "\x1b[34m";
const colorGreen = "\x1b[32m";
const colorYellow = "\x1b[33m";
const colorCyan = "\x1b[36m";
const colorMagenta = "\x1b[35m";
const colorRed = "\x1b[31m";
const colorOrange = "\x1b[38;5;208m";
const colorMuted = "\x1b[90m";
const colorGit = "\x1b[38;5;109m";

function hexToAnsi(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return colorBlue;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `\x1b[38;2;${r};${g};${b}m`;
}

const modelThemes = {
  brand: {
    flash: colorCyan,
    pro: colorMagenta,
    claude: colorOrange,
    gpt: colorGreen
  },
  neon: {
    flash: "\x1b[38;5;226m",
    pro: "\x1b[38;5;206m",
    claude: "\x1b[38;5;214m",
    gpt: "\x1b[38;5;46m"
  },
  pastel: {
    flash: "\x1b[38;5;117m",
    pro: "\x1b[38;5;183m",
    claude: "\x1b[38;5;223m",
    gpt: "\x1b[38;5;120m"
  }
};

function resolveModelColor(modelDisplay: string, config: Config): string {
  const normalized = modelDisplay.toLowerCase();
  let key: keyof typeof modelThemes["brand"] | "" = "";
  if (normalized.includes("flash")) key = "flash";
  else if (normalized.includes("pro")) key = "pro";
  else if (normalized.includes("claude")) key = "claude";
  else if (normalized.includes("gpt")) key = "gpt";
  
  if (!key) return colorBlue;

  if (config.modelColorTheme === "custom" && config.customModelColors && config.customModelColors[key]) {
    return hexToAnsi(config.customModelColors[key]);
  }

  const theme = modelThemes[config.modelColorTheme === "custom" ? "brand" : config.modelColorTheme] || modelThemes.brand;
  return theme[key] || colorBlue;
}

// Nerd Font glyphs (Caskaydia Cove NF). Verified against the shipped TTF.
const iconGoogleG = "\u{E7F0}"; // dev-google — used for the Pro plan segment
const iconModelDefault = "\u{F02AD}"; // md-google — generic Gemini/Google fallback

// Per-model status-line icons, matched on the full display name (before shortening).
const modelIcons: Array<{ match: RegExp; icon: string }> = [
  // Gemini Flash — reasoning effort escalates outline -> solid -> filled bolt
  { match: /(?:gemini.*)?flash.*\(?\s*low\s*\)?/i, icon: "\u{F140C}" },    // md-lightning_bolt_outline
  { match: /(?:gemini.*)?flash.*\(?\s*(?:med|medium)\s*\)?/i, icon: "\u{F140B}" }, // md-lightning_bolt
  { match: /(?:gemini.*)?flash.*\(?\s*high\s*\)?/i, icon: "\u{F0241}" },   // md-flash
  { match: /(?:gemini.*)?flash/i, icon: "\u{F140B}" },                     // md-lightning_bolt (Flash default)
  // Gemini Pro — four-point star, outline for low, solid for high
  { match: /(?:gemini.*)?pro.*\(?\s*low\s*\)?/i, icon: "\u{F0AE3}" },      // md-star_four_points_outline
  { match: /(?:gemini.*)?pro.*\(?\s*high\s*\)?/i, icon: "\u{F0AE2}" },     // md-star_four_points
  { match: /(?:gemini.*)?pro/i, icon: "\u{F0AE2}" },                       // md-star_four_points (Pro default)
  // Claude
  { match: /(?:claude.*)?sonnet/i, icon: "\u{EE9C}" },                     // fa-brain
  { match: /(?:claude.*)?opus/i, icon: "\u{F1344}" },                      // md-head_lightbulb
  // Open-source / third-party
  { match: /gpt|oss/i, icon: "\u{F06A9}" },                           // md-robot
];

function modelIcon(modelDisplay: string): string {
  for (const entry of modelIcons) {
    if (entry.match.test(modelDisplay)) {
      return entry.icon;
    }
  }
  return iconModelDefault;
}

export interface Payload {
  cwd?: string;
  session_id?: string;
  conversation_id?: string;
  transcript_path?: string;
  email?: string;
  model?: {
    id?: string;
    display_name?: string;
  };
  context_window?: {
    total_input_tokens?: number;
    total_output_tokens?: number;
    context_window_size?: number;
    used_percentage?: number;
    remaining_percentage?: number;
    current_usage?: unknown;
  };
  quota?: Record<string, OfficialQuotaBucket>;
  agent_state?: string;
  plan_tier?: string;
  terminal_width?: number;
  vcs?: {
    type?: string;
    branch?: string;
    root?: string;
  };
  workspace?: {
    current_dir?: string;
    project_dir?: string;
  };
  cost?: {
    total_usd?: number;
    subagent_usd?: number;
    estimated?: boolean;
  };
}

interface OfficialQuotaBucket {
  remaining_fraction?: number;
  reset_time?: string;
  reset_in_seconds?: number;
}

export interface QuotaWindowDisplay {
  label: string;
  usagePct: number;
  reset: string;
  resetInSeconds?: number;
}

export interface QuotaDisplay {
  usagePct: number;
  reset: string;
  hasQuota: boolean;
  windows: QuotaWindowDisplay[];
}

export interface RenderOptions {
  config: Config;
  quota?: Cache | null;
  gitBranch?: string;
  now?: Date;
  subagents?: SubagentTrackerResult | null;
}

export function shortModelName(display: string): string {
  let short = display.split("Gemini").join("");
  short = short.split("Claude").join("");
  short = short.split("Thinking").join("");
  short = short.split("(").join("");
  short = short.split(")").join("");
  short = short.split("Medium").join("Med");
  short = short.trim().split(/\s+/).filter(Boolean).join(" ");
  if (visibleLen(short) > 18) {
    short = `${truncateColumns(short, 15)}...`;
  }
  return short;
}

export function formatCost(usd: number): string {
  if (!Number.isFinite(usd) || usd <= 0) {
    return "$0.00";
  }
  if (usd >= 0.01) {
    return `$${usd.toFixed(2)}`;
  }
  if (usd >= 0.001) {
    return `$${usd.toFixed(3)}`;
  }
  return "<$0.001";
}

function renderCost(cost: Payload["cost"], config: Config): string {
  const usd = cost?.total_usd;
  if (!config.showCost || typeof usd !== "number" || !Number.isFinite(usd) || usd < 0) return "";
  return colorize(`${cost?.estimated === true ? "~" : ""}${formatCost(usd)}`, colorCyan, config.color);
}

export function render(payload: Payload, opts: RenderOptions): string {
  const config = opts.config;
  const width = (payload.terminal_width ?? 0) <= 0 ? 80 : payload.terminal_width!;
  const modelDisplay = payload.model?.display_name || payload.model?.id || "Gemini";
  const mColor = resolveModelColor(modelDisplay, config);
  const modelSegment = renderModelSegment(shortModelName(modelDisplay), modelIcon(modelDisplay), payload.plan_tier ?? "", config, mColor);
  const ctxPct = contextPercent(payload.context_window);
  const stateLabel = state(payload.agent_state ?? "");
  const quota = quotaInfo(opts.quota, modelDisplay, payload.quota, opts.now ?? new Date());
  if (config.multiline) {
    return renderMultiline(payload, config, width, modelSegment, ctxPct, quota, opts.gitBranch ?? "", stateLabel, opts.subagents);
  }
  return renderSingleLine(payload, config, width, modelSegment, ctxPct, quota, stateLabel, opts.subagents);
}

export function shortenRole(role?: string | null): string {
  if (!role || typeof role !== "string") return "";
  const r = role.trim().toLowerCase();
  if (r === "code-reviewer" || r === "reviewer") return "rev";
  if (r === "debugger") return "dbg";
  if (r === "dev") return "dev";
  if (r === "devops") return "ops";
  if (r === "explorer") return "exp";
  if (r === "orchestrator") return "orch";
  if (r === "planner") return "plan";
  if (r === "test-engineer" || r === "tester") return "test";
  if (r === "web-researcher" || r === "researcher") return "web";
  if (r === "writer") return "doc";
  if (r === "subagent") return "sub";
  return r.length > 4 ? r.slice(0, 4) : r;
}

export function formatRootBadge(root: AgentTokenStats, colors: boolean): string {
  const active = formatTokens(root.activeTokens);
  const cum = formatTokens(root.cumulativeTokens);
  const text = `[◆ ${active}/${cum}]`;
  return colorize(text, colorCyan, colors);
}

export function formatSubagentBadge(agent: AgentTokenStats, includeRole: boolean, colors: boolean): string {
  const role = shortenRole(agent.role) || "sub";
  const rolePrefix = includeRole ? `${agent.index}:${role} ` : `${agent.index}:`;
  const active = formatTokens(agent.activeTokens);
  const cum = formatTokens(agent.cumulativeTokens);
  const dotGlyph = agent.isRunning ? "●" : "○";
  const dotColor = agent.isRunning ? colorGreen : colorMuted;
  const dot = colorize(dotGlyph, dotColor, colors);
  return `[${rolePrefix}${active}/${cum} ${dot}]`;
}

export function renderSubagentLine(stats: AgentTokenStats[], width: number, colors: boolean): string {
  const root = stats.find(s => s.index === 0) ?? {
    index: 0,
    id: "",
    role: "root",
    status: "idle",
    isRunning: false,
    activeTokens: 0,
    cumulativeTokens: 0,
  };
  const subagents = stats.filter(s => s.index > 0).sort((a, b) => b.index - a.index);
  const rootBadge = formatRootBadge(root, colors);

  if (subagents.length === 0) {
    return fit(rootBadge, width);
  }

  // Tier 1 (Full): [◆ 2.2k/45k] [1:dev 15k/40k ●] [2:rev 8k/22k ●]
  const tier1Badges = [rootBadge, ...subagents.map(s => formatSubagentBadge(s, true, colors))];
  const tier1 = tier1Badges.join(" ");
  if (visibleLen(tier1) <= width) {
    return tier1;
  }

  // Tier 2 (Compact Roles): [◆ 2.2k/45k] [1:15k/40k ●] [2:8k/22k ●]
  const tier2Badges = [rootBadge, ...subagents.map(s => formatSubagentBadge(s, false, colors))];
  const tier2 = tier2Badges.join(" ");
  if (visibleLen(tier2) <= width) {
    return tier2;
  }

  // Tier 3 (Active Priority): [◆ 2.2k/45k] + active badges [1:dev 15k/40k ●] + [+N idle]
  const activeSubagents = subagents.filter(s => s.isRunning);
  const idleCount = subagents.length - activeSubagents.length;
  const idleBadge = idleCount > 0 ? colorize(`[+${idleCount} idle]`, colorMuted, colors) : "";

  if (activeSubagents.length > 0) {
    const tier3Parts = [rootBadge, ...activeSubagents.map(s => formatSubagentBadge(s, true, colors))];
    if (idleBadge) tier3Parts.push(idleBadge);
    const tier3 = tier3Parts.join(" ");
    if (visibleLen(tier3) <= width) {
      return tier3;
    }

    const tier3CompactParts = [rootBadge, ...activeSubagents.map(s => formatSubagentBadge(s, false, colors))];
    if (idleBadge) tier3CompactParts.push(idleBadge);
    const tier3Compact = tier3CompactParts.join(" ");
    if (visibleLen(tier3Compact) <= width) {
      return tier3Compact;
    }
  }

  // Tier 4 (Ultra-narrow): [◆ 2.2k/45k] [N active]
  const activeCount = activeSubagents.length;
  const activeBadge = activeCount > 0 ? colorize(`[${activeCount} active]`, colorGreen, colors) : "";
  const tier4Parts = [rootBadge];
  if (activeBadge) tier4Parts.push(activeBadge);
  const tier4 = tier4Parts.join(" ");
  if (visibleLen(tier4) <= width) {
    return tier4;
  }

  return fit(tier4, width);
}

export function formatResetTenth(seconds?: number): string {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) {
    return "";
  }
  if (seconds < 3600) {
    const mins = Math.max(1, Math.round(seconds / 60));
    if (mins >= 60) return "1.0h";
    return `${mins}m`;
  }
  if (seconds < 86400) {
    const hours = (seconds / 3600).toFixed(1);
    if (hours === "24.0") return "1.0d";
    return `${hours}h`;
  }
  return `${(seconds / 86400).toFixed(1)}d`;
}

export function formatQuotaSegments(quota: QuotaDisplay, config: Config, includeReset: boolean): string[] {
  if (!quota.hasQuota || quota.windows.length === 0) {
    const part1 = `${colorize("5h", colorCyan, config.color)} ${colorize("--", colorMuted, config.color)}`;
    const part2 = `${colorize("W", colorCyan, config.color)} ${colorize("--", colorMuted, config.color)}`;
    return [part1, part2];
  }

  return quota.windows.map(window => {
    const label = colorize(window.label || "5h", colorCyan, config.color);
    const val = config.usageValue === "remaining" ? 100 - window.usagePct : window.usagePct;
    const value = colorize(`${val.toFixed(1)}%`, percentageColor(window.usagePct), config.color);
    let resetStr = "";
    if (includeReset && window.resetInSeconds) {
      const duration = formatResetTenth(window.resetInSeconds);
      if (duration !== "") {
        resetStr = colorize(`(${duration})`, colorMuted, config.color);
      }
    }
    return resetStr !== "" ? `${label} ${value} ${resetStr}` : `${label} ${value}`;
  });
}

export function formatQuotaChip(quota: QuotaDisplay, config: Config, includeReset: boolean): string {
  const openBracket = colorize("[", colorMuted, config.color);
  const closeBracket = colorize("]", colorMuted, config.color);
  const sep = ` ${colorize("|", colorMuted, config.color)} `;
  return `${openBracket}${formatQuotaSegments(quota, config, includeReset).join(sep)}${closeBracket}`;
}

function fitSubagentsWithOverflow(
  rootBadge: string,
  activeSubagents: AgentTokenStats[],
  idleSubagents: AgentTokenStats[],
  useFullRole: boolean,
  colors: boolean,
  width: number
): string | null {
  const activeBadges = activeSubagents.map(s => formatSubagentBadge(s, useFullRole, colors));
  const idleBadges = idleSubagents.map(s => formatSubagentBadge(s, useFullRole, colors));

  const minIdle = activeSubagents.length > 0 ? 0 : 1;

  for (let numIdle = idleBadges.length - 1; numIdle >= minIdle; numIdle--) {
    const includedIdle = idleBadges.slice(0, numIdle);
    const omittedIdleCount = idleBadges.length - numIdle;
    const overflowBadge = omittedIdleCount > 0 ? colorize(`[+${omittedIdleCount} idle]`, colorMuted, colors) : "";

    const parts = [rootBadge, ...activeBadges, ...includedIdle];
    if (overflowBadge) parts.push(overflowBadge);

    const candidate = parts.join(" ");
    if (visibleLen(candidate) <= width) {
      return candidate;
    }
  }
  return null;
}

export function renderUnifiedLine2(
  payload: Payload,
  config: Config,
  width: number,
  _quota?: QuotaDisplay,
  subagents?: SubagentTrackerResult | null
): string {
  const rootAgent: AgentTokenStats = subagents?.agents.find(s => s.index === 0) ?? {
    index: 0,
    id: payload.conversation_id || "",
    role: "root",
    status: payload.agent_state || "idle",
    isRunning: false,
    activeTokens: payload.context_window?.total_input_tokens ?? 0,
    cumulativeTokens: (payload.context_window?.total_input_tokens ?? 0) + (payload.context_window?.total_output_tokens ?? 0),
  };
  const colors = config.color;
  const rootBadge = formatRootBadge(rootAgent, colors);
  const subagentsList = (config.showSubagents !== false && subagents?.agents
    ? subagents.agents.filter(s => s.index > 0).sort((a, b) => b.index - a.index)
    : []) as AgentTokenStats[];

  if (subagentsList.length === 0) {
    if (visibleLen(rootBadge) <= width) {
      return rootBadge;
    }
    return fit(rootBadge, width);
  }

  const activeSubagents = subagentsList.filter(s => s.isRunning);
  const idleSubagents = subagentsList.filter(s => !s.isRunning);

  // Tier 1 (full roles): Root + All subagents (full role)
  const tier1Parts = [rootBadge, ...subagentsList.map(s => formatSubagentBadge(s, true, colors))];
  const tier1 = tier1Parts.join(" ");
  if (visibleLen(tier1) <= width) {
    return tier1;
  }

  // Tier 2 (compact roles): Root + All subagents (compact role)
  const tier2Parts = [rootBadge, ...subagentsList.map(s => formatSubagentBadge(s, false, colors))];
  const tier2 = tier2Parts.join(" ");
  if (visibleLen(tier2) <= width) {
    return tier2;
  }

  // Tier 3 (prioritized progressive fit with overflow):
  // Check full roles first, then compact roles
  const tier3 = fitSubagentsWithOverflow(rootBadge, activeSubagents, idleSubagents, true, colors, width);
  if (tier3 !== null) {
    return tier3;
  }

  const tier3Compact = fitSubagentsWithOverflow(rootBadge, activeSubagents, idleSubagents, false, colors, width);
  if (tier3Compact !== null) {
    return tier3Compact;
  }

  // Tier 4:
  // If active subagents exist and cannot fit badges, try [rootBadge, "[N active]"] (or with [+M idle] if space allows)
  // If no active subagents exist (all idle) and individual badges could not fit, check if [rootBadge, "[+N idle]"] fits
  if (activeSubagents.length > 0) {
    const activeBadge = colorize(`[${activeSubagents.length} active]`, colorGreen, colors);
    if (idleSubagents.length > 0) {
      const idleBadge = colorize(`[+${idleSubagents.length} idle]`, colorMuted, colors);
      const candidateWithIdle = [rootBadge, activeBadge, idleBadge].join(" ");
      if (visibleLen(candidateWithIdle) <= width) {
        return candidateWithIdle;
      }
    }
    const candidateActiveOnly = [rootBadge, activeBadge].join(" ");
    if (visibleLen(candidateActiveOnly) <= width) {
      return candidateActiveOnly;
    }
  } else if (idleSubagents.length > 0) {
    const idleBadge = colorize(`[+${idleSubagents.length} idle]`, colorMuted, colors);
    const candidateIdleOnly = [rootBadge, idleBadge].join(" ");
    if (visibleLen(candidateIdleOnly) <= width) {
      return candidateIdleOnly;
    }
  }

  // Tier 5 (root badge alone): Root badge alone
  if (visibleLen(rootBadge) <= width) {
    return rootBadge;
  }

  return fit(rootBadge, width);
}

export function renderMultiline(
  payload: Payload,
  config: Config,
  width: number,
  modelSegment: string,
  ctxPct: number,
  quota: QuotaDisplay,
  branch: string,
  stateLabel: string,
  subagents?: SubagentTrackerResult | null
): string {
  const cwdText = config.showCWD && payload.cwd ? colorize(withIcon(config, " ", "") + path.basename(payload.cwd), colorYellow, config.color) : "";
  const gitText = config.showGitBranch && branch !== "" ? colorize(renderGitSegment(branch, config), colorGit, config.color) : "";
  const stateText = config.showAgentState ? colorize(stateLabel, stateColor(stateLabel), config.color) : "";
  const costText = renderCost(payload.cost, config);

  let line1: string;
  if (config.line2Style === "unified") {
    const quotaWithReset = formatQuotaSegments(quota, config, true);
    const quotaNoReset = formatQuotaSegments(quota, config, false);

    // Tier 1: Quota with reset + modelSegment + cwd + git + state + cost
    line1 = joinHeader(...quotaWithReset, modelSegment, cwdText, gitText, stateText, costText);
    if (visibleLen(line1) > width) {
      // Tier 2: Quota without reset + modelSegment + cwd + git + state + cost
      line1 = joinHeader(...quotaNoReset, modelSegment, cwdText, gitText, stateText, costText);
    }
    if (visibleLen(line1) > width) {
      // Tier 3: Quota without reset + modelSegment + cwd + git + state
      line1 = joinHeader(...quotaNoReset, modelSegment, cwdText, gitText, stateText);
    }
    if (visibleLen(line1) > width) {
      // Tier 4: Quota without reset + modelSegment + git + state
      line1 = joinHeader(...quotaNoReset, modelSegment, gitText, stateText);
    }
    if (visibleLen(line1) > width) {
      // Tier 5: Quota without reset + modelSegment + state
      line1 = joinHeader(...quotaNoReset, modelSegment, stateText);
    }
    if (visibleLen(line1) > width) {
      // Tier 6: modelSegment + state
      line1 = joinHeader(modelSegment, stateText);
    }
    if (visibleLen(line1) > width) {
      // Tier 7: modelSegment
      line1 = modelSegment;
    }
    // Tier 8: fit(modelSegment, width)
    line1 = fit(line1, width);
  } else {
    const line1Parts = [modelSegment];
    if (cwdText) line1Parts.push(cwdText);
    if (gitText) line1Parts.push(gitText);
    if (stateText) line1Parts.push(stateText);
    line1 = joinHeader(...line1Parts, costText);
    if (visibleLen(line1) > width) {
      line1 = joinHeader(...line1Parts);
    }
    if (visibleLen(line1) > width) {
      line1 = joinHeader(modelSegment, gitText, stateText);
    }
    if (visibleLen(line1) > width) {
      line1 = joinHeader(modelSegment, stateText);
    }
    if (visibleLen(line1) > width) {
      line1 = modelSegment;
    }
    line1 = fit(line1, width);
  }

  let line2: string;
  if (config.line2Style === "classic") {
    if (config.showSubagents !== false && subagents && subagents.hasActiveSubagents) {
      line2 = renderSubagentLine(subagents.agents, width, config.color);
    } else {
      line2 = renderResourceLine(payload, config, width, ctxPct, quota);
    }
  } else {
    line2 = renderUnifiedLine2(payload, config, width, quota, subagents);
  }
  return `${line1}\n${line2}`;
}

function renderResourceLine(
  payload: Payload,
  config: Config,
  width: number,
  ctxPct: number,
  quota: QuotaDisplay
): string {
  let ctx = "Ctx ";
  if (config.showProgressBar) {
    ctx += `${progressBar(ctxPct, 10, config.color)} `;
  }
  ctx += contextValue(config, payload.context_window, ctxPct);

  let usage = "";
  if (quota.hasQuota) {
    usage = usageLabel(config, quota, true);
    if (quota.windows.length <= 1 && quota.reset !== "") {
      usage += resetSuffix(config, quota.reset);
    }
  }
  let line2 = joinHeader(ctx, usage);
  if (visibleLen(line2) > width) {
    let usageNoBar = "";
    if (quota.hasQuota) {
      usageNoBar = usageLabel(config, quota, false);
      if (quota.windows.length <= 1 && quota.reset !== "") {
        usageNoBar += resetSuffix(config, quota.reset);
      }
    }
    line2 = joinHeader(`Ctx ${contextValue(config, payload.context_window, ctxPct)}`, usageNoBar);
  }
  if (visibleLen(line2) > width) {
    let usageCompact = "";
    if (quota.hasQuota) {
      usageCompact = usageLabel(config, quota, false);
      if (quota.windows.length <= 1 && quota.reset !== "") {
        usageCompact += resetSuffix(config, quota.reset);
      }
    }
    line2 = joinHeader(`Ctx ${coloredPct(ctxPct, ctxPct, config)}`, usageCompact);
  }
  if (visibleLen(line2) > width) {
    let coreUsage = "";
    if (quota.hasQuota) {
      coreUsage = `Use ${usageValue(config, quota.usagePct)}`;
    }
    line2 = join(`Ctx ${coloredPct(ctxPct, ctxPct, config)}`, coreUsage);
  }
  if (visibleLen(line2) > width) {
    line2 = coloredPct(ctxPct, ctxPct, config);
  }
  return fit(line2, width);
}

function renderSingleLine(
  payload: Payload,
  config: Config,
  width: number,
  modelSegment: string,
  ctxPct: number,
  quota: QuotaDisplay,
  stateLabel: string,
  subagents?: SubagentTrackerResult | null
): string {
  let subagentBadge = "";
  if (config.showSubagents !== false && subagents?.hasActiveSubagents) {
    const active = subagents.agents.filter(a => a.index > 0 && a.isRunning).sort((a, b) => b.index - a.index);
    if (active.length === 1) {
      const dot = colorize("●", colorGreen, config.color);
      subagentBadge = `[${active[0].index}:${shortenRole(active[0].role) || "sub"} ${dot}]`;
    } else if (active.length > 1) {
      const dot = colorize("●", colorGreen, config.color);
      subagentBadge = `[${active.length} active ${dot}]`;
    }
  }

  const coloredBadge = modelSegment;
  const ctx = `Ctx ${contextValue(config, payload.context_window, ctxPct)}`;
  let tokens = tokenDetail(payload.context_window);
  if (tokens !== "" && config.contextValue === "percent") {
    tokens = colorize(tokens, colorMuted, config.color);
  } else {
    tokens = "";
  }
  let usage = "";
  if (quota.hasQuota) {
    let text = usageLabel(config, quota, false);
    if (quota.windows.length <= 1 && quota.reset !== "") {
      text += resetSuffix(config, quota.reset);
    }
    usage = text; // Rely on internal colorization for warnings
  }
  const stateText = config.showAgentState ? colorize(stateLabel, stateColor(stateLabel), config.color) : "";
  const costText = renderCost(payload.cost, config);
  let bar = "";
  if (config.showProgressBar) {
    bar = progressBar(ctxPct, 10, config.color);
  }
  const levels = [
    [coloredBadge, subagentBadge, ctx, tokens, bar, usage, stateText, costText],
    [coloredBadge, subagentBadge, ctx, tokens, bar, usage, stateText],
    [coloredBadge, subagentBadge, ctx, bar, usage, stateText],
    [coloredBadge, subagentBadge, ctx, usage, stateText],
    [coloredBadge, subagentBadge, ctx, stateText],
    [coloredBadge, ctx, stateText],
    [ctx, stateText],
    [coloredPct(ctxPct, ctxPct, config), stateLabel]
  ];
  for (const parts of levels) {
    const line = join(...parts);
    if (visibleLen(line) <= width) {
      return line;
    }
  }
  return fit(`${coloredPct(ctxPct, ctxPct, config)} ${stateLabel}`, width);
}

function renderModelSegment(shortModel: string, icon: string, rawPlan: string, config: Config, mColor: string): string {
  let plan = "Plan ?";
  if (/\bultra\b/i.test(rawPlan)) {
    plan = "Ultra";
  } else if (/\bpro\b/i.test(rawPlan)) {
    plan = "Pro";
  } else if (/\bfree\b/i.test(rawPlan)) {
    plan = "Free";
  }
  if (config.showModel && shortModel !== "") {
    const modelStr = `${withIcon(config, `${icon} `, "")}${shortModel}`;
    return `${colorize(modelStr, mColor, config.color)} ${colorize(`| ${renderPlan(plan, config)}`, colorBlue, config.color)}`;
  }
  if (plan === "Pro" || plan === "Ultra") {
    return colorize(`${withIcon(config, `${icon} `, "")}${renderPlan(plan, config)} Tier`, colorBlue, config.color);
  }
  return colorize(`${withIcon(config, `${icon} `, "")}${plan}`, colorBlue, config.color);
}

function renderPlan(plan: string, config: Config): string {
  if (plan === "Pro" || plan === "Ultra") {
    return `${withIcon(config, `${iconGoogleG} `, "")}${plan}`;
  }
  return plan;
}

function renderGitSegment(branch: string, config: Config): string {
  if (branch === "git") {
    return `${withIcon(config, " ", "")}git`;
  }
  return `${withIcon(config, " ", "")}${branch}`;
}

function resetSuffix(config: Config, reset: string): string {
  return ` ${withIcon(config, "↻ ", "")}Reset ${reset}`;
}

function inlineResetSuffix(config: Config, reset: string): string {
  if (reset === "") {
    return "";
  }
  return ` (${withIcon(config, "↻ ", "")}${reset})`;
}

function withIcon(config: Config, icon: string, fallback: string): string {
  return config.showIcons ? icon : fallback;
}

function quotaInfo(cache: Cache | null | undefined, modelDisplay: string, officialQuota: Record<string, OfficialQuotaBucket> | undefined, now: Date): QuotaDisplay {
  const cacheInfo = cacheQuotaInfo(cache, modelDisplay, now);
  const official = officialQuotaInfo(officialQuota, modelDisplay);
  if (official !== null) {
    if (official.hasQuota && cacheInfo !== null && cacheInfo.hasQuota && cacheIsFresh(cache, now)) {
      return mergeFreshCacheQuota(official, cacheInfo);
    }
    return official;
  }
  if (cacheInfo !== null) {
    return cacheInfo;
  }
  return noQuota();
}

export function cacheQuotaInfo(cache: Cache | null | undefined, modelDisplay: string, now: Date = new Date()): QuotaDisplay | null {
  const [quota, ok] = matchModel(cache, modelDisplay);
  if (!ok || quota === null) {
    return null;
  }
  const usagePct = quotaUsagePercent(quota);
  const reset = usagePct > 0 ? formatResetClock(quota.resetTime) : "";
  let resetInSeconds: number | undefined;
  if (quota.resetTime) {
    const target = new Date(quota.resetTime.replace("Z", "+00:00"));
    if (!Number.isNaN(target.getTime())) {
      resetInSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
    }
  }
  return quotaDisplay([{ label: "5h", usagePct, reset, resetInSeconds }]);
}

function cacheIsFresh(cache: Cache | null | undefined, now: Date): boolean {
  if (!cache?.timestamp) {
    return false;
  }
  const cacheTime = new Date(cache.timestamp);
  if (Number.isNaN(cacheTime.getTime())) {
    return false;
  }
  return now.getTime() - cacheTime.getTime() <= 5 * 60 * 1000;
}

export function officialQuotaInfo(officialQuota: Record<string, OfficialQuotaBucket> | undefined, modelDisplay: string): QuotaDisplay | null {
  if (!officialQuota) {
    return null;
  }
  const keys = officialQuotaKeys(modelDisplay);
  const buckets: QuotaWindowDisplay[] = [];
  let sawKnownBucket = false;
  for (const { key, label } of keys) {
    if (!Object.prototype.hasOwnProperty.call(officialQuota, key)) {
      continue;
    }
    sawKnownBucket = true;
    const bucket = officialQuota[key];
    if (Number.isFinite(bucket.remaining_fraction)) {
      const usagePct = quotaUsagePercent({
        remainingFraction: bucket.remaining_fraction ?? 1,
        resetTime: bucket.reset_time ?? ""
      });
      const reset = usagePct > 0 ? formatOfficialReset(bucket) : "";
      buckets.push({
        label,
        usagePct,
        reset,
        resetInSeconds: bucket.reset_in_seconds
      });
    }
  }
  if (buckets.length === 0) {
    return sawKnownBucket ? noQuota() : null;
  }
  return quotaDisplay(buckets);
}

export function mergeFreshCacheQuota(official: QuotaDisplay, cache: QuotaDisplay): QuotaDisplay {
  if (!cache.hasQuota || cache.windows.length === 0) {
    return official;
  }
  const cacheWindow = cache.windows[0];
  const windows = official.windows.map(window => {
    if (window.label !== "5h") {
      return window;
    }
    if (cacheWindow.usagePct <= window.usagePct) {
      return window;
    }
    return {
      ...window,
      usagePct: cacheWindow.usagePct,
      reset: cacheWindow.reset,
      resetInSeconds: cacheWindow.resetInSeconds
    };
  });
  const hasFiveHourWindow = windows.some(window => window.label === "5h");
  if (!hasFiveHourWindow && cacheWindow.usagePct > official.usagePct) {
    return cache;
  }
  return quotaDisplay(windows);
}

function quotaDisplay(windows: QuotaWindowDisplay[]): QuotaDisplay {
  let selected = windows[0] ?? { label: "", usagePct: 0, reset: "" };
  for (const window of windows.slice(1)) {
    if (window.usagePct > selected.usagePct) {
      selected = window;
    }
  }
  return {
    usagePct: selected.usagePct,
    reset: selected.reset,
    hasQuota: windows.length > 0,
    windows
  };
}

function noQuota(): QuotaDisplay {
  return { usagePct: 0, reset: "", hasQuota: false, windows: [] };
}

function officialQuotaKeys(modelDisplay: string): Array<{ key: string; label: string }> {
  const normalized = modelDisplay.toLowerCase();
  if (normalized.includes("claude") || normalized.includes("gpt") || normalized.includes("oss")) {
    return [{ key: "3p-5h", label: "5h" }, { key: "3p-weekly", label: "W" }];
  }
  return [{ key: "gemini-5h", label: "5h" }, { key: "gemini-weekly", label: "W" }];
}

function formatResetClock(reset: string): string {
  if (reset === "") {
    return "";
  }
  const target = new Date(reset.replace("Z", "+00:00"));
  if (Number.isNaN(target.getTime())) {
    return "";
  }
  return `${pad2(target.getHours())}:${pad2(target.getMinutes())}`;
}

function formatOfficialReset(bucket: OfficialQuotaBucket): string {
  if (Number.isFinite(bucket.reset_in_seconds) && (bucket.reset_in_seconds ?? 0) > 0) {
    return formatResetDuration(bucket.reset_in_seconds ?? 0);
  }
  return formatResetClock(bucket.reset_time ?? "");
}

function formatResetDuration(seconds: number): string {
  let totalMinutes = Math.max(0, Math.trunc(seconds / 60));
  const days = Math.trunc(totalMinutes / (24 * 60));
  totalMinutes -= days * 24 * 60;
  const hours = Math.trunc(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) {
    return `${formatInt(days)}d ${formatInt(hours)}h`;
  }
  if (hours > 0) {
    return `${formatInt(hours)}h ${formatInt(minutes)}m`;
  }
  return `${formatInt(minutes)}m`;
}

function contextValue(config: Config, ctx: Payload["context_window"], pct: number): string {
  const tokens = tokenDetail(ctx);
  switch (config.contextValue) {
    case "tokens":
      if (tokens !== "") {
        return tokens.replace(/^\(/, "").replace(/\)$/, "");
      }
      break;
    case "both":
      if (tokens !== "") {
        return `${coloredPct(pct, pct, config)} ${tokens}`;
      }
      break;
  }
  return coloredPct(pct, pct, config);
}

function contextPercent(ctx: Payload["context_window"]): number {
  const inputTokens = ctx?.total_input_tokens ?? 0;
  const windowSize = ctx?.context_window_size ?? 0;
  if (Number.isFinite(inputTokens) && Number.isFinite(windowSize) && inputTokens > 0 && windowSize > 0) {
    return clampFloat((inputTokens / windowSize) * 100);
  }

  const upstream = ctx?.used_percentage ?? 0;
  if (!Number.isFinite(upstream)) {
    return 0;
  }
  return clampFloat(upstream);
}

function usageLabel(config: Config, quota: QuotaDisplay, withBar: boolean): string {
  if (quota.windows.length > 1) {
    return `${quota.windows.map(window => usageWindowLabel(config, window, withBar)).join(" |  ")}`;
  }
  let label = "";
  if (withBar && config.showProgressBar) {
    label += `${usageBar(config, quota.usagePct)} `;
  }
  return label + usageValue(config, quota.usagePct);
}

function usageWindowLabel(config: Config, window: QuotaWindowDisplay, withBar: boolean): string {
  let text = "";
  if (window.label !== "") {
    text += `${window.label} `;
  }
  if (withBar && config.showProgressBar) {
    text += `${usageBar(config, window.usagePct, 10)} `;
  }
  return text + usageWindowValue(config, window.usagePct) + inlineResetSuffix(config, window.reset);
}

function usageWindowValue(config: Config, usagePct: number): string {
  if (config.usageValue === "remaining") {
    return coloredPct(100 - usagePct, usagePct, config);
  }
  return coloredPct(usagePct, usagePct, config);
}

function usageValue(config: Config, usagePct: number): string {
  if (config.usageValue === "remaining") {
    return `${coloredPct(100 - usagePct, usagePct, config)} left`;
  }
  return coloredPct(usagePct, usagePct, config);
}

function usageBar(config: Config, usagePct: number, width = 8): string {
  const fillPct = config.usageValue === "remaining" ? 100 - usagePct : usagePct;
  return progressBarWithColor(fillPct, usagePct, width, config.color);
}

function tokenDetail(ctx: Payload["context_window"]): string {
  const total = ctx?.total_input_tokens;
  const windowSize = ctx?.context_window_size ?? 0;
  if (typeof total !== "number" || total <= 0 || windowSize <= 0) {
    return "";
  }
  return `(${formatTokens(total)}/${formatTokens(windowSize)})`;
}

export function formatTokens(n: number): string {
  if (n >= 1_000_000) {
    if (n % 1_000_000 === 0) {
      return `${formatInt(n / 1_000_000)}M`;
    }
    return `${Number((n / 1_000_000).toFixed(1))}M`;
  }
  if (n >= 1000) {
    if (n >= 10_000) {
      return `${formatInt((n + 500) / 1000)}k`;
    }
    const val = Number((n / 1000).toFixed(1));
    return `${val}k`;
  }
  return formatInt(n);
}

function progressBar(pct: number, width: number, color: boolean): string {
  return progressBarWithColor(pct, pct, width, color);
}

export function progressBarWithColor(fillPct: number, colorPct: number, width: number, color: boolean): string {
  fillPct = clampInt(fillPct);
  colorPct = clampInt(colorPct);
  let filled = Math.trunc((fillPct / 100) * width + 0.5);
  if (filled === width && fillPct < 100) {
    filled = width - 1;
  }
  if (filled === 0 && fillPct > 0) {
    filled = 1;
  }
  if (filled < 0) filled = 0;
  if (filled > width) filled = width;
  const bar = `${"█".repeat(filled)}${"░".repeat(width - filled)}`;
  if (!color) {
    return bar;
  }
  return colorize(bar, percentageColor(colorPct), true);
}

export function percentageColor(pct: number): string {
  if (pct >= 90) return colorRed;
  if (pct >= 75) return colorOrange;
  if (pct >= 50) return colorYellow;
  return colorGreen;
}

function state(raw: string): string {
  switch (raw.toLowerCase()) {
    case "":
    case "idle":
      return "Idle";
    case "thinking":
      return "Thinking";
    case "authenticating":
      return "Auth";
    default:
      return title(raw);
  }
}

function stateColor(label: string): string {
  switch (label) {
    case "Idle":
      return colorGreen;
    case "Thinking":
      return colorYellow;
    case "Auth":
      return colorCyan;
    default:
      return colorCyan;
  }
}

function colorize(input: string, colorCode: string, enabled: boolean): string {
  if (!enabled || input === "") {
    return input;
  }
  return `${colorCode}${input}${colorReset}`;
}

function join(...parts: string[]): string {
  return parts.filter(part => part !== "").join("  ");
}

function joinHeader(...parts: string[]): string {
  return parts.filter(part => part !== "").join(" │ ");
}

function fit(input: string, width: number): string {
  if (width <= 0 || visibleLen(input) <= width) {
    return input;
  }
  return truncateColumns(input, width);
}

export function clampInt(n: number): number {
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

export function clampFloat(n: number): number {
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

function coloredPct(pct: number, colorPct: number, config: Config): string {
  return colorize(`${formatPct(pct)}%`, percentageColor(colorPct), config.color);
}

function formatPct(n: number): string {
  return n.toFixed(2);
}

function formatInt(n: number): string {
  return Math.trunc(n).toString(10);
}

function pad2(n: number): string {
  if (n < 10) {
    return `0${formatInt(n)}`;
  }
  return formatInt(n);
}

function title(raw: string): string {
  const fields = raw.trim().split(/\s+/).filter(Boolean);
  for (let i = 0; i < fields.length; i++) {
    const runes = Array.from(fields[i].toLowerCase());
    if (runes.length > 0 && runes[0] >= "a" && runes[0] <= "z") {
      runes[0] = runes[0].toUpperCase();
    }
    fields[i] = runes.join("");
  }
  if (fields.length === 0) {
    return "Active";
  }
  return fields.join(" ");
}
