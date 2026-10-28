(function (root) {
  "use strict";
  const D =
    typeof module !== "undefined" ? require("./data.js") : root.DecisionData;
  const C =
    typeof module !== "undefined"
      ? require("./competition.js")
      : root.CompetitiveAnalysis;
  const H =
    typeof module !== "undefined"
      ? require("./challenger.js")
      : root.DecisionChallenger;
  const R =
    typeof module !== "undefined"
      ? require("./report.js")
      : root.DecisionReport;
  const { criteria, blankIdea, blank, sample } = D;
  const { competition } = C;
  function restore(saved) {
    if (!saved || saved.schema !== 2 || !Array.isArray(saved.ideas))
      return saved;
    const s = JSON.parse(JSON.stringify(saved));
    s.context = { ...blank().context, ...s.context };
    s.ideas = s.ideas.map((i) => ({
      ...blankIdea(i.id),
      ...i,
      challengeReviews: i.challengeReviews || {},
    }));
    s.competitors = (s.competitors || []).map((c) => ({
      segment: "",
      differences: "",
      relevant: true,
      ...c,
    }));
    return s;
  }
  function validate(s) {
    const errors = [];
    if (!s || s.schema !== 2) return ["Unsupported workspace format"];
    if (!Array.isArray(s.ideas) || s.ideas.length < 1 || s.ideas.length > 3)
      return ["Use one to three ideas"];
    if (
      !s.context ||
      !s.weights ||
      !Array.isArray(s.competitors) ||
      s.competitors.length > 10
    )
      return ["Invalid workspace structure"];
    if (
      !["single", "compare"].includes(s.mode) ||
      typeof s.sample !== "boolean" ||
      !Array.isArray(s.selected) ||
      !Array.isArray(s.snapshots) ||
      s.snapshots.length > 10
    )
      return ["Invalid workspace state"];
    for (const k of Object.keys(blank().context))
      if (typeof s.context[k] !== "string" || s.context[k].length > 10000)
        return ["Invalid product context"];
    for (const i of s.ideas) {
      if (
        !i ||
        typeof i.id !== "string" ||
        ["__proto__", "constructor", "prototype"].includes(i.id) ||
        !/^[a-zA-Z0-9_-]{1,80}$/.test(i.id)
      )
        return ["Invalid idea ID"];
      for (const k of [
        "name",
        "problem",
        "solution",
        "user",
        "outcome",
        "business",
        "evidence",
        "signals",
        "assumptions",
        "unknowns",
        "notes",
        "decision",
        "risks",
        "timeToValue",
        "strategicRelevance",
        "marketRelevance",
      ])
        if (typeof i[k] !== "string") return ["Invalid idea text"];
      if (
        !i.challengeReviews ||
        typeof i.challengeReviews !== "object" ||
        Array.isArray(i.challengeReviews)
      )
        return ["Invalid challenge reviews"];
      for (const review of Object.values(i.challengeReviews))
        if (
          !review ||
          typeof review.reviewed !== "boolean" ||
          typeof review.response !== "string" ||
          review.response.length > 10000 ||
          typeof review.fingerprint !== "string"
        )
          return ["Invalid challenge review"];
      for (const k of ["contradiction", "blocked", "rejected"])
        if (typeof i[k] !== "boolean") return ["Invalid idea flag"];
      for (const [k, values] of Object.entries({
        strength: ["unknown", "weak", "strong"],
        expectation: ["unknown", "required", "optional", "emerging"],
        unique: ["unknown", "yes", "no"],
        alternative: ["unknown", "available", "unavailable"],
        evidenceType: ["user", "fictional"],
      }))
        if (!values.includes(i[k])) return ["Invalid idea category"];
    }
    for (const c of s.competitors) {
      if (
        !c ||
        typeof c.name !== "string" ||
        typeof c.source !== "string" ||
        typeof c.position !== "string" ||
        typeof c.date !== "string" ||
        !["user", "fictional", "verified"].includes(c.status) ||
        !c.capabilities ||
        typeof c.capabilities !== "object" ||
        Object.values(c.capabilities).some(
          (v) => !["yes", "no", "partial", "unknown"].includes(v),
        )
      )
        return ["Invalid competitor profile"];
    }
    if (
      s.snapshots.some(
        (x) =>
          !x ||
          typeof x.names !== "string" ||
          typeof x.date !== "string" ||
          !Number.isFinite(x.capacity),
      )
    )
      return ["Invalid scenario snapshot"];
    const ids = s.ideas.map((i) => i.id);
    if (s.selected.some((id) => !ids.includes(id)))
      return ["Invalid selected idea"];
    if (new Set(ids).size !== ids.length)
      errors.push("Idea IDs must be unique");
    if (!Number.isFinite(s.capacity) || s.capacity < 0 || s.capacity > 1000)
      errors.push("Capacity must be between 0 and 1000");
    for (const k of Object.keys(criteria))
      if (
        !Number.isFinite(s.weights[k]) ||
        s.weights[k] < 0 ||
        s.weights[k] > 100
      )
        errors.push("Weights must be 0–100");
    for (const i of s.ideas) {
      if (!i.ratings || !Array.isArray(i.dependencies))
        return ["Invalid idea structure"];
      for (const k of Object.keys(criteria))
        if (
          i.ratings[k] !== null &&
          (!Number.isInteger(i.ratings[k]) ||
            i.ratings[k] < 1 ||
            i.ratings[k] > 5)
        )
          errors.push("Ratings must be unknown or 1–5");
      for (const k of ["effort", "portfolioValue"])
        if (
          i[k] !== null &&
          (!Number.isFinite(i[k]) || i[k] < 0 || i[k] > 1000)
        )
          errors.push("Effort and value must be 0–1000 or unknown");
      if (i.dependencies.some((id) => !ids.includes(id) || id === i.id))
        errors.push("Dependencies must reference another current idea");
      for (const v of Object.values(i))
        if (typeof v === "string" && v.length > 10000)
          errors.push("Text must be at most 10000 characters");
    }
    return errors;
  }
  function assess(idea, s) {
    const active = Object.keys(criteria).filter((k) => s.weights[k] > 0);
    const rated = active.filter((k) => idea.ratings[k] !== null);
    const total = active.reduce((n, k) => n + s.weights[k], 0);
    const covered = rated.reduce((n, k) => n + s.weights[k], 0);
    const weighted = covered
      ? (rated.reduce((n, k) => n + (idea.ratings[k] / 5) * s.weights[k], 0) /
          covered) *
        100
      : null;
    const complete = total > 0 && covered === total;
    const comp = competition(idea, s);
    const gaps = [];
    if (!idea.name.trim()) gaps.push("Idea name");
    if (!idea.problem.trim()) gaps.push("Customer problem");
    if (!idea.evidence.trim()) gaps.push("Supporting evidence");
    if (!s.context.segment.trim()) gaps.push("Target segment");
    if (!s.context.objectives.trim()) gaps.push("Strategic objectives");
    if (!complete)
      gaps.push(
        total === 0
          ? "Active decision criteria"
          : "Ratings for active criteria",
      );
    if (idea.effort === null) gaps.push("Engineering effort");
    if (comp.unknown || !comp.known) gaps.push("Competitor capabilities");
    let action = "Validate First",
      reason = "Evidence or decision inputs need validation before committing.";
    if (idea.rejected) {
      action = "Do Not Pursue";
      reason = "You explicitly marked the customer problem invalidated.";
    } else if (idea.contradiction) {
      reason =
        "The entered customer evidence conflicts; resolve it before investing.";
    } else if (
      !gaps.some((g) =>
        [
          "Idea name",
          "Customer problem",
          "Supporting evidence",
          "Target segment",
          "Strategic objectives",
          "Active decision criteria",
          "Ratings for active criteria",
          "Engineering effort",
        ].includes(g),
      ) &&
      idea.strength === "strong"
    ) {
      if (idea.ratings.problem <= 2 && idea.ratings.strategy <= 2) {
        action = "Do Not Pursue";
        reason =
          "Strong entered evidence accompanies low problem significance and low strategic fit.";
      } else if (idea.blocked || idea.ratings.strategy <= 2) {
        action = "Defer";
        reason = idea.blocked
          ? "An unresolved implementation blocker is marked."
          : "This opportunity is weakly aligned with current strategic objectives.";
      } else if (
        idea.alternative === "available" &&
        comp.tags.includes("Table stakes / competitive parity") &&
        idea.unique === "no"
      ) {
        action = "Buy/Partner";
        reason =
          "A required parity capability has an entered viable external option and no claimed unique outcome. Validate security, fit and total cost.";
      } else if (comp.known < 2) {
        reason =
          "Competitive coverage is too limited for a build commitment; validate the landscape first.";
      } else if (
        weighted >= 70 &&
        idea.ratings.problem >= 3 &&
        idea.ratings.strategy >= 3 &&
        idea.ratings.feasibility >= 3
      ) {
        action = "Build Now";
        reason =
          "Strong supplied evidence, complete ratings, strategic fit and feasibility meet the stated build gates.";
      } else if (weighted < 45) {
        action = "Defer";
        reason =
          "The complete weighted assessment is below 45/100; revisit priorities or evidence.";
      }
    }
    const challenges = [];
    if (idea.assumptions.trim())
      challenges.push(`Assumption to test: ${idea.assumptions}`);
    if (idea.strength !== "strong" || !idea.evidence.trim())
      challenges.push(
        `Demand for ${idea.name || "this idea"} is ${idea.strength}; run a behaviour-based test with ${idea.user || s.context.segment || "the target user"} before treating stated interest as demand.`,
      );
    if (idea.contradiction)
      challenges.push(
        "Contradictory customer evidence is marked. Segment the conflicting signals and establish which applies to the target audience.",
      );
    if (comp.known < 2)
      challenges.push(
        "Competitive coverage is incomplete. Unknown capability entries are not evidence of absence.",
      );
    if (comp.tags.includes("Table stakes / competitive parity"))
      challenges.push(
        "Required expectations are user-entered. Confirm whether this is an actual buying or renewal condition.",
      );
    if (idea.blocked || idea.dependencies.length)
      challenges.push(
        `Confirm delivery dependencies${idea.dependencies.length ? ": " + idea.dependencies.map((id) => s.ideas.find((i) => i.id === id)?.name || id).join(", ") : " and the marked blocker"}.`,
      );
    if (idea.alternative === "available")
      challenges.push(
        "Compare the entered external option against building: integration effort, security, lock-in and ongoing cost.",
      );
    if (s.context.objectives.trim())
      challenges.push(
        `Strategic judgment: does the expected outcome measurably support “${s.context.objectives}”? The rating is your input, not inferred proof.`,
      );
    challenges.push(
      "Opportunity cost: what must be deferred to fund this, and what happens if you do nothing?",
    );
    const change = `Reassess ${action} if customer evidence changes, the ${s.context.segment || "target segment"} requirement is disproved, competitor entries change, or feasibility and strategic-fit ratings change.`;
    return {
      id: idea.id,
      action,
      reason,
      score: complete ? Math.round(weighted) : null,
      partialScore: weighted === null ? null : Math.round(weighted),
      coverage: total ? Math.round((covered / total) * 100) : 0,
      complete,
      comp,
      gaps,
      challenges,
      challengeDetails: H.build(idea, s, { comp, action }),
      change,
      confidence: idea.contradiction
        ? "Conflicting"
        : idea.strength === "strong" && idea.evidence.trim()
          ? "Strong (self-rated)"
          : idea.strength === "weak"
            ? "Weak"
            : "Unknown",
      counterargument:
        action === "Build Now"
          ? "High self-rated scores may conceal optimistic effort estimates or untested demand."
          : action === "Do Not Pursue"
            ? "The problem may still matter to a different segment; do not generalise beyond the supplied evidence."
            : "Delaying may leave a genuine customer need unmet. Validate the most consequential uncertainty first.",
    };
  }
  function prioritise(idea, s) {
    const a = assess(idea, s);
    const confidence = idea.contradiction
      ? 0
      : idea.strength === "strong" && idea.evidence.trim()
        ? 0.8
        : idea.strength === "weak" && idea.evidence.trim()
          ? 0.4
          : null;
    return {
      attractiveness: a.score,
      confidence,
      efficiency:
        a.score !== null && confidence !== null && idea.effort > 0
          ? Math.round(((a.score * confidence) / idea.effort) * 10) / 10
          : null,
    };
  }
  function insights(s) {
    const results = s.ideas.map((i) => ({
      i,
      a: assess(i, s),
      p: prioritise(i, s),
    }));
    const result = [];
    const tied = (items, value) => {
      const known = items.filter((x) => value(x) !== null);
      if (!known.length) return [];
      const max = Math.max(...known.map(value));
      return known.filter((x) => value(x) === max);
    };
    const strong = tied(
      results.filter(
        (x) =>
          x.i.strength === "strong" &&
          !x.i.contradiction &&
          x.i.evidence.trim(),
      ),
      (x) => x.a.score,
    );
    if (strong.length)
      result.push({
        title: "Strongest evidence-supported attractiveness",
        text:
          strong.map((x) => x.i.name || "Untitled").join(" / ") +
          " — based on your complete ratings and self-rated evidence, not a validated outcome.",
      });
    const parity = results.filter((x) =>
      x.a.comp.tags.includes("Table stakes / competitive parity"),
    );
    if (parity.length)
      result.push({
        title: "Potential enterprise requirements",
        text:
          parity.map((x) => x.i.name).join(" / ") +
          " — customer necessity still requires validation.",
      });
    const diff = results.filter((x) =>
      x.a.comp.tags.includes("Potential differentiation"),
    );
    result.push({
      title: "Differentiation potential",
      text: diff.length
        ? diff.map((x) => x.i.name).join(" / ")
        : "No differentiation claim is sufficiently supported by the entered capability matrix.",
    });
    const uncertain = tied(
      results,
      (x) =>
        x.a.gaps.length +
        (x.i.strength === "strong" ? 0 : 2) +
        (x.i.contradiction ? 4 : 0),
    );
    if (uncertain.length)
      result.push({
        title: "Most uncertain investment",
        text:
          uncertain.map((x) => x.i.name || "Untitled").join(" / ") +
          " — prioritise evidence gaps before committing.",
      });
    const near = results.filter(
      (x) =>
        !x.i.blocked &&
        !x.i.rejected &&
        x.i.effort !== null &&
        x.i.ratings.feasibility >= 3,
    );
    if (near.length) {
      const min = Math.min(...near.map((x) => x.i.effort));
      result.push({
        title: "Lower-effort delivery option",
        text:
          near
            .filter((x) => x.i.effort === min)
            .map((x) => x.i.name)
            .join(" / ") +
          ` — ${min} estimated points; time to value is recorded separately.`,
      });
    }
    return result;
  }
  function evaluate(s) {
    const errors = validate(s);
    if (errors.length) throw new Error(errors.join("; "));
    const assessments = s.ideas.map((i) => assess(i, s));
    const builds = assessments.filter((a) => a.action === "Build Now");
    return {
      assessments,
      summary: builds.length
        ? `${builds.length} ${builds.length === 1 ? "opportunity meets" : "opportunities meet"} the build gates. Review trade-offs; no automatic winner is selected.`
        : "No idea currently meets the Build Now gates. Validation, alternatives or deferral may be the justified next step.",
    };
  }
  function portfolio(s) {
    const eligible = s.ideas.filter(
      (i) =>
        i.effort !== null &&
        i.portfolioValue !== null &&
        !i.blocked &&
        !i.rejected,
    );
    let best = { ids: [], value: 0, effort: 0 };
    for (let mask = 1; mask < 1 << eligible.length; mask++) {
      const chosen = eligible.filter((i, n) => mask & (1 << n)),
        ids = chosen.map((i) => i.id);
      if (chosen.some((i) => i.dependencies.some((id) => !ids.includes(id))))
        continue;
      const effort = chosen.reduce((n, i) => n + i.effort, 0),
        value = chosen.reduce((n, i) => n + i.portfolioValue, 0);
      if (
        effort <= s.capacity &&
        (value > best.value || (value === best.value && effort < best.effort))
      )
        best = { ids, value, effort };
    }
    return best;
  }
  function report(s) {
    return R.report(s, api);
  }
  const api = {
    criteria,
    blankIdea,
    restore,
    blank,
    sample,
    validate,
    competition,
    assess,
    evaluate,
    portfolio,
    prioritise,
    insights,
    report,
  };
  if (typeof module !== "undefined") module.exports = api;
  else root.OpportunityEngine = api;
})(typeof window !== "undefined" ? window : globalThis);
