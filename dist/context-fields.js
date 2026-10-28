(function (root) {
  "use strict";
  const catalog = {
    market: [
      "B2B SaaS",
      "B2C software",
      "Financial services",
      "Healthcare",
      "Retail & e-commerce",
      "Manufacturing",
      "Education",
      "Professional services",
      "Government & public services",
      "Media & telecommunications",
      "Energy & utilities",
      "Transportation & logistics",
    ],
    geography: [
      "Global",
      "North America",
      "Europe",
      "United Kingdom & Ireland",
      "Asia-Pacific",
      "Latin America",
      "Middle East & Africa",
    ],
    businessModel: [
      "Subscription",
      "Usage-based",
      "Freemium",
      "One-time purchase / licence",
      "Marketplace / transaction fee",
      "Advertising-supported",
      "Services / consulting",
      "Publicly funded / non-commercial",
    ],
    horizon: [
      "This month",
      "This quarter",
      "Next quarter",
      "6 months",
      "12 months",
      "Longer-term",
    ],
    segment: [
      "SMB",
      "Mid-market",
      "Enterprise",
      "Consumer",
      "Public Sector",
      "Other",
    ],
    priorities: [
      "Enterprise readiness",
      "Customer retention",
      "Revenue growth",
      "Customer acquisition",
      "Product differentiation",
      "Operational efficiency",
      "Customer experience",
      "Security & compliance",
      "Market expansion",
      "Cost reduction",
    ],
  };
  const multiKeys = { segment: "segments", priorities: "priorities" };
  function migrate(context, previous) {
    const ui = { segments: [], priorities: [], customFields: [] };
    for (const [key, prop] of Object.entries(multiKeys)) {
      const old = previous?.[prop];
      ui[prop] =
        Array.isArray(old) &&
        old.every(
          (x) => typeof x === "string" && x.trim() && x.length <= 10000,
        ) &&
        new Set(old).size === old.length &&
        old.join("; ") === context[key]
          ? [...old]
          : context[key]
            ? [context[key]]
            : [];
    }
    ui.customFields = Array.isArray(previous?.customFields)
      ? previous.customFields.filter((k) =>
          ["market", "geography", "businessModel", "horizon"].includes(k),
        )
      : [];
    return ui;
  }
  function selections(state, key) {
    return migrate(state.context, state.contextUI)[multiKeys[key]];
  }
  function setSelections(state, key, values) {
    state.contextUI = migrate(state.context, state.contextUI);
    const clean = [...new Set(values.map((v) => v.trim()).filter(Boolean))];
    if (clean.length > 30 || clean.join("; ").length > 10000)
      throw Error("Keep selections within 30 items and 10,000 characters.");
    state.contextUI[multiKeys[key]] = clean;
    state.context[key] = clean.join("; ");
    return clean;
  }
  const api = { catalog, migrate, selections, setSelections };
  if (typeof module !== "undefined") module.exports = api;
  else root.ContextFields = api;
})(typeof window !== "undefined" ? window : globalThis);
