import type { GameSystem } from '@/features/game/gameLoop'
import { useFpsStore } from '@/features/hud/fpsStore'

const FRAME_WINDOW_MS = 1000

export class FpsCounter implements GameSystem {
  private frames = 0
  private windowStart = 0

  update(time: number): void {
    this.frames += 1

    if (time - this.windowStart >= FRAME_WINDOW_MS) {
      useFpsStore.getState().setFps(this.frames)
      this.frames = 0
      this.windowStart = time
    }
  }

  dispose(): void {
    useFpsStore.getState().setFps(0)
  }
}
