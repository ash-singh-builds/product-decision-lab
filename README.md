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
- Product Context groups essential inputs above collapsed optional details. Standard dropdowns and multi-select segments/priorities support custom entries. Existing free-text context is preserved verbatim during migration; selections save locally and feed the same assessments and Markdown reports without generating ratings.
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

**Start first. Add context when it matters.** The homepage offers Evaluate One Idea, Compare 2–3 Ideas and Explore Guided Example. Enter one name, or two comparison names with a third optional, and choose Start Evaluating. A one-sentence customer problem is optional. The first Opportunity Overview separates entered facts from unknowns and offers useful questions; it does not manufacture ratings or a completed evaluation.

Answer contextual questions now, skip them, or open the full details. Responses update the same workspace used by the decision engine. Opportunity forms initially show name, customer problem and expected outcome; evidence, strategic ratings, competitive expectations, delivery estimates and dependencies remain in optional disclosures. No existing stored fields are removed. Newly started assessments leave delivery capacity unentered until you choose to consider it.

Five primary sections organise the experience: Overview, My Opportunities, Decision Analysis, Scenario Planning and Decision Brief. Decision Analysis includes opportunity assessment, competitor intelligence, the challenger and idea comparison. Full Product Context and methodology remain secondary destinations. Existing opportunity, comparison, challenger and assessment hash links still work. Every section and Markdown export remains accessible with partial inputs.

The five-stage Northstar Cloud guided example reuses those actual components, with Next, Back, Restart and Exit controls. It remains isolated from personal work. See [progressive onboarding verification](docs/PROGRESSIVE-ONBOARDING.md).

Share [the guided demo](https://ash-singh-builds.github.io/product-decision-lab/dist/?demo=guided) or use Copy Demo Link. The route works on GitHub Pages without server routing; the root redirect preserves queries and fragments. Refresh resumes the demo step and its separately saved state. Restart Demo returns to the initial 10-point scenario. Exit Demo restores the personal assessment. Demo edits use `pdl-guided-demo`; the personal storage keys are never overwritten or cleared by demo actions. Clearing demo data exits to the personal workspace.

At Investment Trade-offs, reduce capacity from 10 to 6, then switch Enterprise Readiness to Differentiation. The latter explicitly changes illustrative strategy-fit ratings and planning values, with the assumptions displayed beside the controls. Customer evidence does not become stronger. A feasible portfolio can include a Validate First or Buy/Partner opportunity and is not an investment endorsement. The executive conclusion and full Markdown assessment retain that distinction. No services, credentials or new deployment configuration are required. This feature branch must be approved before merging; production remains unchanged until then.

1. **Evaluate One Idea:** enter a name, inspect the initial result, and add context or evidence when it helps.
2. **Compare 2–3 Ideas:** enter two names and optionally a third, inspect unknowns, then explore criteria, competition and delivery scenarios.
3. **Explore Guided Example:** Northstar Cloud must balance enterprise SSO, AI-powered insights and audit logging. The inputs include fictional customer feedback and competitor profiles; novelty does not automatically win.

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
git switch feature/progressive-onboarding
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

The onboarding update is prepared on **`feature/progressive-onboarding`**, based on the unmerged guided-demo feature (PR #3). Review against `feature/guided-demo` while that PR is pending. The existing [production demo](https://ash-singh-builds.github.io/product-decision-lab/dist/) remains unchanged until explicit merge approval.

After review and explicit merge approval, GitHub Pages can continue serving the repository root and its existing redirect to `dist/`. No backend or hosting migration is needed. Verify asset loading, direct hash links, local storage, examples, responsive layout and Markdown download at the actual published URL before declaring deployment successful.

## Privacy, security and limitations

Workspace data is stored in this browser only, without encryption or cross-device sync. Avoid sensitive data on shared devices. User text is escaped before rendering; competitor reference text is not fetched or executed. There is no tracking, paid inference, authentication, database or application API endpoint.

The engine does not understand or verify prose. Context edits change explanations and challenge review state; ratings and competitive inputs must be explicitly updated when the user's strategic judgment changes. No actual research, customer validation or business results are implied. Estimates may be wrong; dependencies, value additivity and competitive relevance require human judgment.

Next improvements should follow observed use: refine the evidence rubric, simplify steps where users hesitate, and validate threshold choices. These are improvement directions, not promises of measured outcomes.
