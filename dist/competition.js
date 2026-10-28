(function (root) {
  "use strict";
  function competition(idea, s) {
    const rows = s.competitors
      .filter((c) => c.relevant !== false)
      .map((c) => ({
        name: c.name,
        status:
          c.capabilities?.[idea.id] === "no" &&
          !(
            c.status === "fictional" ||
            (c.status === "verified" && c.source.trim())
          )
            ? "unknown"
            : c.capabilities?.[idea.id] || "unknown",
        segment: c.segment || "Not specified",
        position: c.position,
        differences: c.differences || "Not recorded",
        source: c.source || "No source supplied",
        provenance: c.status || "user",
        date: c.date || "Unknown",
      }));
    const known = rows.filter((r) => r.status !== "unknown");
    const yes = known.filter((r) => r.status === "yes").length;
    const coverage = known.length ? yes / known.length : null;
    const tags = [];
    const why = [];
    if (
      idea.expectation === "required" &&
      known.length >= 2 &&
      coverage >= 0.5
    ) {
      tags.push("Table stakes / competitive parity");
      why.push(
        `${yes}/${known.length} known competitor entries offer it and you marked it required for ${s.context.segment || "the target segment"}.`,
      );
    } else if (yes) {
      tags.push("Competitive parity");
      why.push(
        `${yes} entered competitor profile(s) offer it; this alone does not establish customer necessity.`,
      );
    }
    if (idea.unique === "yes" && known.length >= 2 && yes === 0) {
      tags.push("Potential differentiation");
      why.push(
        "You entered a unique customer outcome and no known competitor entry fully offers the capability. This does not prove market absence.",
      );
    }
    if (idea.ratings.strategy >= 4 && s.context.objectives.trim()) {
      tags.push("Strategic enabler");
      why.push(
        `Your strategic-fit rating is ${idea.ratings.strategy}/5 against the entered objectives.`,
      );
    }
    if (idea.expectation === "emerging") {
      tags.push("Emerging opportunity");
      why.push(
        "You marked the segment expectation as emerging; validate timing and demand.",
      );
    }
    if (!tags.length) tags.push("Insufficiently validated");
    if (known.length < 2)
      why.push(
        "Fewer than two known competitor entries: competitive classification remains incomplete.",
      );
    return {
      rows,
      known: known.length,
      unknown: rows.length - known.length,
      coverage,
      tags,
      why,
    };
  }

  const api = { competition };
  if (typeof module !== "undefined") module.exports = api;
  else root.CompetitiveAnalysis = api;
})(typeof window !== "undefined" ? window : globalThis);
