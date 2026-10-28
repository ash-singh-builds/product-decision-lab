# Start first, refine later — verification

Implemented on `feature/progressive-onboarding`, based on `feature/guided-demo` (PR #3), which remains unmerged. The public deployment is unchanged.

## Experience

Evaluate One Idea asks for a name and an optional customer problem. Compare 2–3 Ideas asks for two names, with a third optional. Start Evaluating opens Opportunity Overview with a partial status, known inputs, missing information and useful questions. Answers write directly to the existing context and ideas. Skips do not invent inputs or prevent access to other sections.

My Opportunities initially shows only name, problem and outcome. All other fields remain available inside disclosures. Decision Analysis groups assessment, competition, challenger and comparison. Product Context and methodology remain secondary. Existing hash routes are retained, alongside `#my-opportunities`, `#decision-analysis`, `#decision-brief` and `#opportunity-overview`.

New assessments mark capacity as unentered. Feasible alternatives require an entered capacity; this distinction is also recorded in the report. Existing saved context, ratings, evidence, estimates, dependencies, notes and scenarios remain intact. A fresh single-idea workspace replacing multiple existing ideas requires explicit confirmation. Guided state stays separate from personal work.

## Executed checks — 28 October 2026

- `npm test`: 53 passing tests, zero failures (47 preserved regression tests, updated for the navigation labels, and six onboarding tests).
- `npm run check`: passed JavaScript syntax and static asset references.
- `git diff --check`: passed.
- Real browser: name-only start; initial incomplete result; answering a customer/evidence question; opening partial analysis and report; five guided stages; capacity and strategy changes; exiting restores personal work.
- Mobile at 390 × 844: initial result remains usable, with no horizontal page overflow.

The automated cases cover one/two/three names, missing names, skipping all optional questions, answers entering real state, unchanged score safeguards, all five primary destinations, old deep links, collapsed detailed fields, draft preservation, partial report availability and the inherited isolated-demo checks.

The name-only route was exercised directly in the browser. The under-30-second entry and roughly 90-second demo are design targets, not results of a timed user study.

## Release verification

Review against `feature/guided-demo` while PR #3 is pending. Do not merge or deploy without approval. GitHub Pages needs no backend or build migration. After an approved merge, verify the public entry flow, legacy hashes, `?demo=guided`, personal-state restoration, local persistence and partial/full Markdown export. No production verification is claimed before deployment.
