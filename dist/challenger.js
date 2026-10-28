(function (root) {
  "use strict";
  function fingerprint(idea, s) {
    const { challengeReviews, decision, notes, ...inputs } = idea;
    const text = JSON.stringify({
      inputs,
      context: s.context,
      competitors: s.competitors,
      weights: s.weights,
    });
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++)
      hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
    return (hash >>> 0).toString(16);
  }
  function build(idea, s, a) {
    const list = [],
      segment = idea.user || s.context.segment || "the target customer";
    const add = (id, priority, question, why, gap, validation) =>
      list.push({
        id,
        priority,
        question,
        why,
        gap,
        validation,
        fingerprint: fingerprint(idea, s),
      });
    if (idea.contradiction)
      add(
        "contradiction",
        1,
        "Which customer signals should drive this decision?",
        "Conflicting signals can reflect different segments or use cases.",
        idea.evidence || "Contradictory evidence is marked.",
        "Separate the conflicting observations by segment and test the buying or usage condition.",
      );
    if (idea.strength !== "strong" || !idea.evidence.trim())
      add(
        "demand",
        1,
        `What behaviour shows ${segment} needs ${idea.name || "this opportunity"}?`,
        "Stated interest is weaker than observed behaviour or a concrete commitment.",
        idea.signals || "No behavioural signal supplied.",
        `Observe ${segment} completing the relevant task or test a measurable commitment before investing.`,
      );
    if (!s.context.segment.trim())
      add(
        "segment",
        1,
        "Which customer segment is this decision for?",
        "A requirement in one segment may be irrelevant to another.",
        "Target segment is not recorded.",
        "Name the buyer, end user and segment, then map evidence to each.",
      );
    if (idea.assumptions.trim())
      add(
        "assumption",
        2,
        "Which assumption could overturn this recommendation?",
        "An attractive opportunity may depend on a single untested condition.",
        idea.assumptions,
        "Test the highest-consequence assumption with a falsifiable success criterion.",
      );
    if (a.comp.known < 2)
      add(
        "competition",
        2,
        "Is the competitive comparison complete enough?",
        "Unknown capabilities cannot establish a market gap.",
        `${a.comp.known} known relevant competitor entries. ${a.comp.unknown} unknown entries.`,
        "Review comparable capabilities and capture dated supporting notes; never infer absence from silence.",
      );
    if (a.comp.tags.includes("Table stakes / competitive parity"))
      add(
        "necessity",
        2,
        "Is this a real buying or renewal condition?",
        "Competitive parity is not the same as customer necessity.",
        `The required expectation is user-entered for ${s.context.segment || "an unspecified segment"}.`,
        "Validate the exact procurement or renewal condition and identify other blockers.",
      );
    if (idea.blocked || idea.dependencies.length || idea.risks.trim())
      add(
        "delivery",
        2,
        "What delivery risk could change the investment case?",
        "Scope and dependency uncertainty can delay value.",
        [
          idea.risks,
          idea.dependencies
            .map((id) => s.ideas.find((i) => i.id === id)?.name || id)
            .join(", "),
          idea.blocked ? "Unresolved blocker marked" : "",
        ]
          .filter(Boolean)
          .join(" · "),
        "Review estimates and dependencies with engineering; test the riskiest integration before committing.",
      );
    if (idea.alternative === "available")
      add(
        "alternative",
        3,
        "Would buying or partnering deliver the outcome sooner?",
        "Internal development carries maintenance and opportunity costs.",
        "A viable external option is marked; total cost and fit remain unverified.",
        "Compare security, integration effort, lock-in and ongoing cost against a scoped internal approach.",
      );
    add(
      "strategy",
      3,
      "How will we know this supports the business objectives?",
      "A strategic-fit rating is judgment, not evidence.",
      `${s.context.objectives || "No business objective supplied."} ${s.context.priorities || ""}`,
      "Define an outcome metric, review horizon and the result that would invalidate the business case.",
    );
    add(
      "opportunity-cost",
      4,
      "What do we give up, and what if we do nothing?",
      "The next investment displaces another use of capacity.",
      `Other opportunities: ${
        s.ideas
          .filter((i) => i.id !== idea.id)
          .map((i) => i.name || "Untitled")
          .join(", ") || "none entered"
      }.`,
      "Compare the consequences of delay, a smaller intervention and doing nothing.",
    );
    return list.sort((a, b) => a.priority - b.priority).slice(0, 6);
  }
  const api = { build, fingerprint };
  if (typeof module !== "undefined") module.exports = api;
  else root.DecisionChallenger = api;
})(typeof window !== "undefined" ? window : globalThis);
