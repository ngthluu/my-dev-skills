# Visual decision workspace

Use a browser artifact to make a decision easier to judge, not to decorate the brainstorm. It should let a human grasp relationships faster than rereading the conversation while leaving chat as the place where answers are given.

## Choose the smallest useful visual

Match the representation to the uncertainty:

- Use a flow or sequence for ordered interactions and handoffs.
- Use a state diagram plus a state panel for legal transitions and failure paths.
- Use a dependency graph for branching or many-to-many relationships.
- Use a comparison table or side-by-side cards for two to four alternatives.
- Use low-fidelity wireframes for hierarchy, layout, navigation, or interaction questions.
- Use a chart only when real quantities, ranges, or trends affect the decision. Do not chart categorical prose.
- Use an interactive demo only when clicking through behavior will answer a named design question that static views cannot.

Combine representations only when each answers a different open question. Prefer a compact Markdown table in chat when it communicates the issue equally well.

## Create and open the artifact

Write a single HTML file to the operating system's temporary directory so ordinary brainstorm work does not dirty the repository. Use a fresh, descriptive filename such as `brainstorm-<slug>-<timestamp>.html`. Open it with the platform's normal command (`open`, `xdg-open`, or `start`) and report its absolute path. If opening is unavailable, report the path and continue discovery in chat.

Make it work by opening the file directly. Prefer semantic HTML, inline CSS, small inline JavaScript, and inline SVG. Do not load remote scripts, fonts, analytics, CDN assets, or browser-event collection: the page may contain private product information, and it should remain usable offline. If an existing local tool can generate a necessary diagram without adding project dependencies, using its static SVG output is fine.

Do not add frameworks, a server, a build step, package dependencies, or production routes merely to render the workspace. Do not include secrets, credentials, private customer data, or unnecessary source content.

## Start from the packaged template

Copy [assets/decision-workspace.html](../assets/decision-workspace.html) to a fresh file in the OS temporary directory. Replace its title, outcome, updated time, question, option IDs, mockups, consequences, and recommendation with the current decision. Keep all CSS, JavaScript, and any images inline; the copied file must work after the installed skill folder is removed. Escape any user-provided text as HTML instead of inserting it as executable markup or script.

The template supplies a focused screen, system light/dark theme, native keyboard radio selection, visible focus, responsive cards, mockup components, a readable answer summary, clipboard fallback, and reset. Each radio group uses the stable question ID as `name` and a unique option ID such as `Q1-A` as `value`. Keep its accessible labels and native controls when adapting it. Test keyboard selection, narrow screens, both themes, reset, and unavailable clipboard access after material changes.

See [layout-comparison.html](../examples/layout-comparison.html) for navigation alternatives and [review-flow.html](../examples/review-flow.html) for distinct review arrangements. These are fully standalone examples, not files a generated workspace loads. Their mock controls are static illustrations; add real prototype controls only when behavior is the question.

Normally compare 2–4 meaningful options. Indicate the recommendation in text and explain each consequence. When comparing layout or behavior, alternatives must differ structurally. Scale fidelity to the current question; ordinary scope, requirements, and verbal tradeoffs remain in chat.

## Make decisions traceable

Start with a compact header showing the subject, intended outcome, last-updated time, and that the artifact is a temporary decision aid. Use stable identifiers shared with chat and the eventual spec:

- `Q<n>` for open questions;
- `D<n>` for settled decisions;
- `A<n>` for assumptions;
- `R<n>` for risks;
- `AC<n>` for acceptance criteria.

When possible, show:

1. the current and desired states;
2. scope and explicit non-goals;
3. the decision tree, distinguishing settled, open, assumed, contradictory, and deferred nodes;
4. the visual needed for the current questions;
5. alternatives with consequences and the recommended option clearly identified;
6. acceptance criteria paired with public test seams;
7. a short `Reply in chat` panel listing the IDs awaiting an answer.

Show only context relevant to the focused question; the list above is a menu, not a requirement to crowd every screen. Keep prose sparse. The visual should carry the relationship; labels and captions should explain how to read it. Use accessible contrast, responsive layout, readable type, keyboard-operable controls, and text labels in addition to color.

## Interactive decision aids

An interactive aid is still part of discovery, not production implementation. State the exact question it is testing in the page. Keep all state in memory, use representative synthetic data, expose the current relevant state after every action, and make reset easy.

For UI alternatives, make variants structurally different rather than changing only color or copy. Let the user switch between them in one page and label each variant with its decision ID. For logic or state questions, provide both free-play actions and a few guided scenarios covering the happy path, an important edge case, and an invalid action.

Do not connect the aid to production services or real mutations. Do not treat prototype code as approved implementation. The answer summary must remain readable and selectable when clipboard access fails under `file://`. Browser selections are advisory and never submit, save, or settle decisions; the user supplies the option IDs in chat. Record only the conclusions the user validates in chat.

## Update and close

Regenerate or revise the workspace when an answer materially changes its model, not after every message. Refresh it before asking for final confirmation so it reflects the proposed shared understanding.

Chat remains authoritative during discovery, and the final Markdown spec is the durable source of truth. Translate every validated visual conclusion into explicit requirements, flows, decisions, edge cases, or acceptance criteria in the spec. The implementation session must not require the temporary HTML.

If the user requests a lasting browser view, write a generated HTML companion beside the completed spec. Label it as generated, include the canonical spec path and generation time, and avoid information that is absent from or contradicts the spec.
