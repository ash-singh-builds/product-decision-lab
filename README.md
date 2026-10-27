# Product Decision Lab

An independent PM project by Ash Singh: an interactive prototype for comparing feature requests, exploring delivery constraints and explaining roadmap decisions.

[Try the live demo](https://ash-singh-builds.github.io/product-decision-lab/dist/?v=4) · [Portfolio](https://aishwaryasingh1001-hub.github.io/projects.html)

## The scenario: improving onboarding

Five improvements compete for engineering capacity: simplify setup, clearer first-step guidance, help when stuck, resume setup later, and a personalised walkthrough.

Start with a 12-point budget. Simplifying setup (6 points) and clearer guidance (4 points) fit together. Reduce capacity to 8 and explore which combination to prioritise instead.

## What you can do

- Compare impact, strategic alignment, planning confidence and effort.
- Inspect the rationale and assumptions behind each option.
- Adjust capacity and compare feasible selections.
- Challenge your assumptions with the rule-based decision challenger.
- Save scenario snapshots in your browser.
- Generate, copy or download a Markdown decision brief.

## Behind the scenes

I built this to make the reasoning behind a ranked backlog visible. My contribution includes problem framing, prioritisation logic, interaction design and AI-assisted prototyping.

The scoring model is transparent: `(60% impact + 40% strategic alignment) × confidence ÷ effort × 100`. The simulator checks every combination of five options to find the highest-scoring feasible selection. The PM owns the decision.

## Limitations

Values are scenario inputs, not measured customer outcomes. The rationale contains planning assumptions, not interviews or customer evidence. There is no live AI, usage study or claim of validated adoption. Dependencies and feature interactions are not modelled. Your backlog cannot currently be imported.

## Run locally

Serve `dist/` with a static server, for example `python3 -m http.server 4173 --directory dist`, then open `http://localhost:4173/`.

Run `npm test` or `node --test tests/engine.test.cjs` to check capacity handling and the optimiser across capacities and strategic lenses.

The app uses plain HTML, CSS and JavaScript with browser-local storage. No sign-up is required.
