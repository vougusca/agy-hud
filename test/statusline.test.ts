import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { strip, visibleLen } from "../src/ansi";
import { defaultConfig, Config, parseConfig } from "../src/config";
import { Cache } from "../src/quota";
import {
  Payload,
  render,
  shortModelName,
  formatCost,
  formatTokens,
  renderSubagentLine,
  shortenRole,
  formatResetTenth,
  formatQuotaSegments,
  formatQuotaChip,
  renderUnifiedLine2,
  QuotaDisplay,
  QuotaWindowDisplay
} from "../src/statusline";
import { AgentTokenStats, SubagentTrackerResult } from "../src/subagentTracker";

function fixturePayload(): Payload {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "testdata", "statusline_payload.json"), "utf8"));
}

function renderFixture(config: Config, cache: Cache | null = null, payload: Payload | null = null): string {
  return render(payload ?? fixturePayload(), {
    config,
    quota: cache,
    gitBranch: "main",
    now: new Date("2026-05-19T12:00:00Z")
  });
}

test("short model name strips Gemini and compacts tier", () => {
  const cases: Record<string, string> = {
    "Gemini 3.8 Flash (High)": "3.8 Flash High",
    "Gemini 3.7 Flash (Medium)": "3.7 Flash Med",
    "Gemini 3.6 Flash (Low)": "3.6 Flash Low",
    "GPT-OSS 120B (Medium)": "GPT-OSS 120B Med",
    "Gemini 3.5 Flash (High)": "3.5 Flash High",
    "Gemini 3.1 Pro (High)": "3.1 Pro High",
    "Gemini 3.5 Flash (Medium)": "3.5 Flash Med",
    "Claude Sonnet 4.6 (Thinking)": "Sonnet 4.6",
    "Claude Opus 4.6 (Thinking)": "Opus 4.6"
  };
  for (const [input, want] of Object.entries(cases)) {
    assert.equal(shortModelName(input), want);
  }
});

test("combined model plan badge and no duplicate model", () => {
  const out = strip(renderFixture(defaultConfig()));
  assert.match(out, /󱐋 3\.5 Flash Med \|  Pro/);
  assert.equal((out.match(/3\.5 Flash Med/g) ?? []).length, 1);
});

test("combined model plan badge displays Ultra for various rawPlan variations", () => {
  const variations = ["Ultra", "Google AI Ultra", "Google AI Ultra Plan", "gemini ultra", "ULTRA", "google ai ultra tier"];
  for (const rawPlan of variations) {
    const payload = fixturePayload();
    payload.plan_tier = rawPlan;
    const out = strip(renderFixture(defaultConfig(), null, payload));
    assert.match(out, /󱐋 3\.5 Flash Med \|  Ultra/, `Failed for rawPlan: ${rawPlan}`);
  }
});

test("combined model plan badge displays Pro for various rawPlan variations", () => {
  const variations = ["Pro", "Google AI Pro", "Google AI Pro Plan", "gemini pro", "PRO", "google ai pro tier"];
  for (const rawPlan of variations) {
    const payload = fixturePayload();
    payload.plan_tier = rawPlan;
    const out = strip(renderFixture(defaultConfig(), null, payload));
    assert.match(out, /󱐋 3\.5 Flash Med \|  Pro/, `Failed for rawPlan: ${rawPlan}`);
  }
});

test("multiline default shape uses context and quota", () => {
  const cache: Cache = {
    models: {
      "Gemini 3.5 Flash (Medium)": {
        remainingFraction: 0.20,
        resetTime: "2026-05-19T12:44:00Z"
      }
    }
  };
  const config: Config = { ...defaultConfig(), line2Style: "classic" };
  const out = strip(renderFixture(config, cache));
  const lines = out.split("\n");
  assert.equal(lines.length, 2);
  assert.match(lines[0], /󱐋 3\.5 Flash Med \|  Pro/);
  assert.match(lines[0], / agy-hud/);
  assert.match(lines[0], / main/);
  assert.match(lines[0], /Idle/);
  assert.doesNotMatch(lines[0], /  \|  |  │  /);
  assert.match(lines[1], /Ctx/);
  assert.match(lines[1], /11.92%/);
  assert.doesNotMatch(lines[1], /  \|  |  │  /);
  assert.match(lines[1], /% left/);
  assert.match(lines[1], /20.00% left/);
  assert.match(lines[1], /██░░░░░░ 20.00% left ↻ Reset \d\d:\d\d/);
  assert.doesNotMatch(lines[1], /↻ 00:44/);
  assert.doesNotMatch(lines[1], /resets/);
  assert.doesNotMatch(lines[1], /Idle/);
});

test("remaining quota renders as a context-style bar from precise fraction", () => {
  const cache: Cache = {
    models: {
      "Gemini 3.5 Flash (Medium)": {
        remainingFraction: 0.8475794,
        resetTime: "2026-05-19T14:04:00Z"
      }
    }
  };
  const config = defaultConfig();
  config.color = false;
  config.line2Style = "classic";

  const out = strip(renderFixture(config, cache));

  assert.match(out, /███████░ 84.76% left ↻ Reset \d\d:\d\d/);
  assert.doesNotMatch(out, /\u2009/);
  assert.doesNotMatch(out, /↻ 02:04/);
});

test("official quota payload renders five-hour and weekly windows over stale quota cache", () => {
  const payload = fixturePayload();
  payload.terminal_width = 160;
  payload.quota = {
    "gemini-5h": {
      remaining_fraction: 0.8423024,
      reset_time: "2026-06-15T08:21:23Z",
      reset_in_seconds: 16151
    },
    "gemini-weekly": {
      remaining_fraction: 0.90918493,
      reset_time: "2026-06-19T01:21:19Z",
      reset_in_seconds: 336547
    }
  };
  const staleCache: Cache = {
    models: {
      "Gemini 3.5 Flash (Medium)": {
        remainingFraction: 0.2,
        resetTime: "2026-05-19T12:44:00Z"
      }
    }
  };
  const config = { ...defaultConfig(), line2Style: "classic" as const, color: false };

  const out = strip(render(payload, {
    config,
    quota: staleCache,
    gitBranch: "main",
    now: new Date("2026-06-15T03:52:00Z")
  }));

  assert.match(out, /5h ████████░░ 84.23% \(↻ 4h 29m\) \|  W █████████░ 90.92% \(↻ 3d 21h\)/);
  assert.doesNotMatch(out, /20.00% left/);
});

test("untouched official third-party quota does not override consumed active-model cache", () => {
  const payload = fixturePayload();
  payload.model = { display_name: "Claude Opus 4.6 (Thinking)" };
  payload.quota = {
    "3p-5h": {
      remaining_fraction: 1,
      reset_time: "2026-06-27T09:48:56Z"
    }
  };
  const cache: Cache = {
    timestamp: "2026-06-27T04:51:30Z",
    models: {
      "Claude Opus 4.6 (Thinking)": {
        remainingFraction: 0.92,
        resetTime: "2026-06-27T09:48:56Z"
      }
    }
  };
  const config = { ...defaultConfig(), line2Style: "classic" as const, color: false, contextValue: "both" };

  const out = strip(render(payload, {
    config,
    quota: cache,
    gitBranch: "main",
    now: new Date("2026-06-27T04:52:00Z")
  }));

  assert.match(out, /███████░ 92.00% left ↻ Reset \d\d:\d\d/);
  assert.doesNotMatch(out, /100.00% left/);
});

test("fresh active-model cache can override stale official third-party quota with higher remaining value", () => {
  const payload = fixturePayload();
  payload.model = { display_name: "Claude Opus 4.6 (Thinking)" };
  payload.quota = {
    "3p-5h": {
      remaining_fraction: 0.29,
      reset_time: "2026-06-27T09:48:56Z"
    }
  };
  const cache: Cache = {
    timestamp: "2026-06-27T05:08:37Z",
    models: {
      "Claude Opus 4.6 (Thinking)": {
        remainingFraction: 0.1661196,
        resetTime: "2026-06-27T09:48:56Z"
      }
    }
  };
  const config = { ...defaultConfig(), line2Style: "classic" as const, color: false };

  const out = strip(render(payload, {
    config,
    quota: cache,
    gitBranch: "main",
    now: new Date("2026-06-27T05:09:00Z")
  }));

  assert.match(out, /█░░░░░░░ 16.61% left ↻ Reset \d\d:\d\d/);
  assert.doesNotMatch(out, /29% left/);
});

test("official quota uses third-party buckets for Claude and GPT models", () => {
  const payload = fixturePayload();
  payload.model = { display_name: "Claude Sonnet 4.6 (Thinking)" };
  payload.quota = {
    "3p-5h": {
      remaining_fraction: 0.48,
      reset_time: "2026-06-15T08:52:11Z"
    },
    "gemini-5h": {
      remaining_fraction: 0.84,
      reset_time: "2026-06-15T08:21:23Z"
    }
  };
  const config = { ...defaultConfig(), line2Style: "classic" as const, color: false };

  const out = strip(render(payload, {
    config,
    gitBranch: "main",
    now: new Date("2026-06-15T03:52:00Z")
  }));

  assert.match(out, /Sonnet 4\.6/);
  assert.match(out, /████░░░░ 48.00% left ↻ Reset \d\d:\d\d/);
});

test("agent state can be hidden", () => {
  const config = defaultConfig();
  config.showAgentState = false;
  assert.doesNotMatch(strip(renderFixture(config)), /Idle/);
});

test("current Gemini, Claude and GPT labels select the matching dual quota windows", () => {
  for (const [label, wantFiveHour, wantWeekly] of [
    ["Gemini 3.8 Flash (High)", "42(?:\\.00)?%", "81(?:\\.00)?%"],
    ["Claude Sonnet 4.6 (Thinking)", "13(?:\\.00)?%", "67(?:\\.00)?%"],
    ["GPT-OSS 120B (Medium)", "13(?:\\.00)?%", "67(?:\\.00)?%"]
  ]) {
    const payload = { ...fixturePayload(), terminal_width: 180, model: { display_name: label }, quota: {
      "gemini-5h": { remaining_fraction: 0.42 }, "gemini-weekly": { remaining_fraction: 0.81 },
      "3p-5h": { remaining_fraction: 0.13 }, "3p-weekly": { remaining_fraction: 0.67 }
    } };
    const usage = render(payload, { config: { ...defaultConfig(), line2Style: "classic", color: false } }).split("\n")[1];
    assert.match(usage, new RegExp(wantFiveHour));
    assert.match(usage, new RegExp(wantWeekly));
  }
});

test("context value formats", () => {
  const cases: Record<string, string> = {
    percent: "Ctx █░░░░░░░░░ 11.92%",
    tokens: "Ctx █░░░░░░░░░ 125k/1M",
    both: "Ctx █░░░░░░░░░ 11.92% (125k/1M)"
  };
  for (const [value, want] of Object.entries(cases)) {
    const config = { ...defaultConfig(), line2Style: "classic" as const, color: false, contextValue: value };
    assert.match(renderFixture(config), new RegExp(want.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("context percent ignores volatile output token count", () => {
  const payload = fixturePayload();
  payload.context_window = {
    total_input_tokens: 60_000,
    total_output_tokens: 40_000,
    context_window_size: 1_000_000,
    used_percentage: 10
  };
  const config = { ...defaultConfig(), line2Style: "classic" as const, color: false, contextValue: "both" };

  const out = strip(render(payload, {
    config,
    gitBranch: "main",
    now: new Date("2026-05-19T12:00:00Z")
  }));

  assert.match(out, /Ctx .* 6.00%/);
  assert.match(out, /\(60k\/1M\)/);
  assert.doesNotMatch(out, /Ctx .* 10%/);
  assert.doesNotMatch(out, /\(100k\/1M\)/);
});

test("usage value can show percent used", () => {
  const cache: Cache = {
    models: {
      "Gemini 3.5 Flash (Medium)": {
        remainingFraction: 0.20,
        resetTime: "2026-05-19T12:44:00Z"
      }
    }
  };
  const config = { ...defaultConfig(), line2Style: "classic" as const, color: false, usageValue: "percent" };
  assert.match(renderFixture(config, cache), /██████░░ 80.00% ↻ Reset \d\d:\d\d/);
  assert.doesNotMatch(renderFixture(config, cache), /↻ 00:44/);
});

test("header uses theme palette ANSI colors", () => {
  const out = renderFixture(defaultConfig());
  const lines = out.split("\n");
  assert.match(lines[0], /\x1b\[36m󱐋 3\.5 Flash Med\x1b\[0m \x1b\[34m\|  Pro\x1b\[0m/);
  assert.match(lines[0], /\x1b\[33m agy-hud\x1b\[0m/);
  assert.match(lines[0], /\x1b\[38;5;109m main\x1b\[0m/);
});

test("remaining usage bar color reflects used percentage", () => {
  const cache: Cache = {
    models: {
      "Gemini 3.5 Flash (Medium)": {
        remainingFraction: 0.40,
        resetTime: "2026-05-19T12:44:00Z"
      }
    }
  };
  const out = renderFixture({ ...defaultConfig(), line2Style: "classic" }, cache);
  assert.match(out, /\x1b\[33m███░░░░░\x1b\[0m/);
  assert.match(out, /\x1b\[33m40\.00%\x1b\[0m left/);
  assert.match(strip(out), /40.00% left/);
});

test("context percentage text color reflects usage", () => {
  const payload = fixturePayload();
  payload.context_window = {
    total_input_tokens: 95,
    context_window_size: 100
  };
  const out = renderFixture({ ...defaultConfig(), line2Style: "classic" }, null, payload);
  assert.match(out, /\x1b\[31m95\.00%\x1b\[0m/);
});

test("quota miss omits usage without fake limit", () => {
  const out = strip(renderFixture(defaultConfig()));
  assert.doesNotMatch(out, /Limit --/);
  assert.doesNotMatch(out, /% left/);
  assert.doesNotMatch(out, /weekly/);
});

test("full remaining quota hides inactive reset countdown", () => {
  const cache: Cache = {
    models: {
      "Gemini 3.5 Flash (Medium)": {
        remainingFraction: 1,
        resetTime: "2026-05-19T14:44:00Z"
      }
    }
  };
  const out = strip(renderFixture({ ...defaultConfig(), line2Style: "classic" }, cache));
  assert.match(out, /% left/);
  assert.match(out, /100.00% left/);
  assert.doesNotMatch(out, /↻/);
  assert.doesNotMatch(out, /02:44/);
});

test("payload model wins over stale cache active model", () => {
  const payload = fixturePayload();
  payload.model = { display_name: "Claude Sonnet 4.6 (Thinking)" };
  const cache: Cache = {
    models: {
      "Gemini 3.5 Flash (High)": {
        remainingFraction: 0.8,
        resetTime: "2026-05-19T12:44:00Z"
      },
      "Claude Sonnet 4.6 (Thinking)": {
        remainingFraction: 1,
        resetTime: "2026-05-19T16:44:00Z"
      }
    }
  };

  const out = strip(render(payload, {
    config: { ...defaultConfig(), line2Style: "classic" },
    quota: { ...cache, active_model: "Gemini 3.5 Flash (High)" } as Cache,
    gitBranch: "main",
    now: new Date("2026-05-19T12:00:00Z")
  }));

  assert.match(out, /Sonnet 4\.6/);
  assert.match(out, /100.00% left/);
  assert.doesNotMatch(out, /3\.5 Flash High/);
});

test("single-line can show token detail only when it fits", () => {
  const config = defaultConfig();
  config.multiline = false;
  config.showProgressBar = false;
  const out = strip(renderFixture(config));
  assert.doesNotMatch(out, /\n/);
  assert.match(out, /\(125k\/1M\)/);

  const payload = fixturePayload();
  payload.terminal_width = 35;
  const narrow = render(payload, {
    config,
    gitBranch: "main",
    now: new Date("2026-05-19T12:00:00Z")
  });
  assert.doesNotMatch(strip(narrow), /\(125k\/1M\)/);
  assert.ok(visibleLen(narrow) <= 35);
});

test("color can be disabled", () => {
  const config = defaultConfig();
  config.color = false;
  assert.doesNotMatch(renderFixture(config), /\x1b\[/);
});

test("icons can be disabled", () => {
  const config = defaultConfig();
  config.showIcons = false;
  const out = strip(renderFixture(config));
  for (const icon of ["󱐋", "", "", "", "", "", "↻"]) {
    assert.doesNotMatch(out, new RegExp(icon));
  }
  assert.match(out, /3\.5 Flash Med \| Pro/);
  assert.match(out, /agy-hud/);
  assert.match(out, /main/);
});

test("sensitive payload fields never leak", () => {
  const payload = fixturePayload();
  payload.email = "private-email-value";
  payload.session_id = "private-session-value";
  payload.conversation_id = "private-conversation-value";
  payload.transcript_path = "private-transcript-location";
  const out = render(payload, {
    config: defaultConfig(),
    quota: { email: "private-cache-email-value", models: {} },
    now: new Date("2026-05-19T12:00:00Z")
  });
  const lower = strip(out).toLowerCase();
  for (const forbidden of ["private-email-value", "private-session-value", "private-conversation-value", "private-transcript-location", "csrf", "cookie", "token", "key"]) {
    assert.doesNotMatch(lower, new RegExp(forbidden));
  }
});

test("width degradation keeps every line within terminal width", () => {
  for (const width of [10, 20, 30, 40, 60, 80]) {
    const payload = fixturePayload();
    payload.terminal_width = width;
    const out = render(payload, {
      config: defaultConfig(),
      gitBranch: "main",
      now: new Date("2026-05-19T12:00:00Z")
    });
    for (const line of out.split("\n")) {
      assert.ok(visibleLen(line) <= width, `width ${width} exceeded by line ${JSON.stringify(line)}`);
    }
  }
});

test("formatCost formats USD values cleanly", () => {
  assert.equal(formatCost(0), "$0.00");
  assert.equal(formatCost(-1), "$0.00");
  assert.equal(formatCost(Number.NaN), "$0.00");
  assert.equal(formatCost(0.0004), "<$0.001");
  assert.equal(formatCost(0.0042), "$0.004");
  assert.equal(formatCost(0.012), "$0.01");
  assert.equal(formatCost(0.158), "$0.16");
  assert.equal(formatCost(1.25), "$1.25");
  assert.equal(formatCost(12.5), "$12.50");
});

test("renders cost at the end of line 1 when available", () => {
  const payload = fixturePayload();
  payload.cost = {
    total_usd: 0.0345
  };
  const out = strip(render(payload, {
    config: defaultConfig(),
    gitBranch: "main",
    now: new Date("2026-05-19T12:00:00Z")
  }));
  const line1 = out.split("\n")[0];
  assert.match(line1, /Idle │ \$0\.03$/);

  // Can be disabled via showCost
  const noCostConfig = defaultConfig();
  noCostConfig.showCost = false;
  const noCostOut = strip(render(payload, {
    config: noCostConfig,
    gitBranch: "main",
    now: new Date("2026-05-19T12:00:00Z")
  }));
  assert.doesNotMatch(noCostOut.split("\n")[0], /\$0\.03/);
});

test("single-line renders cost at the end when it fits", () => {
  const payload = fixturePayload();
  payload.cost = {
    total_usd: 0.12
  };
  const config = defaultConfig();
  config.multiline = false;
  const out = strip(render(payload, {
    config,
    gitBranch: "main",
    now: new Date("2026-05-19T12:00:00Z")
  }));
  assert.doesNotMatch(out, /\n/);
  assert.match(out, /Idle  \$0\.12$/);
});

test("multiline drops cost before directory or branch at boundary widths", () => {
  const payload: Payload = {
    model: { display_name: "Claude Sonnet 4.6" }, cwd: "/workspace/project",
    plan_tier: "Google AI Pro", agent_state: "idle", cost: { total_usd: 0 }
  };
  const config = { ...defaultConfig(), line2Style: "classic" as const, color: false, showIcons: false };
  const cases = [
    [40, "Sonnet 4.6 | Pro │ project │ main │ Idle"],
    [32, "Sonnet 4.6 | Pro │ main │ Idle"]
  ] as const;
  for (const [width, want] of cases) {
    assert.equal(render({ ...payload, terminal_width: width }, { config, gitBranch: "main" }).split("\n")[0], want);
  }
});

test("single-line drops cost before quota at boundary width", () => {
  const payload: Payload = {
    model: { display_name: "Claude Sonnet 4.6" }, plan_tier: "Google AI Pro",
    terminal_width: 50, agent_state: "idle", context_window: { used_percentage: 12 },
    quota: { "3p-5h": { remaining_fraction: 0.01 } }, cost: { total_usd: 0 }
  };
  const config = { ...defaultConfig(), multiline: false, color: false, showIcons: false };
  assert.equal(render(payload, { config }), "Sonnet 4.6 | Pro  Ctx 12.00%  1.00% left  Idle");
});

test("cost estimates are marked in both layouts using the provided total", () => {
  for (const multiline of [true, false]) {
    const config = { ...defaultConfig(), multiline, color: false };
    const payload = { ...fixturePayload(), terminal_width: 180, cost: { total_usd: 1.25, subagent_usd: 0.25, estimated: true } };
    assert.match(render(payload, { config }).split("\n")[0], /~\$1\.25$/);
    payload.cost.estimated = false;
    assert.match(render(payload, { config }).split("\n")[0], /[^~]\$1\.25$/);
  }
});

test("invalid cost is omitted rather than reported as zero spend", () => {
  for (const multiline of [true, false]) {
    for (const total_usd of [NaN, Infinity, -1]) {
      const out = render({ ...fixturePayload(), cost: { total_usd }, terminal_width: 180 }, {
        config: { ...defaultConfig(), multiline, color: false }
      });
      assert.doesNotMatch(out, /\$/);
    }
  }
});

test("plan badges normalize known tiers and do not call unknown paid plans Free", () => {
  const cases = [
    ["Pro", "Pro"], ["Google AI Pro", "Pro"], [" pro ", "Pro"],
    ["Ultra", "Ultra"], ["Google AI Ultra", "Ultra"], ["Free", "Free"],
    ["Google AI Free", "Free"], ["Enterprise", "Plan ?"], ["", "Plan ?"],
    ["\x1b]0;untrusted title\x07", "Plan ?"]
  ];
  for (const [plan_tier, want] of cases) {
    const out = render({ model: { display_name: "Claude Sonnet 4.6" }, plan_tier, terminal_width: 100 }, {
      config: { ...defaultConfig(), line2Style: "classic" as const, color: false, showIcons: false }
    });
    assert.equal(out.split("\n")[0], `Sonnet 4.6 | ${want} │ Idle`);
  }
});

test("narrow CJK model headers are clipped to columns without splitting graphemes", () => {
  for (const [display_name, width, want] of [["中文模型", 3, "中"], ["👩‍💻abc", 2, "👩‍💻"], ["e\u0301abc", 1, "e\u0301"]] as const) {
    const out = render({ model: { display_name }, terminal_width: width }, {
      config: { ...defaultConfig(), color: false, showIcons: false, showAgentState: false }
    });
    assert.equal(out.split("\n")[0], want);
  }
});

test("recent emoji headers neither overflow nor disappear at two columns", () => {
  for (const model of ["🫨", "🧑🏽‍💻"]) {
    const out = render({ model: { display_name: `${model}abc` }, terminal_width: 2 }, {
      config: { ...defaultConfig(), color: false, showIcons: false, showAgentState: false }
    });
    assert.equal(out.split("\n")[0], model);
  }
});

test("cost and wide workspace labels obey both layout width limits", () => {
  for (const multiline of [true, false]) {
    for (const width of [10, 20, 30, 40, 60, 80]) {
      for (const total_usd of [0, 0.0001, 0.01, 1.25]) {
        const payload = { ...fixturePayload(), cwd: "/workspace/中文目录👩‍💻", terminal_width: width, cost: { total_usd, estimated: true } };
        const out = render(payload, { config: { ...defaultConfig(), multiline }, gitBranch: "main" });
        for (const line of out.split("\n")) assert.ok(visibleLen(line) <= width);
      }
    }
  }
});

test("formatTokens accurately handles sub-10k decimals and whole suffixes", () => {
  assert.equal(formatTokens(2200), "2.2k");
  assert.equal(formatTokens(2000), "2k");
  assert.equal(formatTokens(8000), "8k");
  assert.equal(formatTokens(8200), "8.2k");
  assert.equal(formatTokens(15000), "15k");
  assert.equal(formatTokens(45000), "45k");
  assert.equal(formatTokens(125000), "125k");
  assert.equal(formatTokens(1000000), "1M");
  assert.equal(formatTokens(1500000), "1.5M");
  assert.equal(formatTokens(500), "500");
  assert.equal(formatTokens(0), "0");
});

test("shortenRole maps common agent roles to concise tokens", () => {
  assert.equal(shortenRole("code-reviewer"), "rev");
  assert.equal(shortenRole("reviewer"), "rev");
  assert.equal(shortenRole("debugger"), "dbg");
  assert.equal(shortenRole("dev"), "dev");
  assert.equal(shortenRole("devops"), "ops");
  assert.equal(shortenRole("explorer"), "exp");
  assert.equal(shortenRole("orchestrator"), "orch");
  assert.equal(shortenRole("planner"), "plan");
  assert.equal(shortenRole("test-engineer"), "test");
  assert.equal(shortenRole("tester"), "test");
  assert.equal(shortenRole("web-researcher"), "web");
  assert.equal(shortenRole("researcher"), "web");
  assert.equal(shortenRole("writer"), "doc");
  assert.equal(shortenRole("subagent"), "sub");
  // Default fallback tests: <= 4 chars preserved, > 4 chars sliced to 4
  assert.equal(shortenRole("qa"), "qa");
  assert.equal(shortenRole("analyst"), "anal");
  assert.equal(shortenRole("custom-agent"), "cust");
});

test("shortenRole handles nullish, empty, and malformed role inputs safely", () => {
  assert.equal(shortenRole(null), "");
  assert.equal(shortenRole(undefined), "");
  assert.equal(shortenRole(""), "");
  assert.equal(shortenRole("   "), "");
  assert.equal(shortenRole(123 as any), "");
  assert.equal(shortenRole("  reviewer  "), "rev");
  assert.equal(shortenRole("  DEV  "), "dev");
  assert.equal(shortenRole("  WRITER  "), "doc");
});

test("renderSubagentLine renders root badge and subagent badges with correct glyphs", () => {
  const stats: AgentTokenStats[] = [
    { index: 0, id: "root", role: "root", status: "thinking", isRunning: false, activeTokens: 2200, cumulativeTokens: 45000 },
    { index: 1, id: "sub1", role: "dev", status: "running", isRunning: true, activeTokens: 15000, cumulativeTokens: 40000 },
    { index: 2, id: "sub2", role: "code-reviewer", status: "idle", isRunning: false, activeTokens: 8000, cumulativeTokens: 22000 }
  ];

  // Colors disabled for clear string comparison
  const lineNoColor = renderSubagentLine(stats, 120, false);
  assert.equal(lineNoColor, "[◆ 2.2k/45k] [2:rev 8k/22k ○] [1:dev 15k/40k ●]");

  // Colors enabled: check ANSI preservation and visible length parity
  const lineColored = renderSubagentLine(stats, 120, true);
  assert.equal(strip(lineColored), "[◆ 2.2k/45k] [2:rev 8k/22k ○] [1:dev 15k/40k ●]");
  assert.equal(visibleLen(lineColored), visibleLen(lineNoColor));
  assert.match(lineColored, /\x1b\[36m\[◆ 2.2k\/45k\]\x1b\[0m/); // Cyan root badge
  assert.match(lineColored, /●/); // Running green dot
  assert.match(lineColored, /○/); // Dimmed idle circle
});

test("renderSubagentLine responsive degradation tiers under narrow widths", () => {
  const stats: AgentTokenStats[] = [
    { index: 0, id: "root", role: "root", status: "idle", isRunning: false, activeTokens: 2200, cumulativeTokens: 45000 },
    { index: 1, id: "sub1", role: "dev", status: "running", isRunning: true, activeTokens: 15000, cumulativeTokens: 40000 },
    { index: 2, id: "sub2", role: "code-reviewer", status: "idle", isRunning: false, activeTokens: 8000, cumulativeTokens: 22000 }
  ];

  // Tier 1 (Full): visible length is 49 chars -> fits in width 50
  const tier1 = renderSubagentLine(stats, 50, false);
  assert.equal(tier1, "[◆ 2.2k/45k] [2:rev 8k/22k ○] [1:dev 15k/40k ●]");

  // Tier 2 (Compact Roles): when width is 45, Tier 1 doesn't fit, Tier 2 does:
  // "[◆ 2.2k/45k] [2:8k/22k ○] [1:15k/40k ●]" (41 chars)
  const tier2 = renderSubagentLine(stats, 45, false);
  assert.equal(tier2, "[◆ 2.2k/45k] [2:8k/22k ○] [1:15k/40k ●]");

  // Tier 3 (Active Priority): width 38 -> Tier 2 (41) doesn't fit
  const tier3 = renderSubagentLine(stats, 38, false);
  assert.match(tier3, /\[\+1 idle\]/);
  assert.ok(visibleLen(tier3) <= 38);

  // Tier 4 (Ultra-narrow): width 24 -> "[◆ 2.2k/45k] [1 active]" (23 chars)
  const tier4 = renderSubagentLine(stats, 24, false);
  assert.equal(tier4, "[◆ 2.2k/45k] [1 active]");
  assert.ok(visibleLen(tier4) <= 24);

  // Strict boundary check: all widths between 10 and 100 must never exceed width
  for (let w = 10; w <= 100; w++) {
    const rendered = renderSubagentLine(stats, w, true);
    assert.ok(visibleLen(rendered) <= w, `Overflow at width ${w}: "${strip(rendered)}"`);
  }
});

test("subagents are rendered in reverse index order (most recent first)", () => {
  const stats: AgentTokenStats[] = [
    { index: 0, id: "root", role: "root", status: "idle", isRunning: false, activeTokens: 2200, cumulativeTokens: 45000 },
    { index: 1, id: "sub1", role: "dev", status: "running", isRunning: true, activeTokens: 15000, cumulativeTokens: 40000 },
    { index: 2, id: "sub2", role: "reviewer", status: "running", isRunning: true, activeTokens: 8000, cumulativeTokens: 22000 },
    { index: 3, id: "sub3", role: "writer", status: "running", isRunning: true, activeTokens: 4000, cumulativeTokens: 10000 }
  ];

  // renderSubagentLine renders [3:...] [2:...] [1:...]
  const classic = renderSubagentLine(stats, 150, false);
  assert.equal(
    classic,
    "[◆ 2.2k/45k] [3:doc 4k/10k ●] [2:rev 8k/22k ●] [1:dev 15k/40k ●]"
  );

  // renderUnifiedLine2 renders [3:...] [2:...] [1:...]
  const payload = fixturePayload();
  const config = { ...defaultConfig(), showSubagents: true, color: false };
  const subagents: SubagentTrackerResult = {
    hasActiveSubagents: true,
    agents: stats
  };
  const unified = renderUnifiedLine2(payload, config, 150, undefined, subagents);
  assert.equal(
    unified,
    "[◆ 2.2k/45k] [3:doc 4k/10k ●] [2:rev 8k/22k ●] [1:dev 15k/40k ●]"
  );

  // renderSingleLine selects the most recent active subagent when active.length === 1
  const statsSingle: AgentTokenStats[] = [
    { index: 0, id: "root", role: "root", status: "idle", isRunning: false, activeTokens: 2200, cumulativeTokens: 45000 },
    { index: 1, id: "sub1", role: "dev", status: "idle", isRunning: false, activeTokens: 15000, cumulativeTokens: 40000 },
    { index: 2, id: "sub2", role: "reviewer", status: "running", isRunning: true, activeTokens: 8000, cumulativeTokens: 22000 }
  ];
  const outSingle = render(payload, {
    config: { ...defaultConfig(), multiline: false, color: false },
    gitBranch: "main",
    subagents: {
      hasActiveSubagents: true,
      agents: statsSingle
    }
  });
  assert.match(outSingle, /\[2:rev ●\]/);
});

test("dynamic multiline lifecycle transitions between subagent badges and quota line", () => {
  const payload = fixturePayload();
  const subagentRunning: SubagentTrackerResult = {
    hasActiveSubagents: true,
    agents: [
      { index: 0, id: "root", role: "root", status: "thinking", isRunning: false, activeTokens: 2200, cumulativeTokens: 45000 },
      { index: 1, id: "sub1", role: "dev", status: "running", isRunning: true, activeTokens: 15000, cumulativeTokens: 40000 }
    ]
  };

  const subagentsCompleted: SubagentTrackerResult = {
    hasActiveSubagents: false,
    agents: [
      { index: 0, id: "root", role: "root", status: "idle", isRunning: false, activeTokens: 2200, cumulativeTokens: 45000 },
      { index: 1, id: "sub1", role: "dev", status: "idle", isRunning: false, activeTokens: 15000, cumulativeTokens: 40000 }
    ]
  };

  // Phase 1: Subagent running -> Line 2 dynamically displays subagent badges
  const outRunning = render(payload, {
    config: { ...defaultConfig(), multiline: true, line2Style: "classic", color: false },
    gitBranch: "main",
    subagents: subagentRunning
  });
  const linesRunning = outRunning.split("\n");
  assert.equal(linesRunning.length, 2);
  assert.match(linesRunning[1], /\[◆ 2\.2k\/45k\]/);
  assert.match(linesRunning[1], /\[1:dev 15k\/40k ●\]/);
  assert.doesNotMatch(linesRunning[1], /Ctx/);

  // Phase 2: All subagents completed -> Line 2 automatically transitions back to Ctx / Quota line
  const outCompleted = render(payload, {
    config: { ...defaultConfig(), multiline: true, line2Style: "classic", color: false },
    gitBranch: "main",
    subagents: subagentsCompleted
  });
  const linesCompleted = outCompleted.split("\n");
  assert.equal(linesCompleted.length, 2);
  assert.match(linesCompleted[1], /Ctx/);
  assert.doesNotMatch(linesCompleted[1], /\[◆/);

  // Phase 3: showSubagents disabled in config -> Always renders Ctx line even if subagent is running
  const outDisabled = render(payload, {
    config: { ...defaultConfig(), multiline: true, line2Style: "classic", color: false, showSubagents: false },
    gitBranch: "main",
    subagents: subagentRunning
  });
  const linesDisabled = outDisabled.split("\n");
  assert.match(linesDisabled[1], /Ctx/);
  assert.doesNotMatch(linesDisabled[1], /\[◆/);
});

test("single-line mode integrates compact subagent badge when active", () => {
  const payload = { ...fixturePayload(), terminal_width: 100 };
  const subagentRunning: SubagentTrackerResult = {
    hasActiveSubagents: true,
    agents: [
      { index: 0, id: "root", role: "root", status: "thinking", isRunning: false, activeTokens: 2200, cumulativeTokens: 45000 },
      { index: 1, id: "sub1", role: "dev", status: "running", isRunning: true, activeTokens: 15000, cumulativeTokens: 40000 }
    ]
  };

  const outSingle = render(payload, {
    config: { ...defaultConfig(), multiline: false, color: false },
    gitBranch: "main",
    subagents: subagentRunning
  });

  assert.doesNotMatch(outSingle, /\n/);
  assert.match(outSingle, /\[1:dev ●\]/);
  assert.ok(visibleLen(outSingle) <= 100);
});

test("formatResetTenth boundary conditions and rollover guards", () => {
  // <= 0 or invalid inputs return empty string
  assert.equal(formatResetTenth(undefined), "");
  assert.equal(formatResetTenth(null as any), "");
  assert.equal(formatResetTenth(NaN), "");
  assert.equal(formatResetTenth(-10), "");
  assert.equal(formatResetTenth(0), "");

  // < 3600 seconds: minute rounding and rollover
  assert.equal(formatResetTenth(10), "1m");
  assert.equal(formatResetTenth(30), "1m");
  assert.equal(formatResetTenth(59), "1m");
  assert.equal(formatResetTenth(60), "1m");
  assert.equal(formatResetTenth(89), "1m");
  assert.equal(formatResetTenth(90), "2m");
  assert.equal(formatResetTenth(3569), "59m");
  // Rollover guard: 3570s -> round(3570/60) = 60 -> "1.0h"
  assert.equal(formatResetTenth(3570), "1.0h");
  assert.equal(formatResetTenth(3599), "1.0h");

  // < 86400 seconds: tenth-of-hour and rollover
  assert.equal(formatResetTenth(3600), "1.0h");
  assert.equal(formatResetTenth(5400), "1.5h");
  assert.equal(formatResetTenth(7200), "2.0h");
  assert.equal(formatResetTenth(86364), "24.0h".replace("24.0h", "1.0d")); // hours === "24.0" guard -> "1.0d"
  assert.equal(formatResetTenth(86390), "1.0d");

  // >= 86400 seconds: tenth-of-day
  assert.equal(formatResetTenth(86400), "1.0d");
  assert.equal(formatResetTenth(129600), "1.5d");
  assert.equal(formatResetTenth(172800), "2.0d");
  assert.equal(formatResetTenth(259200), "3.0d");
});

test("formatQuotaSegments placeholder, windows, reset duration, and colors", () => {
  const config = { ...defaultConfig(), color: false };

  // Empty / no-quota placeholder
  const emptyQuota: QuotaDisplay = { hasQuota: false, usagePct: 0, reset: "", windows: [] };
  assert.deepEqual(formatQuotaSegments(emptyQuota, config, false), ["5h --", "W --"]);
  assert.deepEqual(formatQuotaSegments(emptyQuota, config, true), ["5h --", "W --"]);

  // Placeholder with color
  const coloredConfig = { ...defaultConfig(), color: true };
  const coloredPlaceholder = formatQuotaSegments(emptyQuota, coloredConfig, false);
  assert.match(coloredPlaceholder[0], /\x1b\[36m5h\x1b\[0m/);
  assert.match(coloredPlaceholder[0], /\x1b\[90m--\x1b\[0m/);
  assert.match(coloredPlaceholder[1], /\x1b\[36mW\x1b\[0m/);
  assert.match(coloredPlaceholder[1], /\x1b\[90m--\x1b\[0m/);

  // Windows formatting with remaining vs percent usageValue
  const quota: QuotaDisplay = {
    hasQuota: true,
    usagePct: 20,
    reset: "12:00",
    windows: [
      { label: "5h", usagePct: 20, reset: "12:00", resetInSeconds: 5400 },
      { label: "W", usagePct: 5, reset: "12:00", resetInSeconds: 172800 }
    ]
  };

  // Remaining usage (default)
  assert.deepEqual(formatQuotaSegments(quota, config, false), ["5h 80.0%", "W 95.0%"]);
  assert.deepEqual(formatQuotaSegments(quota, config, true), ["5h 80.0% (1.5h)", "W 95.0% (2.0d)"]);

  // Percent used
  const percentConfig = { ...config, usageValue: "percent" };
  assert.deepEqual(formatQuotaSegments(quota, percentConfig, false), ["5h 20.0%", "W 5.0%"]);
  assert.deepEqual(formatQuotaSegments(quota, percentConfig, true), ["5h 20.0% (1.5h)", "W 5.0% (2.0d)"]);

  // Colorization of values and reset string
  const coloredSegs = formatQuotaSegments(quota, coloredConfig, true);
  assert.match(coloredSegs[0], /\x1b\[32m80\.0%\x1b\[0m/); // usagePct < 50% => green
  assert.match(coloredSegs[0], /\x1b\[90m\(1\.5h\)\x1b\[0m/); // reset duration in colorMuted
  assert.match(coloredSegs[1], /\x1b\[90m\(2\.0d\)\x1b\[0m/);

  // Single window without label defaults to "5h"
  const singleWindowQuota: QuotaDisplay = {
    hasQuota: true,
    usagePct: 92,
    reset: "",
    windows: [{ label: "", usagePct: 92, reset: "" }]
  };
  assert.deepEqual(formatQuotaSegments(singleWindowQuota, config, false), ["5h 8.0%"]);
  const coloredWarning = formatQuotaSegments(singleWindowQuota, coloredConfig, false);
  assert.match(coloredWarning[0], /\x1b\[31m8\.0%\x1b\[0m/); // usagePct >= 90% => red
});

test("formatQuotaChip placeholder, windows, reset duration, and colors", () => {
  const config = { ...defaultConfig(), color: false };

  // Empty / no-quota placeholder
  const emptyQuota: QuotaDisplay = { hasQuota: false, usagePct: 0, reset: "", windows: [] };
  assert.equal(formatQuotaChip(emptyQuota, config, false), "[5h -- | W --]");
  assert.equal(formatQuotaChip(emptyQuota, config, true), "[5h -- | W --]");

  // Placeholder with color
  const coloredConfig = { ...defaultConfig(), color: true };
  const coloredPlaceholder = formatQuotaChip(emptyQuota, coloredConfig, false);
  assert.match(coloredPlaceholder, /\x1b\[36m5h\x1b\[0m/);
  assert.match(coloredPlaceholder, /\x1b\[36mW\x1b\[0m/);
  assert.match(coloredPlaceholder, /\x1b\[90m--\x1b\[0m/);
  assert.match(coloredPlaceholder, /\x1b\[90m\|\x1b\[0m/);

  // Windows formatting with remaining vs percent usageValue
  const quota: QuotaDisplay = {
    hasQuota: true,
    usagePct: 20,
    reset: "12:00",
    windows: [
      { label: "5h", usagePct: 20, reset: "12:00", resetInSeconds: 5400 },
      { label: "W", usagePct: 5, reset: "12:00", resetInSeconds: 172800 }
    ]
  };

  // Remaining usage (default)
  assert.equal(formatQuotaChip(quota, config, false), "[5h 80.0% | W 95.0%]");
  assert.equal(formatQuotaChip(quota, config, true), "[5h 80.0% (1.5h) | W 95.0% (2.0d)]");

  // Percent used
  const percentConfig = { ...config, usageValue: "percent" };
  assert.equal(formatQuotaChip(quota, percentConfig, false), "[5h 20.0% | W 5.0%]");
  assert.equal(formatQuotaChip(quota, percentConfig, true), "[5h 20.0% (1.5h) | W 5.0% (2.0d)]");

  // Colorization of values and reset string
  const coloredChip = formatQuotaChip(quota, coloredConfig, true);
  assert.match(coloredChip, /\x1b\[32m80\.0%\x1b\[0m/); // usagePct < 50% => green
  assert.match(coloredChip, /\x1b\[90m\(1\.5h\)\x1b\[0m/); // reset duration in colorMuted
  assert.match(coloredChip, /\x1b\[90m\(2\.0d\)\x1b\[0m/);

  // Single window without label defaults to "5h"
  const singleWindowQuota: QuotaDisplay = {
    hasQuota: true,
    usagePct: 92,
    reset: "",
    windows: [{ label: "", usagePct: 92, reset: "" }]
  };
  assert.equal(formatQuotaChip(singleWindowQuota, config, false), "[5h 8.0%]");
  const coloredWarning = formatQuotaChip(singleWindowQuota, coloredConfig, false);
  assert.match(coloredWarning, /\x1b\[31m8\.0%\x1b\[0m/); // usagePct >= 90% => red
});

test("renderUnifiedLine2 root agent fallback when subagents is absent", () => {
  const payload: Payload = {
    conversation_id: "conv-fallback",
    agent_state: "thinking",
    context_window: {
      total_input_tokens: 3400,
      total_output_tokens: 1600
    }
  };
  const config = { ...defaultConfig(), color: false };
  const emptyQuota: QuotaDisplay = { hasQuota: false, usagePct: 0, reset: "", windows: [] };

  const line2 = renderUnifiedLine2(payload, config, 100, emptyQuota, null);
  // Root badge alone without quota chip: [◆ 3.4k/5k]
  assert.equal(line2, "[◆ 3.4k/5k]");
});

test("renderUnifiedLine2 responsive degradation tiers", () => {
  const payload: Payload = {
    conversation_id: "conv-123",
    agent_state: "idle"
  };
  const config = { ...defaultConfig(), color: false };

  const quota: QuotaDisplay = {
    hasQuota: true,
    usagePct: 20,
    reset: "",
    windows: [
      { label: "5h", usagePct: 20, reset: "", resetInSeconds: 5400 },
      { label: "W", usagePct: 5, reset: "", resetInSeconds: 172800 }
    ]
  };

  const subagents: SubagentTrackerResult = {
    hasActiveSubagents: true,
    agents: [
      { index: 0, id: "root", role: "root", status: "idle", isRunning: false, activeTokens: 2200, cumulativeTokens: 45000 },
      { index: 1, id: "sub1", role: "dev", status: "running", isRunning: true, activeTokens: 15000, cumulativeTokens: 40000 },
      { index: 2, id: "sub2", role: "reviewer", status: "running", isRunning: true, activeTokens: 8000, cumulativeTokens: 22000 },
      { index: 3, id: "sub3", role: "test-engineer", status: "idle", isRunning: false, activeTokens: 5000, cumulativeTokens: 10000 },
      { index: 4, id: "sub4", role: "writer", status: "idle", isRunning: false, activeTokens: 4000, cumulativeTokens: 8000 }
    ]
  };

  const t1Expected = "[◆ 2.2k/45k] [4:doc 4k/8k ○] [3:test 5k/10k ○] [2:rev 8k/22k ●] [1:dev 15k/40k ●]";
  const t2Expected = "[◆ 2.2k/45k] [4:4k/8k ○] [3:5k/10k ○] [2:8k/22k ●] [1:15k/40k ●]";
  const t3Expected = "[◆ 2.2k/45k] [2:rev 8k/22k ●] [1:dev 15k/40k ●] [+2 idle]";
  const t3CompactExpected = "[◆ 2.2k/45k] [2:8k/22k ●] [1:15k/40k ●] [+2 idle]";
  const t4Expected = "[◆ 2.2k/45k] [2 active]";
  const t5Expected = "[◆ 2.2k/45k]";

  // Tier 1: Full roles
  const t1 = renderUnifiedLine2(payload, config, visibleLen(t1Expected), quota, subagents);
  assert.equal(t1, t1Expected);

  // Tier 2: Compact roles
  const t2 = renderUnifiedLine2(payload, config, visibleLen(t2Expected), quota, subagents);
  assert.equal(t2, t2Expected);

  // Tier 3: Active priority full roles + [+N idle]
  const t3 = renderUnifiedLine2(payload, config, visibleLen(t3Expected), quota, subagents);
  assert.equal(t3, t3Expected);

  // Tier 3: Active priority compact roles + [+N idle]
  const t3c = renderUnifiedLine2(payload, config, visibleLen(t3CompactExpected), quota, subagents);
  assert.equal(t3c, t3CompactExpected);

  // Tier 4: Active count badge
  const t4 = renderUnifiedLine2(payload, config, visibleLen(t4Expected), quota, subagents);
  assert.equal(t4, t4Expected);

  // Tier 5: Root badge alone
  const t5 = renderUnifiedLine2(payload, config, visibleLen(t5Expected), quota, subagents);
  assert.equal(t5, t5Expected);

  // Truncated root
  const tTrunc = renderUnifiedLine2(payload, config, 6, quota, subagents);
  assert.equal(visibleLen(tTrunc), 6);

  // Width bounded assertion across all widths 5-150
  for (let w = 5; w <= 150; w++) {
    const rendered = renderUnifiedLine2(payload, config, w, quota, subagents);
    assert.ok(visibleLen(rendered) <= w, `Overflow at width ${w}: "${strip(rendered)}"`);
  }
});

test("renderUnifiedLine2 without subagents renders root badge alone and fits width", () => {
  const payload: Payload = {
    conversation_id: "conv-nosub",
    agent_state: "idle",
    context_window: { total_input_tokens: 1000, total_output_tokens: 500 }
  };
  const config = { ...defaultConfig(), color: false };
  const quota: QuotaDisplay = {
    hasQuota: true,
    usagePct: 10,
    reset: "",
    windows: [{ label: "5h", usagePct: 10, reset: "", resetInSeconds: 3600 }]
  };

  const expectedRoot = "[◆ 1k/1.5k]";
  assert.equal(renderUnifiedLine2(payload, config, 100, quota, null), expectedRoot);
  assert.equal(renderUnifiedLine2(payload, config, visibleLen(expectedRoot), quota, null), expectedRoot);
  assert.equal(visibleLen(renderUnifiedLine2(payload, config, 5, quota, null)), 5);
});

test("multiline line2Style config: unified default vs classic", () => {
  const payload = fixturePayload();
  payload.terminal_width = 120;
  const cache: Cache = {
    models: {
      "Gemini 3.5 Flash (Medium)": {
        remainingFraction: 0.8,
        resetTime: "2026-05-19T14:00:00Z"
      }
    }
  };

  // Default config has line2Style: "unified"
  assert.equal(defaultConfig().line2Style, "unified");
  const outDefault = render(payload, { config: { ...defaultConfig(), color: false }, quota: cache, now: new Date("2026-05-19T12:00:00Z") });
  const linesDefault = outDefault.split("\n");
  assert.equal(linesDefault.length, 2);

  // Line 1 contains unbracketed quota segments prepended before model name
  assert.match(linesDefault[0], /^5h 80\.0%/);
  assert.match(linesDefault[0], /5h 80\.0% \(2\.0h\) │ .* 3\.5 Flash Med/);
  assert.doesNotMatch(linesDefault[0], /\[5h/);

  // Line 2 shows only root agent badge directly (without quota chip)
  assert.equal(linesDefault[1], "[◆ 125k/130k]");
  assert.doesNotMatch(linesDefault[1], /5h/);
  assert.doesNotMatch(linesDefault[1], /Ctx/);

  // Explicit line2Style: "classic" renders model on line 1, Ctx progress bar line on line 2
  const outClassic = render(payload, { config: { ...defaultConfig(), line2Style: "classic", color: false }, quota: cache, now: new Date("2026-05-19T12:00:00Z") });
  const linesClassic = outClassic.split("\n");
  assert.equal(linesClassic.length, 2);
  assert.doesNotMatch(linesClassic[0], /^5h/);
  assert.match(linesClassic[0], /3\.5 Flash Med/);
  assert.match(linesClassic[1], /^Ctx /);
  assert.match(linesClassic[1], /80\.00% left/);

  // Config merge parsing for line2_style and line2Style
  assert.equal(parseConfig(JSON.stringify({ line2_style: "classic" })).line2Style, "classic");
  assert.equal(parseConfig(JSON.stringify({ line2_style: "unified" })).line2Style, "unified");
  assert.equal(parseConfig(JSON.stringify({ line2Style: "classic" })).line2Style, "classic");
  assert.equal(parseConfig(JSON.stringify({ line2Style: "unified" })).line2Style, "unified");
  assert.equal(parseConfig(JSON.stringify({ line2_style: "other" })).line2Style, "unified");
});

test("multiline line2Style unified Line 1 responsive degradation tiers", () => {
  const payload: Payload = {
    model: { display_name: "Claude Sonnet 4.6" },
    cwd: "/workspace/project",
    plan_tier: "Google AI Pro",
    agent_state: "idle",
    cost: { total_usd: 0.05 },
    quota: {
      "3p-5h": { remaining_fraction: 0.8, reset_time: "2026-05-19T13:30:00Z", reset_in_seconds: 5400 },
      "3p-weekly": { remaining_fraction: 0.95, reset_time: "2026-05-21T12:00:00Z", reset_in_seconds: 172800 }
    }
  };
  const config: Config = { ...defaultConfig(), line2Style: "unified", color: false, showIcons: false };
  const opts = { config, gitBranch: "main", now: new Date("2026-05-19T12:00:00Z") };

  // Tier 1: Quota with reset + modelSegment + cwd + git + state + cost
  const t1Want = "5h 80.0% (1.5h) │ W 95.0% (2.0d) │ Sonnet 4.6 | Pro │ project │ main │ Idle │ $0.05";
  // Tier 2: Quota without reset + modelSegment + cwd + git + state + cost
  const t2Want = "5h 80.0% │ W 95.0% │ Sonnet 4.6 | Pro │ project │ main │ Idle │ $0.05";
  // Tier 3: Quota without reset + modelSegment + cwd + git + state
  const t3Want = "5h 80.0% │ W 95.0% │ Sonnet 4.6 | Pro │ project │ main │ Idle";
  // Tier 4: Quota without reset + modelSegment + git + state
  const t4Want = "5h 80.0% │ W 95.0% │ Sonnet 4.6 | Pro │ main │ Idle";
  // Tier 5: Quota without reset + modelSegment + state
  const t5Want = "5h 80.0% │ W 95.0% │ Sonnet 4.6 | Pro │ Idle";
  // Tier 6: modelSegment + state
  const t6Want = "Sonnet 4.6 | Pro │ Idle";
  // Tier 7: modelSegment
  const t7Want = "Sonnet 4.6 | Pro";

  assert.equal(render({ ...payload, terminal_width: visibleLen(t1Want) }, opts).split("\n")[0], t1Want);
  assert.equal(render({ ...payload, terminal_width: visibleLen(t2Want) }, opts).split("\n")[0], t2Want);
  assert.equal(render({ ...payload, terminal_width: visibleLen(t3Want) }, opts).split("\n")[0], t3Want);
  assert.equal(render({ ...payload, terminal_width: visibleLen(t4Want) }, opts).split("\n")[0], t4Want);
  assert.equal(render({ ...payload, terminal_width: visibleLen(t5Want) }, opts).split("\n")[0], t5Want);
  assert.equal(render({ ...payload, terminal_width: visibleLen(t6Want) }, opts).split("\n")[0], t6Want);
  assert.equal(render({ ...payload, terminal_width: visibleLen(t7Want) }, opts).split("\n")[0], t7Want);

  // Tier 8: fit(modelSegment, width)
  const t8 = render({ ...payload, terminal_width: 10 }, opts).split("\n")[0];
  assert.equal(visibleLen(t8), 10);

  // Verify all widths 5-150 remain within terminal width
  for (let w = 5; w <= 150; w++) {
    const out = render({ ...payload, terminal_width: w }, opts);
    for (const line of out.split("\n")) {
      assert.ok(visibleLen(line) <= w, `Width ${w} overflowed by: "${line}"`);
    }
  }
});

test("multiline line2Style unified Line 2 lifecycle transitions with subagents", () => {
  const payload = fixturePayload();
  const subagentRunning: SubagentTrackerResult = {
    hasActiveSubagents: true,
    agents: [
      { index: 0, id: "root", role: "root", status: "thinking", isRunning: false, activeTokens: 2200, cumulativeTokens: 45000 },
      { index: 1, id: "sub1", role: "dev", status: "running", isRunning: true, activeTokens: 15000, cumulativeTokens: 40000 }
    ]
  };

  const subagentsCompleted: SubagentTrackerResult = {
    hasActiveSubagents: false,
    agents: [
      { index: 0, id: "root", role: "root", status: "idle", isRunning: false, activeTokens: 2200, cumulativeTokens: 45000 },
      { index: 1, id: "sub1", role: "dev", status: "idle", isRunning: false, activeTokens: 15000, cumulativeTokens: 40000 }
    ]
  };

  // Phase 1: Subagent running -> Line 2 displays [◆ active/cum] [1:dev ...] directly
  const outRunning = render(payload, {
    config: { ...defaultConfig(), multiline: true, line2Style: "unified", color: false },
    gitBranch: "main",
    subagents: subagentRunning
  });
  const linesRunning = outRunning.split("\n");
  assert.equal(linesRunning.length, 2);
  assert.match(linesRunning[0], /^5h -- │ W --/);
  assert.match(linesRunning[1], /^\[◆ 2\.2k\/45k\] \[1:dev 15k\/40k ●\]$/);
  assert.doesNotMatch(linesRunning[1], /5h/);

  // Phase 2: Subagents completed -> Line 2 displays [◆ active/cum] alone
  const outCompleted = render(payload, {
    config: { ...defaultConfig(), multiline: true, line2Style: "unified", color: false },
    gitBranch: "main",
    subagents: subagentsCompleted
  });
  const linesCompleted = outCompleted.split("\n");
  assert.equal(linesCompleted.length, 2);
  assert.match(linesCompleted[0], /^5h -- │ W --/);
  assert.equal(linesCompleted[1], "[◆ 2.2k/45k]");
  assert.doesNotMatch(linesCompleted[1], /\[1:/);
});



