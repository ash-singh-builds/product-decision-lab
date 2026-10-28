const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  assess,
  best,
  features,
  score,
} = require("./fixtures/legacy-engine.cjs");
test("demo scenario fits 12 points and conflicts at 8", () => {
  assert.equal(assess(["sso", "analytics"], 12, "enterprise").effort, 10);
  assert.equal(assess(["sso", "analytics"], 12, "enterprise").fits, true);
  assert.equal(assess(["sso", "analytics"], 8, "enterprise").fits, false);
});
test("optimizer returns globally optimal feasible portfolios across capacities and lenses", () => {
  for (const goal of ["enterprise", "engagement", "innovation"])
    for (let c = 0; c <= 25; c++) {
      const result = best(c, goal);
      assert.ok(result.effort <= c);
      for (let mask = 0; mask < 32; mask++) {
        let subset = features.filter((f, i) => mask & (1 << i));
        if (subset.reduce((n, f) => n + f.effort, 0) <= c)
          assert.ok(
            result.score >= subset.reduce((n, f) => n + score(f, goal), 0),
          );
      }
    }
});
test("empty and zero capacity scenarios are valid", () => {
  assert.equal(best(0, "enterprise").selected.length, 0);
  assert.equal(assess([], 0, "enterprise").confidence, 0);
});
