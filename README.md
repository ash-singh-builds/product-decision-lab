# Product Decision Lab

**One idea or three. Is it worth building?**

From product opportunities to confident investment decisions.

Product Decision Lab is an interactive decision workspace for product managers and product leaders. It connects customer context, competitive positioning, strategic priorities and delivery constraints so investment discussions go beyond a ranked backlog.

## The product problem

A high score cannot tell you whether the customer problem is real, whether a capability is necessary for a particular segment, whether an external solution is better, or which assumption could overturn a decision. Product Decision Lab makes those questions visible alongside transparent calculations and an independent PM decision.

The integrated journey is **Understand → Evaluate → Challenge → Compare → Prioritise → Decide**. Opportunity assessment and investment prioritisation share one workspace, one set of inputs and one report.

## Primary capabilities

- Evaluate one opportunity or compare two or three; start with an illustrative Northstar Cloud scenario.
- Edit product context, business objectives, strategic priorities, customer problems and opportunity definitions.
- Separate evidence, customer signals, assumptions, risks and unknowns. Missing inputs remain unknown.
- Maintain a competitive capability matrix with positioning, segment relevance, source notes, dates and user-attested verification status.
- Assess potential table stakes, parity, differentiation, emerging needs and strategic enablement using explicit contextual rules.
- Review five investment recommendations: Build Now, Validate First, Defer, Buy/Partner and Do Not Pursue. No winner is forced.
- Work through prioritised challenges: question, significance, evidence gap and validation approach. Record responses and reviews; reviews become stale when relevant inputs change.
- Compare opportunity attractiveness, delivery efficiency and portfolio feasibility as distinct concepts.
- Adjust weights, capacity, effort and planning value; respect dependencies and save comparable, immutable scenario snapshots.
- Record an independent final PM decision. Read an executive assessment, copy it or download Markdown.
- Restore browser-local work, migrate compatible earlier opportunity workspaces, reset or clear data with confirmation.

## Who it is for

Product managers, product leaders and cross-functional stakeholders exploring investment choices. The experience can support strategy discussions, prioritisation workshops and demonstrations of product decision-making. It does not claim measured customer adoption, productivity improvements or better real-world investment outcomes.

## Try the journeys

1. **Evaluate an Opportunity:** establish the context, enter what is known, review competitive positioning, inspect the assessment, then challenge the assumptions and record a decision.
2. **Compare Opportunities:** enter two or three ideas, adjust strategic criteria, review differences and uncertainty, then optionally explore delivery scenarios.
3. **Explore an Example:** Northstar Cloud must balance enterprise SSO, AI-powered insights and audit logging. The inputs include fictional customer feedback and competitor profiles; novelty does not automatically win.

See the [90-second walkthrough](docs/DEMO.md) and [verification record](docs/VERIFICATION.md).

## Analysis methodology

All analysis is **deterministic decision support**. No LLM, live research, customer interviews, competitor retrieval or external intelligence service is used. Text is displayed and used in contextual questions, not interpreted into arbitrary numeric scores.

### Opportunity attractiveness

`Σ(rating / 5 × criterion weight) / Σ(active criterion weights) × 100`

Ratings are explicit judgments: 1 low, 3 moderate, 5 high. Feasibility 5 means easier delivery. Weights normalise automatically; zero excludes a criterion. Unknown ratings are omitted from a provisional score and weighted coverage is shown. A complete final score requires every active criterion to be rated.

The five quantitative criteria cover problem significance, customer demand, strategic fit, business value and feasibility. Competition, risks, alternatives, uncertainty, time to value and opportunity cost are represented qualitatively rather than assigned invented numbers.

### Delivery efficiency

`attractiveness × planning confidence / estimated effort`

Planning confidence assumptions are explicit: strong evidence 0.8, weak evidence 0.4, contradictory evidence 0. Unknown evidence remains unknown. These are illustrative multipliers, not calibrated probabilities. Unknown or zero effort has no efficiency score. Efficiency is a discussion aid and never the portfolio objective.

### Portfolio feasibility

The optimiser checks every subset of up to three opportunities and maximises **total entered additive planning value** under capacity and dependency constraints. It excludes blocked or invalidated opportunities and those without effort/value estimates. It does not maximise a sum of value-per-effort ratios. Values assume no overlap or synergy and are not financial forecasts.

The highest-value feasible combination is not automatically a justified investment. Opportunity recommendations and PM judgment remain visible separately.

### Competitive classification and evidence

Only relevant competitor profiles enter classification. Table stakes requires both a user-entered target-customer requirement and at least two known competitor entries, with at least half fully offering the capability. Adoption alone is not necessity. Potential differentiation requires a claimed distinct customer outcome and at least two known entries with none fully offering it. Unknown never means absent; partial does not mean full parity.

An absent capability counts as known only for illustrative sample profiles or user-confirmed sources with supporting notes. “Source confirmed by user” is an attestation, not verification by this application. Reference text and dates are preserved; no citations or retrieval dates are invented.

### Recommendation gates

1. An explicitly invalidated customer problem → Do Not Pursue.
2. Contradictory evidence or missing mandatory inputs → Validate First.
3. With strong entered evidence and complete ratings: low problem/strategy → Do Not Pursue; unresolved blocker or low strategic fit → Defer.
4. Required parity, a viable external alternative and no distinct outcome → Buy/Partner.
5. Fewer than two known relevant competitor entries → Validate First before a build commitment.
6. Score at least 70 with problem, strategy and feasibility ratings at least 3 → Build Now. Score below 45 → Defer. Otherwise → Validate First.

Mandatory inputs are a named opportunity, customer problem, evidence, customer segment, objectives, effort and active criterion ratings. Ratings, thresholds and evidence strength are judgments, not scientifically calibrated predictions. Methodology and limitations are accessible in the application.

## Architecture

Static HTML, CSS and browser-native JavaScript, with no runtime package dependencies:

| Module | Responsibility |
| --- | --- |
| `dist/data.js` | Empty workspace and illustrative product data |
| `dist/competition.js` | Competitive classification and source-status rules |
| `dist/challenger.js` | Structured, prioritised challenge rules and review fingerprints |
| `dist/engine.js` | Validation, restoration, assessment, comparison and portfolio calculations |
| `dist/report.js` | Executive assessment generation |
| `dist/app.js` | Reusable field/view functions, navigation, persistence and export |
| `dist/index.html`, `style.css` | Integrated responsive product interface |

Hash navigation supports direct links such as `dist/#scenario-planning`, `dist/#decision-challenger` and `dist/#methodology` without server-side routing. Engine interfaces are pure and testable; optional future services can supply evidence or assessments through separate adapters. None is implemented or required now.

Legacy calculation tests are retained against a test-only fixture; the public product has no separate version sections.

## Local development

Requires Node.js 22+ and Python 3. Development dependencies support DOM integration tests only.

```sh
git clone https://github.com/ash-singh-builds/product-decision-lab.git
cd product-decision-lab
git switch feature/product-decision-lab-complete
npm ci
npm test
npm run check
npm run dev
```

Open **http://localhost:4173/** while the server runs. Stopping the server makes localhost unavailable. No API keys, environment variables or build step are needed.

## Testing

`npm test` runs preserved calculation regressions, opportunity-engine fixtures and actual application-script workflows in jsdom. Coverage includes single/two/three opportunities, uncertainty, competitor classifications, weights, all recommendations, no immediate investment, capacity, dependencies, scenario persistence, challenger reviews, stale responses, PM overrides, report export, direct links, storage recovery, focus preservation and escaped text.

`npm run check` verifies JavaScript syntax and local static asset paths. CI runs both commands on pushes and pull requests. DOM tests complement real-browser layout and interaction checks; they do not establish user validation or generative-model quality.

## Deployment and review status

The implementation is prepared on **`feature/product-decision-lab-complete`**. It is not merged into `main`. The existing [production demo](https://ash-singh-builds.github.io/product-decision-lab/dist/?v=4) remains the published application until an approved release.

After review and explicit merge approval, GitHub Pages can continue serving the repository root and its existing redirect to `dist/`. No backend or hosting migration is needed. Verify asset loading, direct hash links, local storage, examples, responsive layout and Markdown download at the actual published URL before declaring deployment successful.

## Privacy, security and limitations

Workspace data is stored in this browser only, without encryption or cross-device sync. Avoid sensitive data on shared devices. User text is escaped before rendering; competitor reference text is not fetched or executed. There is no tracking, paid inference, authentication, database or application API endpoint.

The engine does not understand or verify prose. Context edits change explanations and challenge review state; ratings and competitive inputs must be explicitly updated when the user's strategic judgment changes. No actual research, customer validation or business results are implied. Estimates may be wrong; dependencies, value additivity and competitive relevance require human judgment.

Next improvements should follow observed use: refine the evidence rubric, simplify steps where users hesitate, and validate threshold choices. These are improvement directions, not promises of measured outcomes.
