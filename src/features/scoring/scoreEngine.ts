import type { GameSystem } from '@/features/game/gameLoop'
import { useScoreStore } from '@/features/scoring/scoreStore'
import { useTargetStore } from '@/features/targets/targetStore'
import { applyHit, applyMiss, type ScoreStats } from '@/game/scoring'
import type { Target } from '@/game/targets'

export class ScoreEngine implements GameSystem {
  private prevTargets = new Map<string, Target>()

  update(time: number): void {
    const { targets } = useTargetStore.getState()
    const current = new Map<string, Target>()
    for (const target of targets) {
      current.set(target.id, target)
    }

    let stats: ScoreStats = useScoreStore.getState()

    for (const target of this.prevTargets.values()) {
      if (current.has(target.id)) continue

      if (target.destroyedAt !== undefined || time < target.expiresAt) {
        stats = applyHit(stats)
      } else {
        stats = applyMiss(stats)
      }
    }

    useScoreStore.setState(stats)
    this.prevTargets = current
  }

  dispose(): void {
    this.prevTargets.clear()
  }
}
