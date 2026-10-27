# Product Decision Lab

**Turn competing feature requests into a decision you can explain.**

Product Decision Lab is an interactive prototype for product managers exploring what to build next when customer requests, business priorities and engineering capacity compete. It makes the evidence, assumptions and trade-offs behind a roadmap choice visible in one workspace.

[Try the live prototype →](https://aish081.github.io/product-decision-lab/dist/?v=2) — no sign-up or local setup required.

## What could you use it for?

| Situation | How the prototype helps |
| --- | --- |
| Preparing for a roadmap prioritisation meeting | Compare candidate features using impact, strategic alignment, evidence confidence and effort. Inspect the sample evidence behind each request. |
| Responding to a capacity cut | Reduce available engineering points, see whether your plan still fits, and explore a feasible alternative. |
| Challenging a popular feature request | Surface the assumption behind the feature and a concrete question to validate before committing. |
| Discussing a change in strategy | Switch between enterprise growth, engagement and innovation to see how the priority scores change. |
| Explaining a product decision to stakeholders | Generate a Markdown brief with your selection, supporting evidence, assumptions, capacity constraints and next steps. |
| Teaching or practising product trade-offs | Use the fictional scenario in a PM workshop, interview discussion or personal learning exercise. |

**Today, these workflows run on a fixed fictional dataset.** You can change selections, capacity and strategic lens, but cannot yet import your own backlog or customer evidence. It is a sandbox for exploring the decision workflow, rather than a system for managing a real team's roadmap.

## Who is it for?

- **Product managers and product owners** who want to make prioritisation discussions more explicit and explainable.
- **Founders and small product teams** exploring how to balance feature ambition with limited delivery capacity.
- **Aspiring PMs, workshop facilitators and interview candidates** looking for a concrete way to discuss evidence, uncertainty and trade-offs.

## Example: what should Northstar build next?

You are the PM for **Northstar**, a fictional B2B collaboration platform. Your initial goal is to grow enterprise adoption. Five features compete for a 12-point engineering budget:

| Candidate | Effort | Illustrative impact | Evidence confidence |
| --- | ---: | ---: | ---: |
| Enterprise SSO | 6 | 9/10 | 85% |
| AI Insights | 9 | 8/10 | 45% |
| Analytics Dashboard | 4 | 7/10 | 75% |
| Mobile Experience | 7 | 5/10 | 55% |
| Public API | 5 | 6/10 | 65% |

SSO and Analytics Dashboard together require **10 points**, so they fit the initial budget. Now reduce capacity to **8 points**. That selection no longer fits, and the simulator offers the highest-scoring feasible combination under its formula.

The calculation is only part of the discussion. The challenger asks whether SSO really unlocks a purchase, and whether better reporting will improve retention. Those questions help identify what needs validation before a commitment. The decision brief captures the resulting reasoning for review.

**The useful outcome:** a clearer conversation about what to build, what to defer, and what evidence could change the decision.

## Try the five-minute walkthrough

1. **Explore the workspace.** Start with Enterprise SSO and Analytics Dashboard selected. Check the capacity, impact and confidence cards.
2. **Inspect the evidence.** Open a feature's customer signals to see its fictional evidence and underlying assumption.
3. **Challenge the selection.** Open Decision challenger and review the validation questions.
4. **Test a constraint.** In What-if simulator, reduce capacity from 12 to 8. Compare your selection with the calculated alternative.
5. **Explore a different strategy.** Change the strategic lens and watch the scores update. Save scenario snapshots to keep a comparison.
6. **Explain the decision.** Generate a decision brief, then copy or download it as Markdown.

## What works today?

- Five interactive views: overview, prioritisation, decision challenger, what-if simulator and decision brief.
- Transparent priority scores and capacity checks.
- A priority chart that responds to feature selection and strategic lens.
- An exhaustive comparison of feature combinations to find the highest-scoring feasible portfolio under the current formula.
- Inspectable synthetic evidence and a rule-based assumption challenger.
- Browser-local persistence, up to ten scenario snapshots, and Markdown brief export.

## How are decisions calculated?

Priority score = `(60% impact + 40% strategic alignment) × confidence ÷ effort × 100`.

Confidence is expressed as a fraction in this calculation. Strategic alignment changes with the selected lens. The simulator maximises the sum of the rounded feature priority scores while keeping total effort within capacity.

These are illustrative inputs and explicit modelling choices, not validated business forecasts. The highest-scoring combination is an option to review; the product manager owns the final decision.

## Where does AI fit?

This project was built through **AI-assisted prototyping and vibe coding**. The current app does **not** call an AI model. Its challenger uses predefined questions tied to the selected features and capacity constraints; its brief combines sample evidence with calculated results.

A future version could interpret user-provided evidence, identify unsupported claims and generate tailored challenges with source citations. That would require a server-side model integration and evaluations for groundedness and usefulness. Those capabilities are not implemented yet.

## Scope, data and limitations

This is a personal working prototype, not a commercial product. All product, customer and evidence data is fictional. It has no accounts, shared workspaces, backlog imports or Jira/Slack integrations.

The model does not account for dependencies, feature interactions, uncertain effort estimates, revenue or ongoing operating costs. Impact is an illustrative additive score. The confidence percentages are sample inputs, not calibrated probabilities.

Selections and scenario snapshots stay in browser localStorage. They are not synced across devices. Reset demo restores the initial selection and clears saved scenarios. No customer data is uploaded. Google Fonts requests fonts from Google; system fonts remain available offline.

## Run locally

Requires Node.js for the test command and Python 3 for the preview server. No package installation, API keys or build step is needed.

```sh
git clone https://github.com/Aish081/product-decision-lab.git
cd product-decision-lab
npm run dev
```

Open http://localhost:4173 and **keep the terminal running**. The localhost address stops working when the server stops; use the [public demo](https://aish081.github.io/product-decision-lab/dist/?v=2) for an always-hosted version.

Run the decision-engine tests with:

```sh
npm test
```

## Architecture

- `dist/index.html`, `dist/style.css`: responsive application shell and visual design.
- `dist/engine.js`: sample evidence, scoring and portfolio optimisation, reusable in Node tests.
- `dist/app.js`: application views, priority chart, browser persistence, evidence dialogs and Markdown export.
- `tests/engine.test.cjs`: capacity-conflict and portfolio-optimisation checks.
- `index.html`: entry point for GitHub Pages.

## What could come next?

1. Validate the workflow with product managers and improve it based on observed use.
2. Let users bring their own feature candidates and evidence, with clear data-handling controls.
3. Add live AI challenges grounded in source evidence, supported by a labelled evaluation dataset.
4. Model dependencies and uncertainty, and make scoring weights configurable.

These are potential directions, not current features or committed delivery dates.
