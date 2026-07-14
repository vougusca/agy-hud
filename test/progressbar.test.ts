import test from "node:test";
import assert from "node:assert/strict";
import { progressBarWithColor, percentageColor, clampInt, clampFloat } from "../src/statusline";
import { strip } from "../src/ansi";

test("progressBarWithColor edge case rounding behavior", () => {
  // Never show completely full unless strictly 100%
  // 94% on a width-8 bar normally rounds to 8. We expect 7 blocks now.
  const bar94 = strip(progressBarWithColor(94, 94, 8, false));
  assert.equal(bar94, "███████░", "94% should not render as completely full");

  const bar99 = strip(progressBarWithColor(99, 99, 10, false));
  assert.equal(bar99, "█████████░", "99% should not render as completely full");

  const bar100 = strip(progressBarWithColor(100, 100, 8, false));
  assert.equal(bar100, "████████", "100% should render as completely full");

  // Never show completely empty unless strictly 0%
  // 6% on a width-8 bar normally rounds to 0. We expect 1 block now.
  const bar6 = strip(progressBarWithColor(6, 6, 8, false));
  assert.equal(bar6, "█░░░░░░░", "6% should not render as completely empty");

  const bar0 = strip(progressBarWithColor(0, 0, 8, false));
  assert.equal(bar0, "░░░░░░░░", "0% should render as completely empty");
});

test("progressBarWithColor limits (negative and over 100)", () => {
  const barNeg = strip(progressBarWithColor(-10, -10, 8, false));
  assert.equal(barNeg, "░░░░░░░░", "Negative percent should clamp to 0");

  const bar150 = strip(progressBarWithColor(150, 150, 8, false));
  assert.equal(bar150, "████████", "Over 100 percent should clamp to 100");
});

test("percentageColor thresholds", () => {
  assert.match(percentageColor(0), /32m/, "0% should be green");
  assert.match(percentageColor(49.9), /32m/, "49.9% should be green");
  
  assert.match(percentageColor(50), /33m/, "50% should be yellow");
  assert.match(percentageColor(74.9), /33m/, "74.9% should be yellow");
  
  assert.match(percentageColor(75), /38;5;208m/, "75% should be orange");
  assert.match(percentageColor(89.9), /38;5;208m/, "89.9% should be orange");
  
  assert.match(percentageColor(90), /31m/, "90% should be red");
  assert.match(percentageColor(100), /31m/, "100% should be red");
});

test("clamp limits", () => {
  assert.equal(clampInt(-5), 0);
  assert.equal(clampInt(105), 100);
  assert.equal(clampInt(50), 50);

  assert.equal(clampFloat(-5.5), 0);
  assert.equal(clampFloat(105.5), 100);
  assert.equal(clampFloat(50.5), 50.5);
});
