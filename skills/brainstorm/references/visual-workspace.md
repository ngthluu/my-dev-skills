# Visual workspace

Create a display-only browser reference when seeing relationships helps the user decide. Chat owns answers and confirmed decisions; the final Markdown spec is canonical.

## 1. Choose the visual

Prefer prose or a chat table when equally clear. Match fidelity to the question: boxes for responsibilities, wireframes for layout, polished samples for appearance.

| Decision | Representation and starting point |
| --- | --- |
| What changes? | [Before/after](../assets/before-after.html) with matching labels and scale |
| Who acts, in what order? | [Handoff flow](../assets/handoff-flow.html) with actors and labeled exchanges |
| What connects or depends on what? | [System map](../assets/system-map.html) with explicit boundaries |
| What is settled, open, or blocked? | [Decision graph](../assets/decision-graph.html) with prerequisite arrows and text statuses |
| Which transitions are legal? | [State explorer](../assets/state-explorer.html) with triggers, failures, and recovery |
| Which layout works better? | [UI comparison](../assets/decision-workspace.html) |
| What needs final review? | [Final review](../assets/final-review.html) with the model, decisions, changes, and risks |

Adapt or combine these patterns. Use system maps for entities and cardinalities, handoff flows for journeys or rollout/rollback, and chat tables for coverage. Charts need actual sourced data and units. Label qualitative sizes “Schematic; not to scale.”

Examples: [layout comparison](../examples/layout-comparison.html), [review flow](../examples/review-flow.html), [architecture changes](../examples/architecture-before-after.html), and [failure recovery](../examples/failure-recovery.html). Their synthetic content supplies no project requirements.

## 2. Build the reference

- Copy a template to a fresh, descriptive HTML filename in the OS temporary directory. Replace examples and remove unused sections.
- Escape user-supplied text as HTML. Exclude secrets, private customer data, and unnecessary source content.
- Keep embedded Pico CSS and its MIT license inline so the file works independently and offline. Add no remote resources or project dependencies.
- Use stable IDs shared with chat and the spec: `Q` questions, `D` decisions, `A` assumptions, `R` risks, `AC` acceptance criteria.
- Keep IDs in anchors unless readers need them. Label proposed versus confirmed decisions, and synthetic samples as “Example.”
- Show dates only when freshness matters or for a requested durable companion.

### Content

- Use a specific title, short labels, and plain language. Add a subtitle only when it contributes a fact.
- Keep behavior, differences, decisions, tradeoffs, and material uncertainty. Remove repetition, generic benefits, and workflow boilerplate.
- Let diagrams explain relationships through arrows, lanes, and containment. Avoid duplicating every connector in visible prose.
- For final review, show the proposed model, decisions in scope, real changes since a prior review, risks, and deferrals.
- Omit empty sections. Never invent history, risks, or questions to fill a template. Call supporting checks “How to check it works.”

### Layout and interaction

- Use a compact header. Place diagrams beside context on wide screens and stack panels on phones.
- Start with roughly 5–9 primary nodes. Split crowded models into overview and detail instead of shrinking labels.
- Show useful content directly. Do not add accordions, `details`/`summary`, or show/hide toggles.
- Pages are display-only: no reply panels, copy buttons, radio choices, checkboxes, answer summaries, forms, or action controls.
- Navigation links are allowed. Show state behavior through labeled transitions and static scenarios.
- Use neutral comparison panels with distinct colored borders in both themes. Convey status and recommendations with text too.
- Give diagrams accessible titles or text equivalents. For necessary scrolling, use a bounded, keyboard-focusable region with guidance.
- Create a separate interactive prototype only when explicitly requested.

## 3. Verify and present

1. Read the visible text. Remove lines that add no decision-relevant fact, while preserving material risks and uncertainty.
2. Check every connector's direction, endpoints, and label against the model. Verify failures, retries, ownership, and prerequisites.
3. Distinguish open, blocked, and deferred decisions in text. “Settled” requires an actual confirmed decision.
4. With browser tooling, inspect desktop and narrow layouts in both themes. Check clipping, overlaps, connector routing, keyboard navigation, and no external requests. Verify accessible label references and arrow markers resolve. State when browser inspection is unavailable.
5. When delegated, return the absolute artifact path and verification findings to the main agent. The main agent checks accuracy before presenting.
6. Open the verified file with `open`, `xdg-open`, or `start` and report its absolute path. If opening is unavailable, provide the path.

Rendering checks alone do not establish model correctness. Displaying a decision does not confirm it.

## 4. Update and close

- Refresh only for material model changes. Present the final decision summary in chat without an extra confirmation round.
- Carry every confirmed visual conclusion into the Markdown spec. Implementation must not depend on temporary HTML.
- Save a durable HTML companion only when requested. Place it beside the spec, include the canonical spec path and generation time, and keep both consistent.
