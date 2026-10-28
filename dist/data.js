(function (root) {
  "use strict";
  const criteria = {
    problem: "Problem significance",
    demand: "Customer demand",
    strategy: "Strategic fit",
    value: "Business value",
    feasibility: "Feasibility",
  };
  const blankIdea = (id = "idea-1") => ({
    id,
    name: "",
    problem: "",
    solution: "",
    user: "",
    outcome: "",
    business: "",
    evidence: "",
    signals: "",
    assumptions: "",
    unknowns: "",
    evidenceType: "user",
    strength: "unknown",
    contradiction: false,
    expectation: "unknown",
    unique: "unknown",
    alternative: "unknown",
    blocked: false,
    rejected: false,
    effort: null,
    portfolioValue: null,
    dependencies: [],
    ratings: Object.fromEntries(Object.keys(criteria).map((k) => [k, null])),
    decision: "",
    notes: "",
    risks: "",
    timeToValue: "",
    strategicRelevance: "",
    marketRelevance: "",
    challengeReviews: {},
  });
  function blank() {
    return {
      schema: 2,
      mode: "single",
      sample: false,
      context: {
        name: "",
        description: "",
        market: "",
        segment: "",
        geography: "",
        problem: "",
        objectives: "",
        priorities: "",
        businessModel: "",
        horizon: "",
      },
      ideas: [blankIdea()],
      competitors: [],
      weights: {
        problem: 20,
        demand: 25,
        strategy: 25,
        value: 20,
        feasibility: 10,
      },
      capacity: 12,
      selected: [],
      snapshots: [],
    };
  }
  function sample() {
    const s = blank();
    s.sample = true;
    s.mode = "compare";
    s.context = {
      name: "Northstar Cloud",
      description: "Illustrative enterprise workflow management platform",
      market: "B2B SaaS",
      segment: "Mid-market and enterprise teams",
      geography: "Europe and North America",
      problem:
        "Enterprise customers need access control and governance before expanding usage.",
      objectives:
        "Strengthen enterprise readiness, improve retention and expand into larger accounts.",
      priorities:
        "Balance enterprise requirements with meaningful product differentiation.",
      businessModel: "Subscription",
      horizon: "Next quarter",
    };
    s.ideas = [
      {
        ...blankIdea("sso"),
        name: "Enterprise SSO",
        problem: "Enterprise buyers cannot use their identity provider.",
        solution: "SAML SSO with managed identity providers",
        user: "Enterprise IT administrators",
        outcome: "Controlled access and simpler provisioning",
        business: "Remove a potential adoption blocker",
        evidence:
          "Fictional discovery notes: two pilot accounts require SSO before expanding.",
        signals: "Illustrative: 8 of 14 prospects requested SSO.",
        assumptions: "SSO is the remaining procurement blocker.",
        unknowns: "Other procurement requirements; security review effort.",
        strength: "strong",
        expectation: "required",
        unique: "no",
        alternative: "available",
        effort: 6,
        portfolioValue: 9,
        ratings: {
          problem: 5,
          demand: 4,
          strategy: 5,
          value: 4,
          feasibility: 4,
        },
        evidenceType: "fictional",
      },
      {
        ...blankIdea("insights"),
        name: "AI-Powered Insights",
        problem: "Teams struggle to identify actionable patterns.",
        solution: "Automated summaries and suggested insights",
        user: "Team leads",
        outcome: "Find useful patterns faster",
        business: "Potential engagement and differentiation",
        evidence:
          "Fictional interviews: six people expressed interest; no repeat-use experiment.",
        signals: "Illustrative interest only, no usage evidence.",
        assumptions: "Novel insights will lead to repeat engagement.",
        unknowns:
          "Accuracy requirements; willingness to pay; ongoing operating cost.",
        strength: "weak",
        expectation: "optional",
        unique: "yes",
        alternative: "unknown",
        effort: 9,
        portfolioValue: 8,
        ratings: {
          problem: 3,
          demand: 2,
          strategy: 2,
          value: 4,
          feasibility: 2,
        },
        evidenceType: "fictional",
      },
      {
        ...blankIdea("audit"),
        name: "Audit Logging",
        problem: "Administrators cannot investigate sensitive changes.",
        solution: "Searchable audit trail and export",
        user: "Security and compliance teams",
        outcome: "Trace important account events",
        business: "Support retention and governance reviews",
        evidence:
          "Fictional customer notes: three accounts require traceability for renewal review.",
        signals: "Illustrative: 5 governance requests.",
        assumptions: "An exportable event log meets the required review scope.",
        unknowns: "Retention duration; exact event coverage.",
        strength: "strong",
        expectation: "required",
        unique: "no",
        alternative: "unavailable",
        effort: 4,
        portfolioValue: 7,
        ratings: {
          problem: 4,
          demand: 4,
          strategy: 5,
          value: 4,
          feasibility: 4,
        },
        evidenceType: "fictional",
      },
    ];
    s.competitors = [
      {
        id: "c1",
        name: "Orbit Suite (fictional)",
        position: "Enterprise collaboration",
        source: "Illustrative competitor profile; not external market research",
        segment: "Mid-market and enterprise teams",
        differences: "Sample assumptions for discussion",
        relevant: true,
        date: "",
        status: "fictional",
        capabilities: { sso: "yes", insights: "unknown", audit: "yes" },
      },
      {
        id: "c2",
        name: "Beacon Workspace (fictional)",
        position: "Mid-market substitute",
        source: "Illustrative competitor profile; not external market research",
        segment: "Mid-market and enterprise teams",
        differences: "Sample assumptions for discussion",
        relevant: true,
        date: "",
        status: "fictional",
        capabilities: { sso: "yes", insights: "no", audit: "partial" },
      },
    ];
    s.ideas[0].risks = "Security review and identity-provider compatibility";
    s.ideas[0].timeToValue = "One quarter, subject to security review";
    s.ideas[0].strategicRelevance = "Enterprise access-control readiness";
    s.ideas[0].marketRelevance = "Sample enterprise procurement expectation";
    s.ideas[1].risks =
      "Recommendation reliability, adoption and ongoing operating effort";
    s.ideas[1].timeToValue = "Uncertain; validate repeat use first";
    s.ideas[1].strategicRelevance = "Potential product differentiation";
    s.ideas[1].marketRelevance =
      "A possible gap; competitive evidence is incomplete";
    s.ideas[2].risks = "Event coverage, retention and sensitive event access";
    s.ideas[2].timeToValue = "One quarter, assuming agreed governance scope";
    s.ideas[2].strategicRelevance = "Retention and governance readiness";
    s.ideas[2].marketRelevance = "Sample enterprise review requirement";
    s.selected = ["sso", "audit"];
    return s;
  }

  const api = { criteria, blankIdea, blank, sample };
  if (typeof module !== "undefined") module.exports = api;
  else root.DecisionData = api;
})(typeof window !== "undefined" ? window : globalThis);
