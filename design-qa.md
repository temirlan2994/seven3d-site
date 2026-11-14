# Design QA

## Target

- Source: user-provided desktop screenshot of the fullscreen service deck.
- Requested change: add an obvious next-slide control in the empty space between the copy and the visualization.
- Comparison viewport: 1907 × 963.

## Verification

- Captured the implemented deck at the comparison viewport with Playwright.
- Floating control bounds: x 810, y 472, 58 × 58; this matches the marked central transition area.
- The control uses the existing red accent and arrow icon, with hover, active, focus-visible, and reduced-motion states.
- Clicking the control advances the counter from `1 / 6` to `2 / 6`.
- On slide 6 its accessible label changes to “Перейти к короткому брифу”.
- On the brief it is hidden.
- At a 390 × 844 mobile viewport the floating control is hidden and the existing bottom “Далее” control remains visible.
- No browser page errors were observed during the interaction check.

## Findings

- P0: none.
- P1: none.
- P2: none.
- P3: none.

final result: passed
