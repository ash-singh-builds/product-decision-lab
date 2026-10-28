"use strict";
const E = OpportunityEngine,
  KEY = "pdl-decision-workspace";
let state = E.blank(),
  page = "Overview",
  message = "";
try {
  const raw =
    localStorage.getItem(KEY) || localStorage.getItem("pdl-opportunities-v2");
  if (raw) {
    const parsed = E.restore(JSON.parse(raw));
    if (!E.validate(parsed).length) state = parsed;
    else message = "Saved data is incompatible. A fresh workspace is ready.";
  }
} catch {
  message = "Storage unavailable or invalid. This session still works.";
}
const $ = (s) => document.querySelector(s),
  esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const tabs = [
  "Overview",
  "Product Context",
  "Opportunities",
  "Competitive Intelligence",
  "Compare & Prioritise",
  "Decision Challenger",
  "Scenario Planning",
  "Decision Assessment",
];
const opts = {
  strength: [
    ["unknown", "Unknown"],
    ["weak", "Weak / stated interest"],
    ["strong", "Strong / behaviour or commitment"],
  ],
  expectation: [
    ["unknown", "Unknown"],
    ["required", "Required by target customers"],
    ["optional", "Optional"],
    ["emerging", "Emerging need"],
  ],
  unique: [
    ["unknown", "Unknown"],
    ["yes", "Distinct customer outcome"],
    ["no", "No — parity capability"],
  ],
  alternative: [
    ["unknown", "Unknown"],
    ["available", "Viable external option entered"],
    ["unavailable", "No viable external option identified"],
  ],
  evidenceType: [
    ["user", "User-provided / unverified"],
    ["fictional", "Illustrative sample"],
  ],
  capability: [
    ["unknown", "Unknown"],
    ["yes", "Offers"],
    ["partial", "Partial"],
    ["no", "Not available — source confirmed"],
  ],
  action: [
    ["", "Not recorded"],
    ...[
      "Build Now",
      "Validate First",
      "Defer",
      "Buy/Partner",
      "Do Not Pursue",
    ].map((x) => [x, x]),
  ],
};
function field(
  label,
  path,
  value,
  { type = "text", hint = "", list = null } = {},
) {
  return `<label class="field">${label}${list ? `<select data-path="${path}">${list.map(([v, t]) => `<option value="${esc(v)}" ${String(value ?? "") === String(v) ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>` : type === "textarea" ? `<textarea maxlength="10000" data-path="${path}">${esc(value)}</textarea>` : `<input data-path="${path}" type="${type}" ${type === "number" ? 'min="0" max="1000" step="any"' : 'maxlength="10000"'} value="${esc(value)}">`}${hint ? `<small>${hint}</small>` : ""}</label>`;
}
const check = (label, path, value) =>
  `<label class="check"><input type="checkbox" data-path="${path}" ${value ? "checked" : ""}>${label}</label>`;
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    message = "Saved in this browser.";
  } catch {
    message = "Storage unavailable. Keep this tab open or export a report.";
  }
}
function go(name) {
  page = name;
  history.replaceState(null, "", "#" + pageSlug(name));
  render();
  $("#content").focus();
}
function provenance() {
  return `<div class="notice">${state.sample ? "<strong>Illustrative Northstar Cloud scenario.</strong> Customer feedback, competitor profiles and market assumptions are fictional." : "<strong>User-provided evidence.</strong> Competitive information is unverified unless a source is marked as confirmed by you."} <a href="#methodology">How to interpret this analysis →</a></div>`;
}
function overview() {
  return `<div class="hero"><span class="eyebrow">PRODUCT DECISION LAB</span><h1>One idea or three.<br><em>Is it worth building?</em></h1><p class="proposition">From product opportunities to confident investment decisions.</p><p class="lead">Evaluate opportunities, understand competitive positioning and navigate product investment decisions with clarity.</p><div class="actions"><button class="primary" data-start="single">Evaluate an Opportunity</button><button data-start="compare">Compare Opportunities</button></div><button class="text-action" data-sample>Explore an Example →</button></div><div class="workflow"><span>Customer Context</span><b>→</b><span>Market Intelligence</span><b>→</b><span>Opportunity Assessment</span><b>→</b><span>Investment Decision</span></div><div class="grid"><div class="card"><span class="eyebrow">OPPORTUNITY INTELLIGENCE</span><h2 style="margin-top:16px">Understand why an investment matters.</h2><p>Connect customer problems, evidence and competitive expectations. Challenge the assumptions before committing.</p><button data-go="Opportunities">Define an opportunity →</button></div><div class="card"><span class="eyebrow">INVESTMENT & PRIORITISATION</span><h2 style="margin-top:16px">Make the trade-offs visible.</h2><p>Compare attractiveness, delivery efficiency and feasible portfolios. Keep the final decision in your hands.</p><button data-go="Compare & Prioritise">Explore investment choices →</button></div></div><div class="card sample-banner"><div><h2>Northstar Cloud · An enterprise investment decision</h2><p>SSO, insights or audit logging? Explore a complete illustrative scenario.</p></div><button data-sample>Explore an Example ↗</button></div>${provenance()}<div class="card"><div class="section-head"><div><h2>Your decision workspace</h2><p>${esc(state.context.name || "Start with your product context")} · ${state.ideas.length} opportunity(s) · ${state.competitors.length} competitor profiles</p></div><button data-go="Product Context">Edit context</button></div><p class="muted">Better product decisions start with better questions.</p></div>`;
}
const contextLabels = {
  market: "Industry / Market",
  geography: "Geographic Market",
  businessModel: "Business Model",
  horizon: "Decision Horizon",
};
let additionalContextOpen = false;
const contextDrafts = { segment: "", priorities: "" };
function contextDropdown(key) {
  const value = state.context[key],
    custom =
      (state.contextUI?.customFields || []).includes(key) ||
      (value && !ContextFields.catalog[key].includes(value));
  return `<div class="context-control"><label class="field">${contextLabels[key]}<select data-context-dropdown="${key}"><option value="">Not specified</option>${ContextFields.catalog[key].map((v) => `<option value="${esc(v)}" ${!custom && value === v ? "selected" : ""}>${esc(v)}</option>`).join("")}<option value="__custom__" ${custom ? "selected" : ""}>Other / Custom</option></select></label>${custom ? field("Custom " + contextLabels[key], `context.${key}`, value, { hint: "Your existing wording is retained. Enter the value that fits your product." }) : ""}</div>`;
}
function contextMulti(key, label) {
  const values = ContextFields.selections(state, key),
    suggestions = ContextFields.catalog[key],
    custom = values.filter((v) => !suggestions.includes(v));
  return `<fieldset class="context-multi"><legend>${label}</legend><p class="form-hint">Select all that apply${key === "priorities" ? "; add your own priorities below" : ". Use Other for a custom segment"}.</p><div class="selection-options">${suggestions.map((v) => `<label><input type="checkbox" data-context-multi="${key}" value="${esc(v)}" ${values.includes(v) ? "checked" : ""}>${esc(v)}</label>`).join("")}</div>${custom.length ? `<div class="selected-custom">${custom.map((v, n) => `<span>${esc(v)}<button type="button" data-remove-context="${key}" data-value-index="${values.indexOf(v)}" aria-label="Remove ${esc(v)}">×</button></span>`).join("")}</div>` : ""}<div class="custom-entry"><label class="field">${key === "priorities" ? "Custom priority" : "Custom customer segment"}<input type="text" maxlength="1000" data-context-custom="${key}" value="${esc(contextDrafts[key])}" placeholder="${key === "priorities" ? "e.g. Reduce onboarding friction" : "e.g. Early-stage founders"}"></label><button type="button" data-add-context="${key}">Add ${key === "priorities" ? "priority" : "segment"}</button></div><p class="form-hint" data-context-selection="${key}">${values.length ? esc(values.join(" · ")) : "No selections yet"}</p></fieldset>`;
}
function context() {
  return `<h1>Start with the context.</h1><p class="lead">Define who you serve and what matters. These selections guide the discussion; opportunity scores still require your explicit ratings.</p><section class="card"><h2>Essential Context</h2><p>Start here. Add further detail only where it helps the decision.</p><div class="grid">${field("Product Name", "context.name", state.context.name)}${contextDropdown("market")}${field("Product Description", "context.description", state.context.description, { type: "textarea" })}${field("Primary Customer Problem", "context.problem", state.context.problem, { type: "textarea" })}${contextMulti("segment", "Target Customer Segment")}${field("Business Objectives", "context.objectives", state.context.objectives, { type: "textarea" })}<div class="context-wide">${contextMulti("priorities", "Strategic Priorities")}</div></div></section><details id="additional-context" class="card" ${additionalContextOpen ? "open" : ""}><summary>Additional Context <span class="muted">Optional</span></summary><p>Useful for market scope and investment planning. Existing values are retained here.</p><div class="grid">${contextDropdown("geography")}${contextDropdown("businessModel")}${contextDropdown("horizon")}</div></details><button class="primary" data-go="Opportunities">Continue to ideas →</button>`;
}
function ideas() {
  return `<div class="section-head"><div><h1>Define the opportunities.</h1><p>Start with what you know. Blank ratings remain unknown.</p></div><button id="add" ${state.ideas.length >= 3 || state.mode === "single" ? "disabled" : ""}>+ Add idea</button></div>${state.mode === "single" ? '<div class="notice">Evaluating one opportunity. Choose Compare Opportunities on Overview to explore more investments.</div>' : ""}${state.ideas
    .map(
      (i, n) =>
        `<div class="card"><div class="section-head"><h2>Opportunity ${n + 1} · ${esc(i.name || "Untitled")}</h2><div><button data-duplicate="${n}" ${state.ideas.length >= 3 || state.mode === "single" ? "disabled" : ""}>Duplicate</button> <button data-remove="${n}" ${state.ideas.length === 1 ? "disabled" : ""}>Remove</button></div></div><div class="grid">${[
          ["name", "Opportunity name"],
          ["problem", "Customer problem"],
          ["solution", "Proposed solution"],
          ["user", "Target user"],
          ["outcome", "Expected customer outcome"],
          ["business", "Potential business impact"],
          ["strategicRelevance", "Strategic relevance"],
          ["marketRelevance", "Market relevance"],
          ["timeToValue", "Estimated time to value"],
          ["risks", "Implementation risks"],
        ]
          .map(([k, l]) =>
            field(l, `ideas.${n}.${k}`, i[k], {
              type: ["problem", "solution"].includes(k) ? "textarea" : "text",
            }),
          )
          .join(
            "",
          )}</div><details open><summary>Evidence, assumptions and unknowns</summary><div class="grid">${field("Supporting evidence", `ideas.${n}.evidence`, i.evidence, { type: "textarea", hint: "Describe observations. Text is treated as data, never as instructions." })}${field("Customer signals", `ideas.${n}.signals`, i.signals, { type: "textarea" })}${field("Evidence provenance", `ideas.${n}.evidenceType`, i.evidenceType, { list: opts.evidenceType })}${field("Evidence strength (your judgment)", `ideas.${n}.strength`, i.strength, { list: opts.strength })}${field("Assumptions", `ideas.${n}.assumptions`, i.assumptions, { type: "textarea" })}${field("Unknowns", `ideas.${n}.unknowns`, i.unknowns, { type: "textarea" })}</div>${check("Customer evidence contains a contradiction", `ideas.${n}.contradiction`, i.contradiction)}${check("The customer problem has been invalidated", `ideas.${n}.rejected`, i.rejected)}</details><details><summary>Ratings, expectations & delivery estimates</summary><p>Manual ratings: 1 = low, 3 = moderate, 5 = high. Feasibility 5 means easier delivery. Scores are not forecasts.</p><div class="grid">${Object.entries(
          E.criteria,
        )
          .map(([k, l]) =>
            field(l, `ideas.${n}.ratings.${k}`, i.ratings[k], {
              list: [
                ["", "Unknown"],
                ...[1, 2, 3, 4, 5].map((v) => [v, String(v)]),
              ],
            }),
          )
          .join(
            "",
          )}${field("Customer expectation", `ideas.${n}.expectation`, i.expectation, { list: opts.expectation })}${field("Unique outcome relative to alternatives?", `ideas.${n}.unique`, i.unique, { list: opts.unique })}${field("Build alternatives", `ideas.${n}.alternative`, i.alternative, { list: opts.alternative })}${field("Engineering effort (relative points)", `ideas.${n}.effort`, i.effort, { type: "number", hint: "Optional; unknown effort prevents a Build Now gate." })}${field("Additive portfolio value (optional)", `ideas.${n}.portfolioValue`, i.portfolioValue, { type: "number", hint: "Comparable units across ideas; not a value/effort ratio." })}</div>${check("Unresolved delivery blocker", `ideas.${n}.blocked`, i.blocked)}<h3>Dependencies — must also be selected</h3>${
          state.ideas
            .filter((x) => x.id !== i.id)
            .map(
              (x) =>
                `<label class="check"><input type="checkbox" data-dependency="${n}" value="${x.id}" ${i.dependencies.includes(x.id) ? "checked" : ""}>${esc(x.name || "Untitled")}</label>`,
            )
            .join("") || "<p>No other ideas to depend on.</p>"
        }</details></div>`,
    )
    .join(
      "",
    )}<div class="actions"><button class="primary" data-go="Competitive Intelligence">Review competitor capabilities →</button><button data-go="Compare & Prioritise">Assess current inputs</button></div>`;
}
function competitors() {
  return `<div class="section-head"><div><h1>Competitive Intelligence</h1><p class="lead">Compare relevant capabilities in your target segment. Unknown is never interpreted as absent.</p></div><button id="add-competitor" ${state.competitors.length >= 10 ? "disabled" : ""}>+ Add competitor</button></div>${provenance()}<div class="card table-wrap"><h2>Competitive capability matrix</h2>${state.competitors.length ? `<table><thead><tr><th>Competitor / substitute</th>${state.ideas.map((i) => `<th>${esc(i.name || "Untitled opportunity")}</th>`).join("")}<th>Evidence status</th></tr></thead><tbody>${state.competitors.map((c, n) => `<tr><th>${esc(c.name || "Unnamed")}<br><small>${esc(c.segment || c.position || "Segment not specified")}</small></th>${state.ideas.map((i) => `<td>${field(i.name || "Opportunity", `competitors.${n}.capabilities.${i.id}`, c.capabilities[i.id] || "unknown", { list: opts.capability.map(([v, l]) => [v, v !== "no" ? l : c.status === "fictional" ? "Not available — illustrative assumption" : c.status === "verified" && c.source.trim() ? "Not available — user-confirmed source" : "Absence claim — unverified; treated as unknown"]) })}</td>`).join("")}<td>${c.status === "fictional" ? "Illustrative profile" : c.status === "verified" && c.source.trim() ? "User-confirmed source" : "Unverified information"}${c.relevant === false ? "<br>Excluded as not relevant" : ""}</td></tr>`).join("")}</tbody></table>` : "<p>No competitor information entered. Add a profile or continue with the uncertainty disclosed.</p>"}<p class="muted">A “not available” entry counts as known only for illustrative profiles or user-confirmed sources with supporting notes. A missing marketing claim does not establish absence.</p></div>${state.competitors
    .map(
      (c, n) =>
        `<div class="card"><div class="section-head"><h2>${esc(c.name || "Competitor profile")}</h2><button data-remove-competitor="${n}">Remove profile</button></div><div class="grid">${field("Competitor / substitute", `competitors.${n}.name`, c.name)}${field("Product positioning", `competitors.${n}.position`, c.position)}${field("Target segment", `competitors.${n}.segment`, c.segment)}${field("Differentiating characteristics", `competitors.${n}.differences`, c.differences, { type: "textarea" })}${field("Source / supporting notes", `competitors.${n}.source`, c.source, { type: "textarea", hint: "Manually supplied. No external research is performed." })}${field("Source date", `competitors.${n}.date`, c.date, { type: "date" })}${field(
          "Verification status",
          `competitors.${n}.status`,
          c.status,
          {
            list: [
              ["user", "Unverified competitive information"],
              ["verified", "Source confirmed by user"],
              ["fictional", "Illustrative sample profile"],
            ],
          },
        )}</div>${check("Relevant to the current target segment", `competitors.${n}.relevant`, c.relevant !== false)}</div>`,
    )
    .join(
      "",
    )}<button class="primary" data-go="Compare & Prioritise">Review opportunity positioning →</button>`;
}
function comparison() {
  const r = E.evaluate(state);
  return `<h1>${state.ideas.length === 1 ? "Opportunity Assessment" : "Compare & Prioritise"}</h1><p class="lead">${r.summary}</p>${provenance()}<details class="card"><summary>Adjust strategic criteria</summary>${criteria()}</details><div class="insight-grid">${E.insights(
    state,
  )
    .map(
      (x) =>
        `<div class="insight"><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`,
    )
    .join("")}</div><div class="grid3">${state.ideas
    .map((i) => {
      const a = r.assessments.find((a) => a.id === i.id);
      return `<div class="card"><span class="pill-label">${esc(i.name || "Untitled")}</span><div class="decision">${a.action}</div><p>${a.reason}</p><div class="score">${a.score ?? "—"} <small>${a.complete ? " / 100 attractiveness" : "Incomplete assessment"}</small></div><p class="muted">Delivery efficiency: ${E.prioritise(i, state).efficiency ?? "Unknown"}${E.prioritise(i, state).efficiency === null ? "" : " confidence-adjusted points / effort"}</p><p><strong>Why this matters</strong><br>${esc(i.problem || "Customer problem not yet recorded.")}</p><p class="muted">${a.coverage}% of active weight rated${a.score === null && a.partialScore !== null ? `; provisional ${a.partialScore}/100 on known ratings only` : ""}</p><div class="bar"><span style="width:${a.coverage}%"></span></div><p>${a.comp.tags.map((t) => `<span class="badge">${t}</span>`).join("")}</p><details open><summary>Why these classifications?</summary><ul>${a.comp.why.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></details><details><summary>Evidence and missing information</summary><p>${a.confidence} · ${esc(i.evidence || "No evidence entered")}</p><ul>${a.gaps.map((t) => `<li>Missing / unknown: ${t}</li>`).join("")}</ul></details><details><summary>Counterargument & next step</summary><p>${a.counterargument}</p><p>${esc(a.challenges[0])}</p><p>${esc(a.change)}</p></details></div>`;
    })
    .join(
      "",
    )}</div><div class="card table-wrap"><h2>Side-by-side inputs</h2><table><thead><tr><th>Dimension</th>${state.ideas.map((i) => `<th>${esc(i.name || "Untitled")}</th>`).join("")}</tr></thead><tbody>${[...Object.entries(E.criteria).map(([k, l]) => [l, (i) => (i.ratings[k] === null ? "Unknown" : i.ratings[k] + "/5")]), ["Evidence", (i) => i.strength], ["Effort", (i) => i.effort ?? "Unknown"], ["Unique outcome", (i) => i.unique], ["External option", (i) => i.alternative], ["Dependencies", (i) => i.dependencies.map((id) => state.ideas.find((x) => x.id === id)?.name || id).join(", ") || "None entered"], ["Time to value", (i) => i.timeToValue || "Unknown"], ["Delivery efficiency", (i) => E.prioritise(i, state).efficiency ?? "Unknown"], ["Risks / unknowns", (i) => i.risks || i.unknowns || "Not recorded"]].map(([label, fn]) => `<tr><th>${label}</th>${state.ideas.map((i) => `<td>${esc(fn(i))}</td>`).join("")}</tr>`).join("")}</tbody></table></div><div class="actions"><button data-go="Scenario Planning">Explore capacity trade-offs</button><button class="primary" data-go="Decision Challenger">Challenge assessment →</button></div>`;
}
function challenger() {
  const r = E.evaluate(state);
  return `<h1>Better decisions start with better questions.</h1><p class="lead">Review the most consequential uncertainties. Record what you have checked and what still needs validation.</p>${r.assessments
    .map((a, n) => {
      const i = state.ideas[n];
      return `<div class="card"><div class="section-head"><h2>${esc(i.name || "Untitled opportunity")}</h2><span class="tag">${a.action}</span></div>${a.challengeDetails
        .map((c, j) => {
          const reviews = i.challengeReviews || (i.challengeReviews = {});
          const review =
            reviews[c.id] ||
            (reviews[c.id] = {
              reviewed: false,
              response: "",
              fingerprint: c.fingerprint,
            });
          const stale = review.fingerprint !== c.fingerprint;
          return `<details class="challenge-card" ${j < 2 ? "open" : ""}><summary><span class="challenge-index">${j + 1}</span>${esc(c.question)} ${review.reviewed && !stale ? '<span class="reviewed">Reviewed</span>' : ""}</summary><div class="challenge-body"><p><strong>Why it matters</strong><br>${esc(c.why)}</p><p><strong>Evidence gap / assumption</strong><br>${esc(c.gap)}</p><p><strong>Suggested validation</strong><br>${esc(c.validation)}</p>${stale ? '<div class="notice warning">Inputs changed since this response. Review the updated challenge again.</div>' : ""}<label class="check"><input type="checkbox" data-review="${n}" data-challenge="${c.id}" data-fingerprint="${c.fingerprint}" ${review.reviewed && !stale ? "checked" : ""}>Reviewed for the current inputs</label>${field("Your response", `ideas.${n}.challengeReviews.${c.id}.response`, review.response, { type: "textarea" })}</div></details>`;
        })
        .join(
          "",
        )}<h3 style="margin-top:24px">What would change this recommendation?</h3><p>${esc(a.change)}</p><div class="grid">${field("Final PM decision", `ideas.${n}.decision`, i.decision, { list: opts.action })}${field("Decision rationale / alternative view", `ideas.${n}.notes`, i.notes, { type: "textarea" })}</div></div>`;
    })
    .join(
      "",
    )}<button class="primary" data-go="Decision Assessment">Generate Product Opportunity Assessment →</button>`;
}
function criteria() {
  return `<div class="card"><h2>Strategic decision criteria</h2><p>Attractiveness = weighted mean of your ratings on a 0–100 scale. Unknown ratings remain incomplete. Zero weight excludes a criterion.</p><div class="grid">${Object.entries(
    E.criteria,
  )
    .map(([k, l]) =>
      field(l + " weight", `weights.${k}`, state.weights[k], {
        type: "number",
        hint: "0–100; weights normalise automatically",
      }),
    )
    .join(
      "",
    )}</div><details><summary>How the recommendation gates work</summary><p>Invalidated problems are not pursued. Contradictions, missing inputs and weak evidence require validation. Strong evidence and complete ratings can support deferral, buying/partnering or building, depending on strategy, alternatives, competitive coverage and feasibility. A score of at least 70 does not bypass these gates.</p><a href="#methodology">Full methodology →</a></details></div>`;
}
function scenario() {
  const p = E.portfolio(state),
    chosen = state.ideas.filter((i) => state.selected.includes(i.id)),
    unknown = chosen.some((i) => i.effort === null),
    effort = chosen.reduce((n, i) => n + (i.effort || 0), 0),
    value = chosen.some((i) => i.portfolioValue === null)
      ? null
      : chosen.reduce((n, i) => n + i.portfolioValue, 0),
    missing = chosen.flatMap((i) =>
      i.dependencies.filter((id) => !state.selected.includes(id)),
    );
  return `<h1>Scenario Planning</h1><p class="lead">What can you deliver—and what must wait? Adjust capacity or estimates without confusing delivery fit with investment merit.</p><div class="grid"><div class="card"><h2>Shape your investment portfolio</h2>${field("Engineering capacity", "capacity", state.capacity, { type: "number" })}<label class="field">Explore capacity<input aria-label="Capacity slider" type="range" min="0" max="50" value="${Math.min(50, state.capacity)}" data-path="capacity"></label>${state.ideas.map((i, n) => `<div class="scenario-row"><label class="check"><input type="checkbox" data-select="${i.id}" ${state.selected.includes(i.id) ? "checked" : ""}>${esc(i.name || "Untitled opportunity")}</label><div class="grid">${field("Estimated effort", `ideas.${n}.effort`, i.effort, { type: "number" })}${field("Additive planning value", `ideas.${n}.portfolioValue`, i.portfolioValue, { type: "number" })}</div></div>`).join("")}<div class="notice ${unknown || effort > state.capacity || missing.length ? "warning" : ""}"><strong>${unknown ? "Selected effort is unknown" : effort > state.capacity ? `Your selection is ${effort - state.capacity} points over capacity` : "Your selection fits the capacity limit"}</strong><br>${effort} known effort / ${state.capacity} capacity · ${value ?? "unknown"} planning value${missing.length ? "<br>Missing dependencies: " + missing.map((id) => esc(state.ideas.find((i) => i.id === id)?.name || id)).join(", ") : ""}</div><button id="snapshot">Save scenario</button></div><div class="card"><span class="eyebrow">FEASIBLE ALTERNATIVE</span><h2 style="margin-top:16px">Highest additive value within capacity</h2><p>${p.ids.map((id) => esc(state.ideas.find((i) => i.id === id).name || "Untitled")).join(" + ") || "No positive-value feasible portfolio."}</p><div class="metric-pair"><div><strong>${p.value}</strong><small>entered value units</small></div><div><strong>${p.effort} / ${state.capacity}</strong><small>effort / capacity</small></div></div><button id="apply-portfolio" class="primary">Apply portfolio selection</button><p>Only opportunities with known effort and value are eligible. Blocked and invalidated opportunities are excluded; selected dependencies must fit together.</p><div class="notice">Capacity feasibility does not establish customer demand or justify an investment. Review each opportunity recommendation before committing.</div><details><summary>Assumptions behind the optimiser</summary><p>Maximise total additive entered value subject to capacity and dependency constraints. Values assume no overlap or synergy. This is not a sum of value-per-effort ratios or a business forecast.</p></details></div></div><div class="card table-wrap"><h2>Saved portfolio scenarios</h2>${state.snapshots.length ? `<table><thead><tr><th>Selection</th><th>Effort / capacity</th><th>Planning value</th><th>Priorities</th><th>Saved</th></tr></thead><tbody>${state.snapshots.map((x) => `<tr><td>${esc(x.names)}</td><td>${x.effort ?? "Unknown"} / ${x.capacity}</td><td>${x.value ?? "Not captured"}</td><td>${esc(x.priorities || "Not recorded")}</td><td>${esc(x.date)}</td></tr>`).join("")}</tbody></table>` : "<p>Save a scenario, change the constraints, then save another to compare.</p>"}</div><button data-go="Compare & Prioritise">Return to investment priorities →</button>`;
}
function methodology() {
  return `<h1>Methodology & interpretation</h1><p class="lead">Decision-support analysis derived from your inputs and transparent rules. No generative model or external research is used.</p><div class="card"><h2>Three distinct questions</h2><p><strong>Opportunity attractiveness:</strong> weighted mean of ratings ÷ 5 × 100. Criteria weights normalise automatically. Missing ratings produce no final score.</p><p><strong>Delivery efficiency:</strong> attractiveness × planning confidence ÷ effort. Planning confidence assumptions are strong .8, weak .4, contradictory 0; unknown evidence remains unknown. These are explicit illustrative multipliers, not calibrated probabilities. Zero or unknown effort has no efficiency score.</p><p><strong>Portfolio feasibility:</strong> highest sum of entered additive planning value that fits capacity and supported dependencies. It does not maximise efficiency ratios.</p></div><div class="card"><h2>Recommendation gates</h2><p>Invalidated problem → Do Not Pursue. Contradiction or missing required inputs → Validate First. Strong evidence and complete ratings: low problem and strategic fit → Do Not Pursue; blocker or low fit → Defer; required parity with an external alternative and no unique outcome → Buy/Partner. Insufficient competition requires validation. Score ≥70 with problem, strategy and feasibility ratings ≥3 → Build Now; score below45 → Defer; otherwise → Validate First.</p><p>Required inputs: opportunity name, problem, supporting evidence, customer segment, objectives, effort and active criterion ratings. Your ratings are judgments, not independently validated facts.</p></div><div class="card"><h2>Competitive classifications</h2><p>Potential table stakes requires both a declared customer requirement and at least two known relevant competitor entries, with at least half fully offering it. Adoption alone is insufficient. Potential differentiation requires a unique customer outcome and two known entries with none fully offering it. Partial capability is not full parity. Unknown never means absent.</p><p>Absent entries count only for illustrative profiles or user-confirmed sources with notes. Source confirmation is your attestation, not verification by the application. Excluding a profile from the target segment excludes it from classification.</p></div><div class="card"><h2>Evidence & privacy</h2><p>Illustrative scenarios contain fictional feedback and sample market assumptions. User-provided evidence and competitor references remain unverified. No browsing, interviews, adoption studies or measured business outcomes are claimed.</p><p>Workspace data is saved in this browser only. It is not encrypted or synced. Avoid sensitive data on shared devices. You can clear the workspace at any time.</p></div>`;
}

function reportPreview(markdown) {
  let out = "",
    table = [];
  const flush = () => {
    if (table.length) {
      out +=
        "<table>" +
        table
          .map(
            (line, n) =>
              "<tr>" +
              line
                .split("|")
                .slice(1, -1)
                .map(
                  (cell) =>
                    `<${n ? "td" : "th"}>${esc(cell.trim())}</${n ? "td" : "th"}>`,
                )
                .join("") +
              "</tr>",
          )
          .join("") +
        "</table>";
      table = [];
    }
  };
  for (const line of markdown.split("\n")) {
    if (line.startsWith("|")) {
      if (!/^\|[ :|\-]+\|$/.test(line)) table.push(line);
      continue;
    }
    flush();
    if (/^### /.test(line)) out += "<h3>" + esc(line.slice(4)) + "</h3>";
    else if (/^## /.test(line)) out += "<h2>" + esc(line.slice(3)) + "</h2>";
    else if (/^# /.test(line)) out += "<h1>" + esc(line.slice(2)) + "</h1>";
    else if (line.trim()) out += "<p>" + esc(line) + "</p>";
  }
  flush();
  return out;
}
function reportView() {
  return `<div class="section-head"><div><h1>Decision Assessment</h1><p class="lead">A clear record of the investment rationale, evidence gaps and your final judgment.</p></div><div class="actions"><button id="copy" class="primary">Copy Markdown</button><button id="download">Download .md ↓</button></div></div><div class="card report-document">${reportPreview(E.report(state))}</div><details class="card"><summary>View Markdown source</summary><label class="field">Product Opportunity Assessment<textarea class="report" readonly>${esc(E.report(state))}</textarea></label></details><button data-go="Decision Challenger">Review final PM decision</button>`;
}
function render() {
  if (page === "Product Context" && $("#additional-context"))
    additionalContextOpen = $("#additional-context").open;
  const errors = E.validate(state);
  if (errors.length) {
    $("#view").innerHTML =
      `<div class="notice warning">${esc(errors.join("; "))}</div>`;
    return;
  }
  $("#nav").innerHTML = tabs
    .map(
      (t) =>
        `<button data-go="${t}" class="${page === t ? "active" : ""}" ${page === t ? 'aria-current="page"' : ""}>${t}</button>`,
    )
    .join("");
  $("#status").textContent = message;
  $("#view").innerHTML = {
    Overview: overview,
    "Product Context": context,
    Opportunities: ideas,
    "Competitive Intelligence": competitors,
    "Compare & Prioritise": comparison,
    "Decision Challenger": challenger,
    "Scenario Planning": scenario,
    Methodology: methodology,
    "Decision Assessment": reportView,
  }[page]();
  bind();
}
function setPath(path, value) {
  const parts = path.split(".");
  let target = state;
  for (const k of parts.slice(0, -1)) target = target[k];
  target[parts.at(-1)] = value;
}
function bind() {
  const details = $("#additional-context");
  if (details)
    details.ontoggle = () => {
      additionalContextOpen = details.open;
    };
  document.querySelectorAll("[data-context-dropdown]").forEach(
    (el) =>
      (el.onchange = () => {
        const key = el.dataset.contextDropdown;
        state.contextUI = ContextFields.migrate(state.context, state.contextUI);
        state.contextUI.customFields = state.contextUI.customFields.filter(
          (k) => k !== key,
        );
        if (el.value === "__custom__") state.contextUI.customFields.push(key);
        else state.context[key] = el.value;
        save();
        render();
        document.querySelector(`[data-context-dropdown="${key}"]`)?.focus();
      }),
  );
  document.querySelectorAll("[data-context-multi]").forEach(
    (el) =>
      (el.onchange = () => {
        const key = el.dataset.contextMulti,
          values = ContextFields.selections(state, key);
        try {
          ContextFields.setSelections(
            state,
            key,
            el.checked
              ? [...values, el.value]
              : values.filter((v) => v !== el.value),
          );
          save();
          render();
          [...document.querySelectorAll("[data-context-multi]")]
            .find((x) => x.dataset.contextMulti === key && x.value === el.value)
            ?.focus();
        } catch (e) {
          $("#status").textContent = e.message;
          el.checked = !el.checked;
        }
      }),
  );
  document.querySelectorAll("[data-add-context]").forEach(
    (button) =>
      (button.onclick = () => {
        const key = button.dataset.addContext,
          input = document.querySelector(`[data-context-custom="${key}"]`),
          value = input.value.trim();
        if (!value) {
          $("#status").textContent = "Enter a custom value before adding it.";
          input.focus();
          return;
        }
        try {
          ContextFields.setSelections(state, key, [
            ...ContextFields.selections(state, key),
            value,
          ]);
          contextDrafts[key] = "";
          save();
          render();
          document.querySelector(`[data-context-custom="${key}"]`)?.focus();
        } catch (e) {
          $("#status").textContent = e.message;
        }
      }),
  );
  document.querySelectorAll("[data-context-custom]").forEach((input) => {
    input.oninput = () => {
      contextDrafts[input.dataset.contextCustom] = input.value;
    };
    input.onkeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        document
          .querySelector(`[data-add-context="${input.dataset.contextCustom}"]`)
          .click();
      }
    };
  });
  document.querySelectorAll("[data-remove-context]").forEach(
    (button) =>
      (button.onclick = () => {
        const key = button.dataset.removeContext,
          values = ContextFields.selections(state, key);
        values.splice(Number(button.dataset.valueIndex), 1);
        ContextFields.setSelections(state, key, values);
        save();
        render();
        document.querySelector(`[data-context-custom="${key}"]`)?.focus();
      }),
  );

  document.querySelectorAll("[data-review]").forEach(
    (el) =>
      (el.onchange = () => {
        const review =
          state.ideas[Number(el.dataset.review)].challengeReviews[
            el.dataset.challenge
          ];
        review.reviewed = el.checked;
        review.fingerprint = el.dataset.fingerprint;
        save();
        render();
      }),
  );

  document
    .querySelectorAll("[data-go]")
    .forEach((b) => (b.onclick = () => go(b.dataset.go)));
  document.querySelectorAll("[data-path]").forEach(
    (el) =>
      (el.onchange = () => {
        const path = el.dataset.path;
        let value = el.type === "checkbox" ? el.checked : el.value;
        if (el.type === "number" || el.type === "range") {
          if (!el.checkValidity()) {
            el.reportValidity();
            return;
          }
          value = el.value === "" ? null : Number(el.value);
          if (path.startsWith("weights."))
            value = Math.min(100, Math.max(0, value ?? 0));
          if (path === "capacity") value = value ?? 0;
        }
        if (path.includes(".ratings."))
          value = value === "" ? null : Number(value);
        setPath(path, value);
        save();
        $("#status").textContent = message;
        if (
          ![
            "Product Context",
            "Opportunities",
            "Competitive Intelligence",
            "Decision Challenger",
          ].includes(page) ||
          (page === "Competitive Intelligence" &&
            (path.endsWith(".status") ||
              path.endsWith(".relevant") ||
              path.includes(".capabilities.")))
        ) {
          render();
          const replacement = [
            ...document.querySelectorAll("[data-path]"),
          ].find((x) => x.dataset.path === path && x.type === el.type);
          replacement?.focus();
        }
      }),
  );
  document.querySelectorAll("[data-path]").forEach((el) => {
    el.oninput = el.onchange;
  });
  document
    .querySelectorAll("[data-sample]")
    .forEach((b) => (b.onclick = loadSample));
  document.querySelectorAll("[data-start]").forEach(
    (b) =>
      (b.onclick = () => {
        if (b.dataset.start === "single" && state.ideas.length > 1) {
          confirmReplace("Start a fresh single-idea workspace?", () => {
            state = E.blank();
            additionalContextOpen = false;
            contextDrafts.segment = "";
            contextDrafts.priorities = "";
            save();
            go("Product Context");
          });
          return;
        }
        state.mode = b.dataset.start;
        if (state.mode === "compare" && state.ideas.length === 1)
          state.ideas.push(E.blankIdea("idea-" + Date.now()));
        save();
        go("Product Context");
      }),
  );
  if ($("#add"))
    $("#add").onclick = () => {
      state.ideas.push(E.blankIdea("idea-" + Date.now()));
      save();
      render();
    };
  document.querySelectorAll("[data-duplicate]").forEach(
    (b) =>
      (b.onclick = () => {
        const i = structuredClone(state.ideas[Number(b.dataset.duplicate)]);
        i.id = "idea-" + Date.now();
        i.name += " (copy)";
        i.dependencies = [];
        state.ideas.push(i);
        save();
        render();
      }),
  );
  document.querySelectorAll("[data-remove]").forEach(
    (b) =>
      (b.onclick = () => {
        const [i] = state.ideas.splice(Number(b.dataset.remove), 1);
        state.ideas.forEach(
          (x) => (x.dependencies = x.dependencies.filter((id) => id !== i.id)),
        );
        state.selected = state.selected.filter((id) => id !== i.id);
        state.competitors.forEach((c) => delete c.capabilities[i.id]);
        save();
        render();
      }),
  );
  document.querySelectorAll("[data-dependency]").forEach(
    (el) =>
      (el.onchange = () => {
        const i = state.ideas[Number(el.dataset.dependency)];
        i.dependencies = el.checked
          ? [...i.dependencies, el.value]
          : i.dependencies.filter((id) => id !== el.value);
        save();
      }),
  );
  if ($("#add-competitor"))
    $("#add-competitor").onclick = () => {
      state.competitors.push({
        id: "c-" + Date.now(),
        name: "",
        position: "",
        source: "",
        date: "",
        status: "user",
        capabilities: {},
      });
      save();
      render();
    };
  document.querySelectorAll("[data-remove-competitor]").forEach(
    (b) =>
      (b.onclick = () => {
        state.competitors.splice(Number(b.dataset.removeCompetitor), 1);
        save();
        render();
      }),
  );
  document.querySelectorAll("[data-select]").forEach(
    (el) =>
      (el.onchange = () => {
        state.selected = el.checked
          ? [...state.selected, el.dataset.select]
          : state.selected.filter((id) => id !== el.dataset.select);
        save();
        render();
      }),
  );
  if ($("#apply-portfolio"))
    $("#apply-portfolio").onclick = () => {
      state.selected = E.portfolio(state).ids;
      save();
      render();
    };
  if ($("#snapshot"))
    $("#snapshot").onclick = () => {
      const chosen = state.ideas.filter((i) => state.selected.includes(i.id));
      state.snapshots.unshift({
        names:
          chosen.map((i) => i.name || "Untitled").join(" + ") ||
          "Empty portfolio",
        capacity: state.capacity,
        value: chosen.some((i) => i.portfolioValue === null)
          ? null
          : chosen.reduce((n, i) => n + i.portfolioValue, 0),
        weights: { ...state.weights },
        priorities: state.context.priorities,
        effort: chosen.some((i) => i.effort === null)
          ? null
          : chosen.reduce((n, i) => n + i.effort, 0),
        date: new Date().toLocaleString(),
      });
      state.snapshots = state.snapshots.slice(0, 10);
      save();
      render();
    };
  if ($("#copy"))
    $("#copy").onclick = async () => {
      try {
        await navigator.clipboard.writeText(E.report(state));
        $("#status").textContent = "Report copied.";
      } catch {
        $("#status").textContent =
          "Clipboard unavailable. Select the report text or download Markdown.";
      }
    };
  if ($("#download"))
    $("#download").onclick = () => {
      const url = URL.createObjectURL(
        new Blob([E.report(state)], { type: "text/markdown" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "opportunity-assessment.md";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
}
function confirmReplace(title, action) {
  $("#confirm-title").textContent = title;
  $("#confirm-action").onclick = () => {
    $("#confirm").close();
    action();
  };
  $("#confirm").showModal();
}
function loadSample() {
  confirmReplace("Explore the Northstar Cloud example?", () => {
    state = E.sample();
    additionalContextOpen = false;
    contextDrafts.segment = "";
    contextDrafts.priorities = "";
    save();
    go("Compare & Prioritise");
  });
}
$("#cancel").onclick = () => $("#confirm").close();
$("#sample").onclick = loadSample;
$("#reset").onclick = () =>
  confirmReplace("Reset to a fresh workspace?", () => {
    state = E.blank();
    additionalContextOpen = false;
    contextDrafts.segment = "";
    contextDrafts.priorities = "";
    save();
    go("Overview");
  });
$("#clear").onclick = () =>
  confirmReplace("Clear all saved workspace data?", () => {
    state = E.blank();
    additionalContextOpen = false;
    contextDrafts.segment = "";
    contextDrafts.priorities = "";
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem("pdl-opportunities-v2");
      message = "Workspace data cleared from this browser.";
    } catch {
      message = "Could not access browser storage.";
    }
    go("Overview");
  });
function pageSlug(name) {
  return name.toLowerCase().replaceAll("&", "and").replaceAll(" ", "-");
}
function readRoute() {
  const slug = location.hash.slice(1);
  return (
    [...tabs, "Methodology"].find((t) => pageSlug(t) === slug) || "Overview"
  );
}
window.addEventListener("hashchange", () => {
  page = readRoute();
  render();
});
page = readRoute();
render();
