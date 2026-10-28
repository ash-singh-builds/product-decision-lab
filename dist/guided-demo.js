(function (root) {
  "use strict";
  const stages = [
    {
      title: "Opportunity Overview",
      page: "Compare & Prioritise",
      text: "Northstar Cloud wants to expand into enterprise accounts while building differentiated capabilities. Compare three investments: adoption, new insights and governance.",
    },
    {
      title: "Competitive Positioning",
      page: "Competitive Intelligence",
      text: "SSO and audit trails may be enterprise expectations; insights could differentiate. Competitor adoption alone does not prove customer necessity. All profiles below are fictional.",
    },
    {
      title: "Decision Challenger",
      page: "Decision Challenger",
      text: "Test the assumptions behind the recommendations. Interest in AI insights is not repeat-use evidence, and an SSO requirement still needs procurement validation.",
    },
    {
      title: "Investment Trade-offs",
      page: "Scenario Planning",
      text: "Ten points can cover SSO and audit logging together. Reduce capacity or change strategic emphasis to see what fits—and which opportunities still need validation.",
    },
    {
      title: "Decision Assessment",
      page: "Guided Conclusion",
      text: "Turn the current evidence and constraints into an investment discussion. This conclusion updates when you change the scenario; the final decision remains yours.",
    },
  ];
  function emphasis(s, differentiate) {
    s.context.priorities = differentiate
      ? "Product differentiation"
      : "Enterprise readiness; Customer retention";
    s.context.objectives = differentiate
      ? "Differentiate the platform while protecting enterprise adoption and retention."
      : "Improve enterprise adoption; strengthen retention; differentiate the platform.";
    s.weights = {
      problem: 15,
      demand: 10,
      strategy: 50,
      value: 15,
      feasibility: 10,
    };
    for (const i of s.ideas) {
      i.ratings.strategy =
        (differentiate
          ? { sso: 2, insights: 5, audit: 2 }
          : { sso: 5, insights: 2, audit: 5 })[i.id] ?? i.ratings.strategy;
      i.portfolioValue =
        (differentiate
          ? { sso: 6, insights: 12, audit: 5 }
          : { sso: 9, insights: 8, audit: 7 })[i.id] ?? i.portfolioValue;
    }
    s.demoEmphasis = differentiate ? "Differentiation" : "Enterprise Readiness";
    return s;
  }
  function sample(E) {
    const s = E.sample();
    s.guidedDemo = true;
    s.capacity = 10;
    s.selected = ["sso", "audit"];
    s.context.description =
      "Fictional B2B SaaS workflow platform expanding into enterprise accounts.";
    s.context.segment = "Mid-market; Enterprise";
    for (const i of s.ideas)
      i.risks = {
        sso: "Identity-provider compatibility and security review may expand scope.",
        insights:
          "Unproven repeat use, unreliable insights and ongoing operating cost.",
        audit:
          "Event coverage, retention and access controls require agreement.",
      }[i.id];
    return emphasis(s, false);
  }
  function conclusion(s, E) {
    const result = E.evaluate(s),
      p = E.portfolio(s),
      build = result.assessments
        .filter(
          (a) =>
            a.action === "Build Now" &&
            s.ideas.find((i) => i.id === a.id).effort <= s.capacity,
        )
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
      chosen = build[0],
      i = s.ideas.find((i) => i.id === chosen?.id),
      insights = s.ideas.find((i) => i.id === "insights");
    return {
      action: chosen
        ? `Build ${i.name}; validate scope before commitment.`
        : "Validate first; no immediate build is justified by the current evidence and constraints.",
      evidence:
        i?.evidence ||
        insights?.evidence ||
        "Review the entered evidence before committing.",
      tradeoff: `${s.capacity} points available. Highest entered-value feasible alternative: ${p.ids.map((id) => s.ideas.find((i) => i.id === id).name).join(" + ") || "none"} (${p.effort} effort, ${p.value} value units). This delivery alternative is not a build recommendation; SSO may be bought or partnered.`,
      assumption:
        i?.assumptions ||
        insights?.assumptions ||
        "Customer demand remains unverified.",
      change:
        chosen?.change ||
        "Demonstrated repeat use and a valued distinct outcome could justify a new insights assessment; strategy and feasibility must also support it.",
      next: chosen
        ? "Confirm required event coverage and retention with the three illustrative renewal accounts; validate SSO provider fit separately."
        : "Run a small repeat-use insights experiment with target customers before increasing investment.",
    };
  }
  const api = { stages, sample, emphasis, conclusion };
  if (typeof module !== "undefined") module.exports = api;
  else root.GuidedDemo = api;
})(typeof window !== "undefined" ? window : globalThis);
