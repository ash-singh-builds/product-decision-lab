const { test } = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const fs = require("node:fs");
const path = require("node:path");
function app(saved, url = "https://example.test/v2/", demo) {
  const html = fs.readFileSync("dist/index.html", "utf8");
  const dom = new JSDOM(html, {
    url,
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
  if (demo) w.localStorage.setItem("pdl-guided-demo", demo);
  for (const f of [
    "data.js",
    "context-fields.js",
    "competition.js",
    "challenger.js",
    "report.js",
    "engine.js",
    "guided-demo.js",
    "app.js",
  ])
    w.eval(fs.readFileSync(path.join("dist", f), "utf8"));
  return w;
}
function click(w, text) {
  const aliases = {
    Opportunities: "My Opportunities",
    "Decision Assessment": "Decision Brief",
    "Compare & Prioritise": "Idea comparison",
    "Competitive Intelligence": "Competitive intelligence",
    "Explore Guided Demo": "Explore Guided Example",
    "Evaluate an Opportunity": "Evaluate One Idea",
    "Compare Opportunities": "Compare 2–3 Ideas",
    "Start Your Own Assessment": "Product Context",
    "← Previous": "← Back",
    "Next: Decision Assessment →": "Next: Decision Brief →",
  };
  text = aliases[text] || text;
  let b = [...w.document.querySelectorAll("button")].find(
    (b) =>
      b.textContent.trim() === text || b.childNodes[0]?.textContent === text,
  );
  if (
    !b &&
    [
      "Idea comparison",
      "Opportunity assessment",
      "Competitive intelligence",
      "Decision Challenger",
    ].includes(text)
  ) {
    click(w, "Decision Analysis");
    b = [...w.document.querySelectorAll("button")].find(
      (b) => b.textContent.trim() === text,
    );
  }
  assert.ok(b, "Missing button " + text);
  b.click();
}
function edit(w, path, value) {
  const el = w.document.querySelector(`[data-path="${path}"]`);
  if (!el && path === "context.segment") {
    const input = w.document.querySelector('[data-context-custom="segment"]');
    input.value = value;
    input.dispatchEvent(new w.Event("input"));
    click(w, "Add segment");
    return;
  }
  assert.ok(el, path);
  if (el.type === "checkbox") el.checked = value;
  else el.value = value;
  el.dispatchEvent(new w.Event("change", { bubbles: true }));
}
function sample(w) {
  click(w, "Explore an Example");
  click(w, "Continue");
}
const text = (w) => w.document.querySelector("#view").textContent;
test("one idea journey accepts partial input, edits context and retains unknowns", () => {
  const w = app();
  click(w, "Product Context");
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
  click(w, "Compare 2–3 Ideas");
  click(w, "My Opportunities");
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
  assert.match(text(w), /Start first. Refine later/);
  w.close();
});
test("malformed storage recovers; hostile markup remains text", () => {
  const w = app("{broken");
  assert.match(w.document.body.textContent, /invalid/i);
  click(w, "Product Context");
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

test("context groups and standard/custom dropdowns preserve saved entries", () => {
  const E = require("../dist/engine.js");
  const s = E.blank();
  Object.assign(s.context, {
    market: "Space robotics",
    geography: "EMEA + India",
    businessModel: "Hybrid licence",
    horizon: "Before renewal",
  });
  const w = app(JSON.stringify(s));
  click(w, "Product Context");
  assert.equal(w.document.querySelector("#additional-context").open, false);
  for (const key of ["market", "geography", "businessModel", "horizon"]) {
    assert.equal(
      w.document.querySelector(`[data-context-dropdown="${key}"]`).value,
      "__custom__",
    );
    assert.equal(
      w.document.querySelector(`[data-path="context.${key}"]`).value,
      s.context[key],
    );
  }
  const dropdown = w.document.querySelector('[data-context-dropdown="market"]');
  dropdown.value = "Healthcare";
  dropdown.dispatchEvent(new w.Event("change"));
  assert.equal(
    JSON.parse(w.localStorage.getItem("pdl-decision-workspace")).context.market,
    "Healthcare",
  );
  w.close();
});
test("multi-select context supports standard options, custom values, removal and reload", () => {
  let w = app();
  click(w, "Product Context");
  for (const value of ["SMB", "Enterprise"]) {
    const el = w.document.querySelector(
      `[data-context-multi="segment"][value="${value}"]`,
    );
    el.checked = true;
    el.dispatchEvent(new w.Event("change"));
  }
  let input = w.document.querySelector('[data-context-custom="priorities"]');
  input.value = "Improve onboarding";
  input.dispatchEvent(new w.Event("input"));
  click(w, "Add priority");
  const saved = w.localStorage.getItem("pdl-decision-workspace");
  w.close();
  w = app(saved);
  click(w, "Product Context");
  assert.equal(
    w.document.querySelector('[data-context-multi="segment"][value="SMB"]')
      .checked,
    true,
  );
  assert.match(text(w), /Improve onboarding/);
  w.document.querySelector('[data-remove-context="priorities"]').click();
  assert.equal(
    JSON.parse(w.localStorage.getItem("pdl-decision-workspace")).context
      .priorities,
    "",
  );
  w.close();
});
test("additional context stays open while changing dropdowns and custom text is editable", () => {
  const w = app();
  click(w, "Product Context");
  w.document.querySelector("#additional-context").open = true;
  const dropdown = w.document.querySelector(
    '[data-context-dropdown="geography"]',
  );
  dropdown.value = "__custom__";
  dropdown.dispatchEvent(new w.Event("change"));
  assert.equal(w.document.querySelector("#additional-context").open, true);
  edit(w, "context.geography", "Nordics");
  click(w, "Continue to ideas →");
  click(w, "Decision Assessment");
  assert.match(w.document.querySelector(".report").value, /Nordics/);
  w.close();
});
test("custom priority draft survives another selection; reset clears selections", () => {
  const w = app();
  click(w, "Product Context");
  const input = w.document.querySelector('[data-context-custom="priorities"]');
  input.value = "Draft priority";
  input.dispatchEvent(new w.Event("input"));
  const checkbox = w.document.querySelector(
    '[data-context-multi="priorities"]',
  );
  checkbox.checked = true;
  checkbox.dispatchEvent(new w.Event("change"));
  assert.equal(
    w.document.querySelector('[data-context-custom="priorities"]').value,
    "Draft priority",
  );
  click(w, "Add priority");
  click(w, "Reset workspace");
  click(w, "Continue");
  click(w, "Product Context");
  assert.equal(
    w.document.querySelectorAll("[data-context-multi]:checked").length,
    0,
  );
  assert.equal(
    w.document.querySelector('[data-context-custom="priorities"]').value,
    "",
  );
  assert.equal(w.document.querySelector("#additional-context").open, false);
  w.close();
});

test("guided demo launches in one click, navigates real views and exports the full report", () => {
  const w = app();
  click(w, "Explore Guided Demo");
  assert.equal(w.document.querySelector("#confirm").open, false);
  assert.match(text(w), /Opportunity Overview/);
  assert.match(text(w), /10 engineering points/);
  assert.equal(w.document.querySelectorAll(".decision").length, 3);
  click(w, "Next: Competitive Positioning →");
  assert.ok(w.document.querySelector('[data-path="competitors.0.name"]'));
  click(w, "Next: Decision Challenger →");
  assert.ok(w.document.querySelector("[data-review]"));
  click(w, "← Previous");
  assert.match(text(w), /Competitive Positioning/);
  w.document.querySelector('[data-demo-step="4"]').click();
  assert.match(text(w), /Critical assumption/);
  click(w, "Open full Opportunity Assessment →");
  assert.match(w.document.querySelector(".report").value, /Audit Logging/);
  assert.ok(w.document.querySelector("#download"));
  w.close();
});
test("guided constraints and explicit strategy assumptions update real portfolio and recommendations", () => {
  const w = app(undefined, "https://example.test/dist/?demo=guided&step=3");
  assert.match(text(w), /Your selection fits the capacity limit/);
  let s = () => JSON.parse(w.localStorage.getItem("pdl-guided-demo"));
  click(w, "Reduce capacity to 6 points");
  assert.match(text(w), /4 points over capacity/);
  assert.equal(w.OpportunityEngine.portfolio(s()).effort, 6);
  click(w, "Restore 10 points");
  click(w, "Differentiation");
  assert.deepEqual(Array.from(w.OpportunityEngine.portfolio(s()).ids), [
    "insights",
  ]);
  assert.match(text(w), /no immediate build is justified/);
  assert.equal(
    w.OpportunityEngine.assess(s().ideas[1], s()).action,
    "Validate First",
  );
  click(w, "Enterprise Readiness");
  assert.match(text(w), /Build Audit Logging/);
  w.close();
});
test("direct demo refresh preserves changes and exiting restores user data without writing it", () => {
  const E = require("../dist/engine.js"),
    personal = E.blank();
  personal.context.name = "My real product";
  const raw = JSON.stringify(personal);
  let w = app(raw, "https://example.test/dist/?demo=guided&step=3");
  click(w, "Reduce capacity to 6 points");
  const demo = w.localStorage.getItem("pdl-guided-demo");
  assert.equal(w.localStorage.getItem("pdl-decision-workspace"), raw);
  w.close();
  w = app(raw, "https://example.test/dist/?demo=guided&step=3", demo);
  assert.match(text(w), /6 engineering points/);
  click(w, "Exit Demo");
  assert.equal(w.localStorage.getItem("pdl-decision-workspace"), raw);
  click(w, "Start Your Own Assessment");
  assert.equal(
    w.document.querySelector('[data-path="context.name"]').value,
    "My real product",
  );
  w.close();
});
test("guided restart and clear leave personal workspace intact and own assessment remains editable", () => {
  const E = require("../dist/engine.js"),
    s = E.blank();
  s.context.name = "Personal workspace";
  const raw = JSON.stringify(s),
    w = app(raw);
  click(w, "Explore Guided Demo");
  w.document.querySelector('[data-demo-step="3"]').click();
  click(w, "Reduce capacity to 6 points");
  click(w, "Restart Demo");
  assert.match(text(w), /10 engineering points/);
  assert.equal(w.localStorage.getItem("pdl-decision-workspace"), raw);
  click(w, "Reset workspace");
  assert.match(text(w), /Opportunity Overview/);
  click(w, "Clear workspace data");
  assert.equal(w.localStorage.getItem("pdl-decision-workspace"), raw);
  click(w, "Start Your Own Assessment");
  assert.equal(
    w.document.querySelector('[data-path="context.name"]').value,
    "Personal workspace",
  );
  assert.equal(w.location.search, "");
  w.close();
});

test("guided share link is clean and malformed saved demo falls back safely", async () => {
  const w = app(
    undefined,
    "https://example.test/dist/?demo=guided&step=not-a-number",
    "{bad json",
  );
  assert.match(text(w), /Opportunity Overview/);
  let copied = "";
  Object.defineProperty(w.navigator, "clipboard", {
    value: {
      writeText: async (text) => {
        copied = text;
      },
    },
  });
  await w.document.querySelector("[data-demo-link]").onclick();
  assert.equal(copied, "https://example.test/dist/?demo=guided");
  assert.match(w.document.querySelector("#status").textContent, /copied/);
  w.close();
});

test("name-first single idea reaches a useful partial result without context or ratings", () => {
  const w = app();
  click(w, "Evaluate One Idea");
  assert.equal(
    w.document.querySelectorAll("#quick-start [data-path]").length,
    2,
  );
  click(w, "Start Evaluating");
  assert.match(
    w.document.querySelector("#quick-error").textContent,
    /Enter an idea name/,
  );
  edit(w, "ideas.0.name", "Smart reminders");
  click(w, "Start Evaluating");
  assert.match(text(w), /Opportunity Overview/);
  assert.match(text(w), /What is known/);
  assert.match(text(w), /No final score/);
  assert.equal(w.document.querySelectorAll(".next-question").length, 3);
  const s = JSON.parse(w.localStorage.getItem("pdl-decision-workspace"));
  assert.equal(s.context.segment, "");
  assert.equal(s.ideas[0].ratings.demand, null);
  assert.equal(s.capacityKnown, false);
  click(w, "Decision Brief");
  assert.match(w.document.querySelector(".report").value, /Smart reminders/);
  assert.match(w.document.querySelector(".report").value, /not entered/);
  w.close();
});
test("two and three names can start comparisons without optional detail", () => {
  for (const count of [2, 3]) {
    const w = app();
    click(w, "Compare 2–3 Ideas");
    edit(w, "ideas.0.name", "First");
    edit(w, "ideas.1.name", "Second");
    if (count === 3) {
      click(w, "+ Add optional third idea");
      edit(w, "ideas.2.name", "Third");
    }
    click(w, "Start Evaluating");
    const s = JSON.parse(w.localStorage.getItem("pdl-decision-workspace"));
    assert.equal(s.ideas.length, count);
    assert.ok(s.ideas.every((i) => i.effort === null));
    click(w, "Decision Analysis");
    assert.match(text(w), /Incomplete assessment/);
    click(w, "Idea comparison");
    assert.ok(w.document.querySelector("table"));
    w.close();
  }
});
test("contextual answers update the real workspace while skip leaves scores unknown", () => {
  const w = app();
  click(w, "Evaluate One Idea");
  edit(w, "ideas.0.name", "Audit exports");
  click(w, "Start Evaluating");
  click(w, "Skip for now");
  assert.match(text(w), /Skipped for now/);
  edit(w, "ideas.0.user", "Administrators");
  edit(w, "context.segment", "Enterprise");
  edit(w, "ideas.0.evidence", "Two customers requested export at renewal");
  edit(w, "context.objectives", "Reduce renewal friction");
  click(w, "Update assessment");
  assert.match(text(w), /Two customers requested/);
  assert.doesNotMatch(text(w), /Who is experiencing this problem/);
  const s = JSON.parse(w.localStorage.getItem("pdl-decision-workspace"));
  assert.equal(s.context.objectives, "Reduce renewal friction");
  assert.equal(s.ideas[0].strength, "unknown");
  assert.equal(w.OpportunityEngine.assess(s.ideas[0], s).score, null);
  click(w, "Scenario Planning");
  assert.match(text(w), /Capacity is not entered/);
  edit(w, "capacity", "8");
  assert.doesNotMatch(text(w), /Capacity is not entered/);
  w.close();
});
test("five primary destinations retain secondary context and old deep links", () => {
  for (const route of [
    "opportunities",
    "my-opportunities",
    "compare-and-prioritise",
    "competitive-intelligence",
    "decision-challenger",
    "decision-assessment",
    "decision-brief",
    "product-context",
  ]) {
    const w = app(undefined, "https://example.test/dist/#" + route);
    assert.equal(w.document.querySelectorAll("#nav button").length, 5);
    assert.ok(w.document.querySelector("#view h1"));
    assert.ok(w.document.querySelector('[data-go="Product Context"]'));
    assert.notEqual(
      w.document.querySelector("#view h1").textContent,
      "One idea or three. Is it worth building?",
    );
    w.close();
  }
});
test("opportunity details are collapsed and existing stored fields are preserved", () => {
  const E = require("../dist/engine.js"),
    s = E.sample();
  s.ideas[2].name = "";
  s.ideas[2].problem = "";
  s.ideas[2].evidence = "";
  s.ideas[2].solution = "Preserve this detailed draft";
  const w = app(JSON.stringify(s));
  click(w, "My Opportunities");
  assert.ok(
    [...w.document.querySelectorAll("#view details")].every((d) => !d.open),
  );
  assert.equal(
    w.document.querySelector('[data-path="ideas.2.solution"]').value,
    "Preserve this detailed draft",
  );
  click(w, "Overview");
  click(w, "Compare 2–3 Ideas");
  click(w, "Start Evaluating");
  const saved = JSON.parse(w.localStorage.getItem("pdl-decision-workspace"));
  assert.equal(saved.ideas.length, 3);
  assert.equal(saved.ideas[2].solution, "Preserve this detailed draft");
  assert.equal(saved.context.name, s.context.name);
  w.close();
});

test("all optional questions can be skipped and partial analysis and brief remain accessible", () => {
  const w = app();
  click(w, "Evaluate One Idea");
  edit(w, "ideas.0.name", "A new idea");
  click(w, "Start Evaluating");
  for (const q of ["demand", "competition", "strategy"])
    w.document.querySelector(`[data-skip-question="idea-1:${q}"]`).click();
  click(w, "Skip for now — open analysis");
  assert.match(text(w), /Incomplete assessment/);
  click(w, "Scenario Planning");
  assert.match(text(w), /Capacity is not entered/);
  click(w, "Decision Brief");
  assert.match(w.document.querySelector(".report").value, /Incomplete/);
  assert.ok(w.document.querySelector("#download"));
  const s = JSON.parse(w.localStorage.getItem("pdl-decision-workspace"));
  assert.ok(Object.values(s.context).every((v) => v === ""));
  assert.equal(w.OpportunityEngine.assess(s.ideas[0], s).score, null);
  w.close();
});
