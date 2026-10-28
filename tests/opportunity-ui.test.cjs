const { test } = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const fs = require("node:fs");
const path = require("node:path");
function app(saved) {
  const html = fs.readFileSync("dist/index.html", "utf8");
  const dom = new JSDOM(html, {
    url: "https://example.test/v2/",
    runScripts: "outside-only",
  });
  const w = dom.window;
  w.structuredClone = structuredClone;
  w.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
  if (saved !== undefined)
    w.localStorage.setItem("pdl-decision-workspace", saved);
  for (const f of [
    "data.js",
    "competition.js",
    "challenger.js",
    "report.js",
    "engine.js",
    "app.js",
  ])
    w.eval(fs.readFileSync(path.join("dist", f), "utf8"));
  return w;
}
function click(w, text) {
  const b = [...w.document.querySelectorAll("button")].find(
    (b) => b.textContent.trim() === text,
  );
  assert.ok(b, "Missing button " + text);
  b.click();
}
function edit(w, path, value) {
  const el = w.document.querySelector(`[data-path="${path}"]`);
  assert.ok(el, path);
  if (el.type === "checkbox") el.checked = value;
  else el.value = value;
  el.dispatchEvent(new w.Event("change", { bubbles: true }));
}
function sample(w) {
  click(w, "Explore an Example →");
  click(w, "Continue");
}
const text = (w) => w.document.querySelector("#view").textContent;
test("one idea journey accepts partial input, edits context and retains unknowns", () => {
  const w = app();
  click(w, "Evaluate an Opportunity");
  edit(w, "context.name", "My product");
  edit(w, "context.segment", "Small teams");
  click(w, "Continue to ideas →");
  edit(w, "ideas.0.name", "New idea");
  edit(w, "ideas.0.problem", "A real problem");
  click(w, "Assess current inputs");
  assert.match(text(w), /Validate First/);
  assert.match(text(w), /Incomplete assessment/);
  const s = JSON.parse(w.localStorage.getItem("pdl-decision-workspace"));
  assert.equal(s.context.name, "My product");
  assert.equal(s.ideas.length, 1);
  w.close();
});
test("comparison supports two and three ideas, duplicate, remove and limits", () => {
  const w = app();
  click(w, "Compare Opportunities");
  click(w, "Continue to ideas →");
  assert.equal(w.document.querySelectorAll("[data-remove]").length, 2);
  click(w, "Duplicate");
  assert.equal(w.document.querySelectorAll("[data-remove]").length, 3);
  assert.ok(w.document.querySelector("#add").disabled);
  click(w, "Remove");
  assert.equal(w.document.querySelectorAll("[data-remove]").length, 2);
  w.close();
});
test("sample competitor edits change table-stakes recommendation", () => {
  const w = app();
  sample(w);
  click(w, "Compare & Prioritise");
  assert.match(text(w), /Buy\/Partner/);
  click(w, "Competitive Intelligence");
  edit(w, "competitors.0.capabilities.sso", "unknown");
  edit(w, "competitors.1.capabilities.sso", "unknown");
  click(w, "Review opportunity positioning →");
  assert.doesNotMatch(text(w), /Buy\/Partner/);
  assert.match(text(w), /competitive classification remains incomplete/);
  w.close();
});
test("ratings, weights, challenger override and report copy/download work", async () => {
  const w = app();
  sample(w);
  click(w, "Compare & Prioritise");
  edit(w, "weights.strategy", "100");
  click(w, "Decision Challenger");
  edit(w, "ideas.0.decision", "Defer");
  edit(w, "ideas.0.notes", "Waiting for procurement confirmation");
  click(w, "Generate Product Opportunity Assessment →");
  const report = w.document.querySelector(".report").value;
  assert.match(report, /Waiting for procurement/);
  let copied = "";
  Object.defineProperty(w.navigator, "clipboard", {
    value: {
      writeText: async (t) => {
        copied = t;
      },
    },
  });
  click(w, "Copy Markdown");
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(copied, report);
  let download = false;
  w.URL.createObjectURL = () => "blob:test";
  w.URL.revokeObjectURL = () => {};
  w.HTMLAnchorElement.prototype.click = function () {
    download = this.download === "opportunity-assessment.md";
  };
  click(w, "Download .md ↓");
  assert.equal(download, true);
  w.close();
});
test("capacity stage, dependencies, snapshots and persistence survive reload", () => {
  let w = app();
  sample(w);
  click(w, "Scenario Planning");
  edit(w, "capacity", "8");
  assert.match(text(w), /over capacity/);
  click(w, "Apply portfolio selection");
  click(w, "Save scenario");
  const saved = w.localStorage.getItem("pdl-decision-workspace");
  w.close();
  w = app(saved);
  click(w, "Scenario Planning");
  assert.match(text(w), /Saved portfolio scenarios/);
  assert.match(text(w), /fits the capacity limit/);
  w.close();
});
test("reset and clear require confirmation; V1 state is preserved", () => {
  const w = app();
  w.localStorage.setItem("decision-lab-v1", "existing");
  sample(w);
  click(w, "Reset workspace");
  click(w, "Cancel");
  assert.ok(
    w.localStorage.getItem("pdl-decision-workspace").includes("Northstar"),
  );
  click(w, "Clear workspace data");
  click(w, "Continue");
  assert.equal(w.localStorage.getItem("pdl-decision-workspace"), null);
  assert.equal(w.localStorage.getItem("decision-lab-v1"), "existing");
  click(w, "Explore an Example");
  click(w, "Continue");
  click(w, "Reset workspace");
  click(w, "Continue");
  assert.match(text(w), /Start with your product context/);
  w.close();
});
test("malformed storage recovers; hostile markup remains text", () => {
  const w = app("{broken");
  assert.match(w.document.body.textContent, /invalid/i);
  click(w, "Evaluate an Opportunity");
  edit(w, "context.name", "<img src=x onerror=alert(1)>");
  click(w, "Continue to ideas →");
  edit(w, "ideas.0.name", "<script>alert(1)</script>");
  click(w, "Assess current inputs");
  assert.equal(w.document.querySelector("#view script"), null);
  assert.equal(w.document.querySelector("#view img"), null);
  w.close();
});
test("every navigation destination renders with sample and empty workspace", () => {
  for (const useSample of [false, true]) {
    const w = app();
    if (useSample) sample(w);
    for (const b of [...w.document.querySelectorAll("nav button")]) {
      click(w, b.textContent.trim());
      assert.ok(w.document.querySelector("#view h1"));
      assert.ok(!text(w).includes("undefined"));
    }
    w.close();
  }
});

test("challenge review responses persist and become stale when inputs change", () => {
  const w = app();
  sample(w);
  click(w, "Decision Challenger");
  const box = w.document.querySelector("[data-review]");
  const id = box.dataset.challenge;
  box.checked = true;
  box.dispatchEvent(new w.Event("change"));
  edit(
    w,
    `ideas.0.challengeReviews.${id}.response`,
    "We will validate the procurement condition.",
  );
  click(w, "Product Context");
  edit(w, "context.objectives", "New strategic objective");
  click(w, "Decision Challenger");
  assert.match(text(w), /Inputs changed since this response/);
  assert.equal(
    w.document.querySelector(`[data-challenge="${id}"]`).checked,
    false,
  );
  click(w, "Decision Assessment");
  assert.match(
    w.document.querySelector(".report").value,
    /inputs changed since response/,
  );
  w.close();
});
test("scenario snapshots capture immutable values and priorities", () => {
  const w = app();
  sample(w);
  click(w, "Scenario Planning");
  edit(w, "capacity", "8");
  click(w, "Save scenario");
  const first = JSON.parse(w.localStorage.getItem("pdl-decision-workspace"))
    .snapshots[0];
  edit(w, "ideas.0.portfolioValue", "100");
  edit(w, "capacity", "20");
  click(w, "Save scenario");
  const saved = JSON.parse(w.localStorage.getItem("pdl-decision-workspace"));
  assert.equal(saved.snapshots[1].value, first.value);
  assert.equal(saved.snapshots[1].capacity, 8);
  assert.notEqual(saved.snapshots[0].value, first.value);
  w.close();
});
test("direct hash links and methodology work without backend routing", () => {
  const w = app();
  w.location.hash = "#scenario-planning";
  w.dispatchEvent(new w.HashChangeEvent("hashchange"));
  assert.match(text(w), /Scenario Planning/);
  w.location.hash = "#methodology";
  w.dispatchEvent(new w.HashChangeEvent("hashchange"));
  assert.match(text(w), /Methodology & interpretation/);
  w.close();
});
test("all public screens avoid version labels and unsupported AI claims", () => {
  const w = app();
  sample(w);
  for (const b of [...w.document.querySelectorAll("nav button")]) {
    click(w, b.textContent.trim());
    assert.doesNotMatch(
      w.document.body.textContent,
      /\bV[12]\b|\bMVP\b|vibe-coded|built with codex|mock AI|fake intelligence|LLM integration coming soon|future backend/i,
    );
  }
  w.close();
});

test("capacity control retains keyboard focus after recalculation", () => {
  const w = app();
  sample(w);
  click(w, "Scenario Planning");
  const slider = w.document.querySelector('input[type="range"]');
  slider.focus();
  slider.value = "8";
  slider.dispatchEvent(new w.Event("change"));
  assert.equal(w.document.activeElement.type, "range");
  assert.equal(w.document.activeElement.value, "8");
  w.close();
});

test("input events update scenario calculations without waiting for blur", () => {
  const w = app();
  sample(w);
  click(w, "Scenario Planning");
  const capacity = w.document.querySelector(
    '[data-path="capacity"][type="number"]',
  );
  capacity.value = "8";
  capacity.dispatchEvent(new w.Event("input", { bubbles: true }));
  assert.match(text(w), /2 points over capacity/);
  w.close();
});

test("matrix never labels an illustrative or unverified absence as verified research", () => {
  const w = app();
  sample(w);
  click(w, "Competitive Intelligence");
  let option = w.document.querySelector(
    '[data-path="competitors.1.capabilities.insights"] option[value="no"]',
  );
  assert.match(option.textContent, /illustrative assumption/);
  edit(w, "competitors.1.status", "user");
  option = w.document.querySelector(
    '[data-path="competitors.1.capabilities.insights"] option[value="no"]',
  );
  assert.match(option.textContent, /unverified/);
  w.close();
});
