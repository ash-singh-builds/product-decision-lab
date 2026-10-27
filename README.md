# Product Decision Lab

A working, AI-assisted prototype for product managers to compare feature priorities, inspect evidence, challenge assumptions and explore capacity trade-offs.

## Live demo

Open [Product Decision Lab](https://aish081.github.io/product-decision-lab/). No local setup required.

## Run locally

Run `npm run dev` and open http://localhost:4173. Keep that terminal running while you use the local preview. If it is stopped, the localhost URL will not open; use the live demo above instead. No dependencies, API keys or build step required. Run `npm test` for decision-engine checks.

## Try the walkthrough

1. Inspect the synthetic evidence behind Enterprise SSO and Analytics Dashboard.
2. Open Decision challenger to review assumptions and validation questions.
3. In What-if simulator, reduce capacity from 12 to 8 points. The selected 10-point plan exceeds capacity.
4. Apply the highest-scoring feasible combination or change the strategic lens.
5. Save scenario snapshots, then generate and download a Markdown decision brief.

## Scope and limitations

This is a personal prototype, not a commercial product. All product, customer and evidence data is fictional. The challenger is a transparent rule-based demo, **not live AI inference**. Priority scores and capacity checks are deterministic. The optimizer exhaustively checks all feature combinations; it does not model dependencies, interactions, delivery uncertainty or economic returns. Impact is an illustrative additive score.

Selections and up to ten scenario snapshots stay in browser localStorage. Reset demo clears that local state. No customer data is uploaded. The optional Google Fonts stylesheet sends the usual font request to Google; system fonts remain available offline.

## Architecture

- `dist/index.html`, `dist/style.css`: responsive, accessible application shell.
- `dist/engine.js`: sample evidence, scoring and portfolio optimization, reusable in Node tests.
- `dist/app.js`: five application views, browser persistence, evidence dialogs and Markdown export.
- `tests/engine.test.cjs`: capacity and optimization checks.

## Next steps

Add a server-side model integration with structured outputs and evidence citations; evaluate groundedness and missing-evidence detection against a small labelled dataset. Add user-provided evidence only with a clear data-handling model. Validate the prototype with PMs before expanding scope.
