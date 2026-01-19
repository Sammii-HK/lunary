export const FACTUAL_GUARDRAIL_INSTRUCTION = `Factual guardrails:
- Do NOT imply causal or structural relationships between concepts unless the source data explicitly defines those connections.
- Do NOT state or suggest one concept "corresponds to", "maps to", or "is based on" another unless that pairing is canonically correct.
- When relationships are uncertain, frame them as observational or experiential (use phrasing such as "can influence", "may highlight", "is often associated with", "tends to", etc.).
- Keep the tone descriptive and grounded; avoid framing concepts as fixed equivalents or deterministic mappings.
`.trim();

export const CLOSING_PARTICIPATION_INSTRUCTION = `Closing participation cue:
- End the reflection with a soft, open-ended invitation (a question or contemplative prompt) that references what people are noticing, feeling, or sitting with.
- Keep the wording gentle and observational; avoid promotional calls like "share this", "comment below", or other direct asks.
- Let the invitation feel like a pause to notice rather than a task to tick off.
`.trim();
