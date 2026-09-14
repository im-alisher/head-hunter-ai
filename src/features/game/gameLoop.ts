export interface GameSystem {
  update(time: number): void
  dispose(): void
}

export class GameLoop {
  private readonly systems: readonly GameSystem[]
  private rafId: number | null = null
  private started = false

  constructor(systems: readonly GameSystem[]) {
    this.systems = systems
  }

  start(): void {
    if (this.started) return
    this.started = true
    this.rafId = requestAnimationFrame(this.tick)
  }

  stop(): void {
    if (!this.started) return
    this.started = false

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
    }
    this.rafId = null
  }

  private readonly tick = (time: number): void => {
    for (const system of this.systems) {
      system.update(time)
    }
    this.rafId = requestAnimationFrame(this.tick)
  }
}
