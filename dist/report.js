(function (root) {
  "use strict";
  function report(s, E) {
    const r = E.evaluate(s),
      p = E.portfolio(s);
    const out = [
      "# Product Opportunity Assessment",
      "",
      "## Executive summary",
      r.summary,
      "",
      "Decision-support analysis based on user-provided inputs and transparent rules. No live research or model inference has been performed.",
      s.sample
        ? "Contains an illustrative Northstar Cloud scenario, fictional feedback and sample market assumptions."
        : "User-provided evidence and competitive information have not been independently verified.",
      "",
      "## Decision context",
      ...Object.entries(s.context).map(
        ([k, v]) =>
          `${{ name: "Product", description: "Product description", market: "Industry / market", segment: "Target segment", geography: "Market geography", problem: "Core customer problem", objectives: "Business objectives", priorities: "Strategic priorities", businessModel: "Business model", horizon: "Investment horizon" }[k] || k}: ${v || "Not recorded"}`,
      ),
      "",
      "## Opportunity comparison",
      "| Opportunity | Recommendation | Attractiveness | Evidence | Effort | Delivery efficiency |",
      "| --- | --- | ---: | --- | ---: | ---: |",
      ...s.ideas.map((i) => {
        const a = r.assessments.find((x) => x.id === i.id),
          p = E.prioritise(i, s);
        return `| ${i.name.replaceAll("|", "/") || "Untitled"} | ${a.action} | ${a.score ?? "Incomplete"} | ${a.confidence} | ${i.effort ?? "Unknown"} | ${p.efficiency ?? "Unknown"} |`;
      }),
      "",
      "## Investment trade-offs",
      ...E.insights(s).map((x) => `- ${x.title}: ${x.text}`),
      "",
    ];
    if (s.guidedDemo) {
      const G =
          typeof module !== "undefined"
            ? require("./guided-demo.js")
            : root.GuidedDemo,
        c = G.conclusion(s, E);
      out.splice(
        4,
        0,
        "### Guided investment conclusion",
        ...Object.entries(c).map(
          ([k, v]) =>
            `${{ action: "Most defensible action", evidence: "Supporting evidence", tradeoff: "Main trade-off", assumption: "Critical assumption", change: "What would change the recommendation", next: "Recommended validation" }[k]}: ${v}`,
        ),
        "",
      );
    }
    for (const i of s.ideas) {
      const a = r.assessments.find((x) => x.id === i.id);
      out.push(
        `## ${i.name || "Untitled opportunity"}`,
        "",
        "### Why this matters",
        `Customer problem: ${i.problem || "Unknown"}`,
        `Proposed approach: ${i.solution || "Not recorded"}`,
        `Customer: ${i.user || s.context.segment || "Unknown"}`,
        `Expected outcome: ${i.outcome || "Unknown"}`,
        `Business value: ${i.business || "Not recorded"}`,
        `Strategic relevance: ${i.strategicRelevance || "Not recorded"}`,
        `Market relevance: ${i.marketRelevance || "Not recorded"}`,
        `Time to value: ${i.timeToValue || "Unknown"}`,
        "",
        "### Investment recommendation",
        `${a.action}: ${a.reason}`,
        `Counterargument: ${a.counterargument}`,
        "",
        "### Customer evidence",
        `Provenance: ${i.evidenceType === "fictional" ? "Illustrative sample inputs" : "User-provided; unverified"}`,
        i.evidence || "No supporting evidence recorded.",
        `Customer signals: ${i.signals || "Not recorded"}`,
        "",
        "### Competitive positioning",
        a.comp.tags.join("; "),
        ...a.comp.why,
        ...a.comp.rows.map(
          (c) =>
            `- ${c.name}: ${c.status}; provenance ${c.provenance}; source reference ${c.source}; source date ${c.date}; not retrieved or verified by this application.`,
        ),
        "",
        "### Risks, assumptions and uncertainty",
        `Risks: ${i.risks || "Not recorded"}`,
        `Assumptions: ${i.assumptions || "Not recorded"}`,
        `Unknowns: ${i.unknowns || "Not recorded"}`,
        `Information gaps: ${a.gaps.join(", ") || "None detected by these rules; not a completeness guarantee."}`,
        `Dependencies: ${i.dependencies.map((id) => s.ideas.find((x) => x.id === id)?.name || id).join(", ") || "None entered"}`,
        `External alternative: ${i.alternative}`,
        "",
        "### Validation priorities",
      );
      for (const c of a.challengeDetails.filter(
        (c, n) =>
          n < 3 ||
          i.challengeReviews[c.id]?.response ||
          i.challengeReviews[c.id]?.reviewed,
      )) {
        const review = i.challengeReviews[c.id],
          current = review?.fingerprint === c.fingerprint;
        out.push(
          `- ${c.question} Why: ${c.why} Gap/assumption: ${c.gap} Validation: ${c.validation}`,
          `  Review: ${review?.reviewed && current ? "Reviewed" : "Not currently reviewed"}${review && !current ? " (inputs changed since response)" : ""}; response: ${review?.response || "Not recorded"}`,
        );
      }
      out.push(
        "",
        "### What would change the recommendation?",
        a.change,
        "",
        "### Final PM decision and rationale",
        i.decision || "Not recorded",
        i.notes || "No rationale recorded",
        "",
      );
    }
    out.push(
      "## Portfolio scenarios",
      `Capacity: ${s.capacity} points. Highest additive estimated value within capacity: ${p.value}; effort ${p.effort}; opportunities: ${p.ids.map((id) => s.ideas.find((i) => i.id === id)?.name || id).join(", ") || "none"}.`,
      `Current PM selection: ${s.selected.map((id) => s.ideas.find((i) => i.id === id)?.name || id).join(", ") || "none"}.`,
      `Selection feasibility: ${s.ideas.filter((i) => s.selected.includes(i.id)).some((i) => i.effort === null) ? "Unknown effort" : s.ideas.filter((i) => s.selected.includes(i.id)).reduce((n, i) => n + i.effort, 0) > s.capacity ? "Over capacity" : "Within capacity"}; dependencies ${s.ideas.filter((i) => s.selected.includes(i.id)).some((i) => i.dependencies.some((id) => !s.selected.includes(id))) ? "not satisfied" : "satisfied for entered selection"}.`,
      "The portfolio suggestion is a capacity calculation, not a substitute for the investment assessment. Values assume additivity, no overlap and no synergy.",
      ...s.snapshots.map(
        (x) =>
          `- Saved scenario: ${x.names}; ${x.effort ?? "Unknown"}/${x.capacity} points; value ${x.value ?? "not captured"}; ${x.date}`,
      ),
      "",
      "## Methodology and limitations",
      "Attractiveness = Σ(rating / 5 × weight) / Σ(active weights) × 100. Unknown ratings do not become zero; incomplete assessments have no final score. Evidence strength is self-rated. Delivery efficiency = attractiveness × planning confidence ÷ effort. Planning confidence uses explicit illustrative assumptions: strong .8, weak .4, contradictory 0, otherwise unknown. These multipliers are not calibrated probabilities. The portfolio maximises entered additive value, not efficiency ratios.",
      "Recommendations use evidence, strategy, competitive and feasibility gates; the highest score is never an automatic winner. No customer validation or measured business outcomes are claimed.",
    );
    return out.join("\n");
  }
  const api = { report };
  if (typeof module !== "undefined") module.exports = api;
  else root.DecisionReport = api;
})(typeof window !== "undefined" ? window : globalThis);
