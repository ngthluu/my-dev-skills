# Visual information workspace

Create a readable browser reference that lets a human understand the proposal, relationships, and tradeoffs. The page displays information; it does not collect answers. Keep conversation and confirmed decisions in chat and the eventual Markdown spec.

## Keep only useful information

Lead with a specific title such as “Review before publishing,” not “Review the proposed decisions.” Add a subtitle only if it adds a fact. Use simple, direct English: “Waiting for a reviewer can delay publishing,” not “Reviewer availability may delay publication.”

Keep content that explains behavior, a difference, a decision, or a material risk. Delete repeated headings, option labels that repeat card titles, diagram captions that repeat every arrow, generic benefits, workflow instructions, and boilerplate footers. Do not move filler into an expandable section; remove it.

Show a short status such as “Proposed” when needed. Label synthetic samples “Example,” but remove that label for a real proposal. Show dates only when freshness matters or the user requested a durable companion. Keep internal IDs in HTML anchors or the spec; show IDs only when needed to distinguish or reference items.

Let the diagram explain the flow. Keep an accessible title or text equivalent for screen readers; avoid duplicating the same explanation visually. Show scroll guidance only where scrolling is needed. Use short labels with familiar verbs. Put supporting checks in “How to check it works,” not “Acceptance criteria and test seams.”

For final review, prioritize the model, proposed rules, and any real changes, risks, or open questions. Omit sections that have nothing useful to add. Never invent a previous review, risk, or open question just to fill a template. Keep decision status accurate and do not hide important uncertainty to make the page shorter.

Before presenting, read the visible text once: can each line be removed without losing a fact needed to understand or decide? If yes, remove it. Then check that the remaining English is clear to someone who has not read the conversation.

## Choose the smallest useful visual

Choose per question: would seeing the relationship make the decision easier? Match fidelity to the question: simple boxes for responsibilities, wireframes for layout, polished samples only for appearance decisions.

| Question | Representation | Starting point |
| --- | --- | --- |
| What changes? | Before/after using the same labels and scale | `before-after.html` |
| Who acts, in what order? | Swimlanes or sequence diagram, with labeled exchanges | `handoff-flow.html` |
| What connects to or depends on what? | System or dependency map with explicit boundaries | `system-map.html` |
| What is settled, open, or blocked? | Dependency graph with prerequisite arrows and text statuses | `decision-tree.html` |
| Which transitions are legal? | State diagram with triggers and failure/recovery paths | `state-explorer.html`; `failure-recovery.html` example |
| Which layout works better? | Side-by-side mockups | `decision-workspace.html` |
| Where do responsibilities move? | Module boundaries, call graph, or layered cross-section | `architecture-before-after.html` example |
| What concepts relate, and how many? | Entity relationship diagram with cardinalities | Adapt `system-map.html` |
| What does a person experience over time? | Journey or storyboard | Adapt `handoff-flow.html` |
| What ships first, and how can it roll back? | Rollout timeline with prerequisites and rollback points | Adapt `handoff-flow.html` |
| Which scenarios cover the requirements? | Coverage matrix | Prefer a Markdown table in chat |
| How much, how often, or how long? | Chart with units and sourced quantities | Create only when actual data exists |
| What needs final review? | Relevant model plus decisions, changes, and risks | `final-review.html` |

These are starting points, not a closed menu. Before/after is a comparison format that can contain any suitable diagram; final review is a page purpose that can combine them. Adapt or combine patterns when that explains the decision better. Keep verbal tradeoffs in chat when a compact table is sufficient. Label qualitative sizes “Schematic; not to scale” rather than implying measurements.

Use roughly 5–9 primary nodes as a starting heuristic. Split crowded models into overview and detail instead of shrinking labels. Arrows, lanes, and containment should express relationships; paragraphs inside boxes are still prose. Prefer a compact table in chat when it communicates equally well.

## Choose a packaged starting point

| Subject | Standalone template |
| --- | --- |
| Current and proposed behavior | [before-after.html](../assets/before-after.html) |
| Actors, exchanges, and retries | [handoff-flow.html](../assets/handoff-flow.html) |
| Components and boundaries | [system-map.html](../assets/system-map.html) |
| Decision prerequisites and status | [decision-tree.html](../assets/decision-tree.html) |
| States and transitions | [state-explorer.html](../assets/state-explorer.html) — static lifecycle reference |
| Decisions, changes, and risks | [final-review.html](../assets/final-review.html) |
| UI layout alternatives | [decision-workspace.html](../assets/decision-workspace.html) |

[layout-comparison.html](../examples/layout-comparison.html) and [review-flow.html](../examples/review-flow.html) provide additional layout illustrations. [architecture-before-after.html](../examples/architecture-before-after.html) shows responsibilities moving behind one interface; [failure-recovery.html](../examples/failure-recovery.html) shows retry and cancellation states. All files contain synthetic examples to replace, not default requirements.

Copy the appropriate template to a fresh descriptive HTML filename in the OS temporary directory. Replace the example content with the current proposal; remove sections that are not needed. Escape user-supplied text as HTML. Open the file with `open`, `xdg-open`, or `start` and report its absolute path. If opening is unavailable, provide the path.

## Presentation and styling

The templates embed **Pico CSS v2.1.1** plus a small custom layout layer. Preserve the embedded MIT license. Keep the CSS inline when copying so the artifact works independently of the installed skill. No CDN, remote fonts, scripts, analytics, server, build step, or added project dependencies are needed.

Use a compact header and clear visual hierarchy. On wider screens, place a diagram beside its context or risk summary. Stack sections on phones. Show all useful content directly. Do not use accordions, `details`/`summary`, or show/hide toggles. Remove unnecessary detail rather than hiding it. Keep material risks, unanswered questions, and deferred scope visible.

Pages are display-only: do not add reply panels, copy buttons, radio choices, checkboxes, answer summaries, forms, or action controls. Show alternatives and recommendations as informational content. Express state behavior with labeled transitions and static scenario descriptions. Navigation links are appropriate reading aids. Use neutral panel backgrounds for comparison cards, with distinct colored borders in both themes. Keep titles and recommendation labels so meaning never depends on color alone. A separate interactive prototype is only appropriate when the user explicitly requests one.

Use stable IDs shared with chat and the eventual spec: `Q` for questions, `D` for decisions, `A` for assumptions, `R` for risks, and `AC` for acceptance criteria. Distinguish proposed from confirmed decisions in text; displaying a decision never confirms it.

For final review, show the proposed model, changes since the previous review when relevant, decisions in scope, material risks, and deferrals. Do not turn the page into an approval form.

## Verify readability

Give diagrams accessible titles or text equivalents. Keep labels readable with stacked panels or a bounded, keyboard-focusable scrolling diagram and a nearby explanation. Use text as well as color to convey status.

When browser tooling is available, inspect desktop and narrow layouts in both themes. Check clipping, overlaps, connector routing, keyboard access to navigation, and absence of external requests. Verify that accessible label references and arrow markers resolve. Read every connector: confirm its direction, endpoints, and label agree with the scenario. Check failures, retries, boundary ownership, and decision prerequisites against the model; rendering checks alone cannot establish correctness. For dependency graphs, distinguish open decisions from blocked decisions and explicit deferrals in text. Displaying “settled” requires an actual confirmed decision; synthetic examples must remain labeled “Example.” If browser inspection is unavailable, state that limitation.

## Update and close

Refresh the workspace only when the decision model changes materially. Present the final decision summary in chat without an extra confirmation request. Keep secrets, private customer data, and unnecessary source content out of the artifact.

Chat remains authoritative during discovery. Capture every confirmed visual conclusion in the final Markdown spec; implementation must not depend on temporary HTML. If the user requests a durable browser companion, save generated HTML beside the spec, include its canonical path and generation time, and keep the companion consistent with it.
