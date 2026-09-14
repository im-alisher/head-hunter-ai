# Head Hunter AI

A webcam-powered aim trainer game controlled entirely by head movement. Move your
head to steer an on-screen reticle and shoot as many targets as you can before they
expire. No mouse, no keyboard — just your head and a camera.

Built with React, TypeScript, Vite, Zustand, MediaPipe (Face Detection), and HTML
Canvas.

## How to play

1. Click **Start camera** and allow camera permission.
2. Face the camera in good, even lighting.
3. The reticle follows the center of your face. Sweep it over a target to destroy
   it — the hit zone is about 1.4× the target's radius.
4. A hit sets off a particle explosion, a shock ring, and a pulse on the reticle.
   Chain hits back-to-back to build your combo multiplier.
5. Aim for 100% accuracy. Targets that expire before you hit them count as misses.

## Getting started

```bash
npm install
npm run dev
```

Open the printed Vite dev-server URL (default `http://localhost:5173`).

### Scripts

| Command                | Description                     |
| ---------------------- | ------------------------------- |
| `npm run dev`          | Start the Vite dev server       |
| `npm run build`        | Type-check (`tsc -b`) and build |
| `npm run preview`      | Preview the production build    |
| `npm run lint`         | Run ESLint                      |
| `npm run lint:fix`     | Fix fixable lint issues         |
| `npm run format`       | Format all files with Prettier  |
| `npm run format:check` | Verify formatting               |

## Project structure

```
src/
├─ features/          UI + engine features (one folder per system)
│  ├─ camera/         Webcam stream + permission overlay + feed
│  ├─ detection/      MediaPipe face detection engine, debug canvas, badge
│  ├─ tracking/       HeadTracker (EMA smoothing) + tracking state + badge
│  ├─ reticle/        Canvas reticle drawing with fade/aim pulse
│  ├─ targets/        Target spawn/lifecycle engine + drawing
│  ├─ scoring/        Score/combo engine + store + HUD
│  ├─ effects/        Particle bursts + hit rings engine/store/drawing
│  ├─ hud/            Score combo accuracy + FPS overlay (FpsCounter)
│  └─ game/           GameCanvas, composite GameRenderer, unified GameLoop
├─ game/              Pure domain logic (no React): targets, scoring, particles
├─ services/          External integrations (camera, MediaPipe vision)
├─ hooks/             useCamera, useGameLoop (system wiring/composition root)
├─ utils/             Pure helpers: geometry (cover crop), ids, errors, CanvasSizer
└─ types/             Shared types
```

## Architecture

**Unified game loop.** All runtime systems are driven by a single
[`GameLoop`](src/features/game/gameLoop.ts) `requestAnimationFrame` loop instead of
one loop per engine. Systems implement the `GameSystem` interface
(`update(time)` / `dispose()`) and are composed, in fixed order, by the
[`useGameLoop`](src/hooks/useGameLoop.ts) hook:

`FpsCounter → Detection → HeadTracking → Targets → Scoring → Effects → Renderer`

**Per-frame state is never subscribed by React.** Engines write high-frequency data
(position, targets, particles) into Zustand stores via
`getState()/setState()` outside the React render phase. Components only subscribe to
low-frequency slices (status, score, camera refs), so per-frame state updates never
trigger React re-renders.

**One shared canvas.** The composite [`GameRenderer`](src/features/game/gameRenderer.ts)
draws targets, particle explosions, hit rings, and the reticle onto a single
overlay canvas each frame.

**Coordinate spaces.** Gameplay coordinates are stored in video-pixel space and
projected each frame into CSS pixels with a cover-crop transform
([`computeCoverCrop`](src/utils/geometry.ts)). Canvas backing stores are sized at
`devicePixelRatio` resolution through a `ResizeObserver`-driven
[`CanvasSizer`](src/utils/canvasSizer.ts) — no per-frame layout reads.

**Face detection.** The MediaPipe [`@mediapipe/tasks-vision`] FaceDetector model
(`blaze_face_short_range`, float16) is fetched once at runtime from Google's model
storage and runs on the GPU delegate. Losing the face briefly is fine — the
`HeadTracker` smooths and predicts position with exponential moving averages and an
internal timeout.

## Constraint-based gameplay

- Targets spawn at random positions, keeping a safe distance from your head.
- At most 4 targets are active at once, spawning at most every 1.4s.
- Each target has a fixed lifetime; a target is "hit" when the reticle overlaps it.
- Scoring rewards hits (misses in a row reset the combo) and tracks accuracy.

## Requirements

- A camera, and a room that isn't backlit (good lighting greatly improves
  detection).
- A browser that supports the [MediaPipe Tasks-Vision] WebAssembly/GPU delegate
  (all modern Chrome, Edge, Firefox, and Safari versions).
- HTTPS or `localhost` for camera access.

## License

TBD — not yet licensed.
