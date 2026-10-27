# Product Decision Lab · V2

**One idea or three. Is it worth building?**

An independent, non-commercial **interactive decision-support prototype** for product managers. V2 evaluates one opportunity or compares two or three against customer evidence, manually supplied competitor capabilities, strategic objectives and delivery constraints.

**Demo Mode only:** deterministic analysis, synthetic example data, no LLM inference, no live research, no backend, no API keys. Built through AI-assisted development; its outputs are not AI-generated intelligence. No participant adoption, productivity gains or validated business outcomes are claimed.

## Status and access

V2 is on `feature/opportunity-evaluator-v2`, under `dist/v2/`. It is not merged or published to the production Pages branch. The [existing V1 demo](https://ash-singh-builds.github.io/product-decision-lab/dist/?v=4) remains unchanged. After an explicitly approved merge, the additive V2 path can be served at `/product-decision-lab/dist/v2/` without removing V1.

## What is it useful for?

- Challenge whether an idea deserves investment before adding it to a roadmap.
- Distinguish customer necessity from competitor imitation, potential differentiation and strategic enablement.
- Compare investment alternatives without forcing a winner or treating the highest score as a commitment.
- Identify evidence gaps, assumptions, contradictions and next validation steps.
- Record an independent PM decision and export an Opportunity Assessment for discussion.

This is a sandbox, not an independently verified market-research service or a financial forecasting tool.

## Primary journeys

1. **Evaluate one idea:** choose the single-idea mode, enter product context and whatever evidence is available, add manual competitor profiles, then review the assessment and challenger. Missing inputs remain unknown.
2. **Compare 2–3 ideas:** enter or duplicate ideas, compare customer demand, strategic fit, business value and feasibility, edit weights, and inspect differences.
3. **Try Northstar Cloud:** load the fictional sample. SSO may justify buying/partnering, uncertain AI insights need validation, and audit logging may meet the build gates. Innovation is not automatically the best investment.
4. **Decide and explain:** record your own final decision/rationale, optionally explore capacity, then copy or download the Markdown report.

## Working features

- Editable product context, objectives, one to three ideas, evidence, customer signals, assumptions and unknowns.
- Add/duplicate/remove ideas and add/remove up to ten competitor or substitute profiles.
- Manual capability matrix with Offers / Partial / User reports absent / Unknown, source notes, dates and provenance.
- Contextual classification: table stakes/parity, potential differentiation, emerging opportunity, strategic enabler or insufficient validation. Classifications may overlap.
- Five recommendations: Build Now, Validate First, Defer, Buy/Partner, Do Not Pursue; no automatic winner.
- Rule-based Decision Challenger, counterarguments, missing information and what would change the recommendation.
- PM override and rationale; Markdown assessment copy/download.
- Separate optional capacity stage using additive entered values and supported dependencies.
- Browser-local V2 persistence, ten immutable scenario snapshots, reset and clear. V1 storage is untouched.
- Responsive layout, labelled form fields, semantic tables, keyboard navigation, visible focus and destructive-state confirmation dialogs.

## Transparent evaluation rules

Ratings are entered by the PM: 1 = low, 3 = moderate, 5 = high. Feasibility 5 means easier delivery. No scores are inferred from keywords or prose.

`score = Σ(rating / 5 × weight) / Σ(active weights) × 100`

Weights range from 0 to 100 and normalise automatically. Zero excludes a criterion. Missing ratings are excluded from the provisional score, with weighted coverage shown; the final score stays incomplete until every active criterion is rated. These are comparative judgments, not probabilities or projected returns.

Recommendation order:

1. Explicitly invalidated customer problem → **Do Not Pursue**.
2. Contradictory evidence or missing required decision inputs → **Validate First**.
3. With strong self-rated evidence and complete inputs: low problem and strategy (both ≤2) → **Do Not Pursue**; blocker or strategy ≤2 → **Defer**.
4. Required parity capability, viable entered external option and no unique outcome → **Buy/Partner**.
5. Fewer than two known competitor capability entries → **Validate First** before a build commitment.
6. Score ≥70, problem/strategy/feasibility each ≥3 → **Build Now**. Score <45 → **Defer**. Otherwise → **Validate First**.

A Build Now gate also requires a named idea, problem, evidence text, target segment, objectives and effort estimate. Evidence strength and expectations are user judgments, not machine-verified facts. A high score alone cannot override uncertainty gates.

Table stakes requires both a user-entered required customer expectation and at least two known competitor entries, with at least half fully offering the capability. Adoption alone is not necessity. Potential differentiation requires a claimed unique outcome and at least two known entries with none fully offering it. Marketing silence and unknown entries never establish absence. All classifications are hypotheses to validate.

### Portfolio stage

V2 enumerates all portfolios (at most eight) and maximises **total entered additive value** subject to capacity and selected dependencies. It excludes unknown effort/value, blocked ideas and invalidated problems. It does not sum value-per-effort ratios. Estimates assume no overlap or synergy and are not economic returns. This capacity suggestion is separate from the investment recommendation.

V1 remains preserved, including its legacy scoring/optimiser; use V2 for the corrected portfolio model.

## Research, provenance and security

No competitor or customer data is fetched. Manual references are displayed as text with source dates; no retrieval date or verification is invented. All Northstar Cloud customer inputs and the Orbit Suite / Beacon Workspace profiles are fictional. User-provided text remains unverified even if it includes a URL. Evidence, assumptions, unknowns and rule interpretations are separated in the report.

Input is escaped before HTML rendering, validated on restoration, and never executed as instructions. Browser-local data is not encrypted; avoid sensitive information on shared devices. There are no model credentials, inference costs, analytics or application network calls. No environment variables are required.

## Local development

Requires Node.js 22+ and Python 3. Runtime uses browser-native JavaScript; dependencies are development-only.

```sh
git clone https://github.com/ash-singh-builds/product-decision-lab.git
cd product-decision-lab
git switch feature/opportunity-evaluator-v2
npm ci
npm test
npm run check
npm run dev:v2
```

Open **http://localhost:4173/v2/** while the terminal runs. V1 is at http://localhost:4173/. No production build is needed. `npm run check` verifies JavaScript syntax and static asset paths.

## Architecture

- `dist/v2/engine.js`: pure synchronous interfaces: `validate`, `assess`, `competition`, `evaluate`, `portfolio`, `report`, plus blank/sample state factories. Works in the browser and Node tests.
- `dist/v2/app.js`: view functions, form binding, browser persistence and export. The UI consumes the engine result shape; a future provider can implement an equivalent assessment contract separately, without changing deterministic arithmetic. No provider integration is built now.
- `dist/v2/style.css`, `index.html`: self-contained responsive shell, no external fonts or runtime dependencies.
- `tests/opportunity.test.cjs`: deterministic evaluation fixtures and safety/uncertainty checks.
- `tests/opportunity-ui.test.cjs`: jsdom application workflows. These are DOM integration tests, not a substitute for real-browser layout checks.
- `tests/engine.test.cjs`: preserved V1 regressions.
- `scripts/check.cjs`: static production validation.

## Verification and demonstration

See [verification record](docs/V2-VERIFICATION.md), [90-second walkthrough](docs/V2-DEMO.md), and [evaluation design](docs/V2-EVALUATIONS.md). CI runs the tests and static check on pushes and pull requests; it does not deploy.

## Known limitations and next improvements

- Rules support exploration; they do not understand prose or verify evidence quality. Changing prose changes report/challenger context, while numeric outcomes require explicit rating/evidence-status/competitor edits.
- No live research, LLM, PDF export, multi-user collaboration or cross-device sync in this iteration.
- Five editable quantitative criteria are complemented by qualitative competition, uncertainty, risk, opportunity-cost and alternatives sections; the latter are not fabricated numeric dimensions.
- Criterion gates and competitive thresholds are prototype design choices, not empirically calibrated science.
- Next: usability testing with actual PMs, domain-specific evidence rubrics, optional configurable gates, richer scenario comparisons. Any future live provider should preserve provenance, uncertainty and human control; it is outside V2 scope.
