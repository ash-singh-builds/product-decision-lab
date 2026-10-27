# Deterministic evaluation suite

The Demo-only scope supersedes the earlier live-model requirements. There is no model, invalid model-output handling, provider error fallback or live evaluation to run. Do not describe these tests as LLM quality measurements.

Fixtures exercise strong and weak evidence; conflicting priorities; table stakes versus differentiation; insufficient competitive data; contradictory evidence; no worthwhile investment; manually entered instruction/citation attempts; invalid workspace structures; and human overrides. Core rules never execute evidence text or invent citations. Reports reproduce source notes as supplied and label them unverified or fictional.

UI integration tests execute the actual browser scripts in jsdom: single/two/three idea workflows, context edits, competitor edits, weights, challenger decisions, report copy/download, capacity snapshots, persistence, reset, clear, recovery and escaped markup. Numeric and classification tests assert substantive outcomes, rather than mirroring the implementation line by line.

Reproduce with `npm ci && npm test && npm run check`. Results belong to the executed revision only. Future provider testing should use a separately validated result contract, groundedness rubric and recorded real runs; none is claimed here.
