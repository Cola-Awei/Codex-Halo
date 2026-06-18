# Codex Halo Floating Status Light Design

## Goal

Build a small desktop floating widget named Codex Halo. It shows the current Codex status as a glowing circular halo with the state text inside the ring. The widget should feel like a lightweight companion/status light rather than a dashboard.

## Confirmed Visual Direction

The first version contains only the circular Halo status light:

- No outer card, panel, title bar, footer, or bottom state tabs.
- The window background should be transparent so only the circular widget is visible.
- The main shape is a glowing segmented circular ring.
- The center shows the current state text, for example `待命` and `Idle`.
- A small hint line may appear under the state text, for example `等待输入`.
- The widget can be dragged anywhere on the desktop.

## States

The widget supports five statuses:

- `待命 Idle`: waiting for input, calm cyan glow, slow breathing animation.
- `思考 Thinking`: Codex is reasoning, brighter rotating ring.
- `执行 Running`: commands or edits are being executed, stronger pulse.
- `等待 Waiting`: Codex is waiting for user input or approval, attention blink.
- `完成 Done`: work finished, brief completion glow, then returns to idle when appropriate.

## Product Behavior

The app starts as a small always-on-top frameless desktop window. The user can drag the circular widget directly; there is no visible title bar.

The first implementation should include a local simulation mode so the UI can be tested even before a reliable Codex status source is wired in. Simulation can cycle states or allow manual switching from a hidden/context control.

When status source integration is added, the UI should update by changing:

- Center state text.
- Small hint line.
- Ring color segments.
- Ring animation speed and glow intensity.

## Architecture

Use a desktop app shell with a web-rendered UI. Electron is the preferred first implementation because it supports:

- Frameless transparent windows.
- Always-on-top behavior.
- Drag regions for custom-shaped widgets.
- Fast HTML/CSS animation work for the Halo visual.

The app should have clear boundaries:

- Main process: creates the transparent floating window and owns desktop behavior.
- Renderer UI: renders the Halo visual and animations.
- Status provider: supplies the current Codex state through a small interface.

The status provider starts with a mock provider. A future provider can read local Codex app/thread status if a stable local source is available.

## Error Handling

If live status cannot be detected, the widget should remain usable in `待命 Idle` and show no noisy error UI. Development builds may log provider errors to the console.

If a state is unknown, map it to `待命 Idle`.

## Testing And Verification

Verification should cover:

- The app launches without errors.
- The window is frameless, transparent, and always on top.
- The Halo can be dragged on desktop.
- All five states render distinct text and visual behavior.
- The renderer remains visible at the intended size without clipping text.

For the first implementation, screenshots or browser/Electron visual checks should confirm the circular widget matches the approved reference direction.
