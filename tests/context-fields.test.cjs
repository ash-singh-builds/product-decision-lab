const { test } = require("node:test"),
  assert = require("node:assert/strict");
const E = require("../dist/engine.js"),
  F = require("../dist/context-fields.js");
test("legacy strings migrate verbatim, including punctuation and non-standard values", () => {
  const s = E.blank();
  Object.assign(s.context, {
    market: "Specialist robotics",
    segment: "SMB, founders & enterprise pilots",
    priorities: "Retention; protect core workflows",
    geography: "EMEA + India",
    businessModel: "Hybrid licence + service",
    horizon: "Before renewal on 1 June",
  });
  const restored = E.restore(s);
  assert.deepEqual(restored.context, s.context);
  assert.deepEqual(F.selections(restored, "segment"), [s.context.segment]);
  assert.deepEqual(F.selections(restored, "priorities"), [
    s.context.priorities,
  ]);
  assert.deepEqual(E.validate(restored), []);
});
test("selections round-trip as text for assessments and reports without fabricating scores", () => {
  const s = E.sample();
  const before = E.evaluate(s).assessments.map((a) => a.score);
  F.setSelections(s, "segment", [
    "SMB",
    "Enterprise",
    "Other",
    "Research teams",
  ]);
  F.setSelections(s, "priorities", [
    "Customer retention",
    "A custom objective",
  ]);
  const restored = E.restore(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(F.selections(restored, "segment"), [
    "SMB",
    "Enterprise",
    "Other",
    "Research teams",
  ]);
  assert.deepEqual(
    E.evaluate(restored).assessments.map((a) => a.score),
    before,
  );
  assert.match(E.report(restored), /SMB; Enterprise; Other; Research teams/);
  assert.match(E.report(restored), /Customer retention; A custom objective/);
  assert.match(
    E.assess(restored.ideas[0], restored).comp.why.join(" "),
    /SMB; Enterprise/,
  );
});
test("empty and inconsistent metadata safely falls back to retained context text", () => {
  const s = E.blank();
  s.context.segment = "Previously saved value";
  s.contextUI = {
    segments: ["A different value"],
    priorities: [null],
    customFields: ["market", "bad"],
  };
  const r = E.restore(s);
  assert.deepEqual(F.selections(r, "segment"), ["Previously saved value"]);
  assert.deepEqual(r.contextUI.priorities, []);
  assert.deepEqual(r.contextUI.customFields, ["market"]);
  F.setSelections(r, "segment", []);
  assert.equal(r.context.segment, "");
});
