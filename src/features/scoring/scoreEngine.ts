import { useScoreStore } from '@/features/scoring/scoreStore'
import { useTargetStore } from '@/features/targets/targetStore'
import { applyHit, applyMiss, type ScoreStats } from '@/game/scoring'
import type { Target } from '@/game/targets'

export class ScoreEngine {
  private rafId: number | null = null
  private started = false
  private prevTargets = new Map<string, Target>()

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
    this.prevTargets.clear()
  }

  private readonly tick = (time: number): void => {
    const { targets } = useTargetStore.getState()
    const current = new Map<string, Target>()
    for (const target of targets) {
      current.set(target.id, target)
    }

    let stats: ScoreStats = useScoreStore.getState()

    for (const target of this.prevTargets.values()) {
      if (current.has(target.id)) continue

      if (time < target.expiresAt) {
        stats = applyHit(stats)
      } else {
        stats = applyMiss(stats)
      }
    }

    useScoreStore.setState(stats)
    this.prevTargets = current

    this.rafId = requestAnimationFrame(this.tick)
  }
}
