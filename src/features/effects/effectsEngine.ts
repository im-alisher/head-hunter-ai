import { useEffectsStore } from '@/features/effects/effectsStore'
import type { GameSystem } from '@/features/game/gameLoop'
import { useTargetStore } from '@/features/targets/targetStore'
import {
  createHitExplosion,
  HIT_RING_DURATION_MS,
  isParticleAlive,
} from '@/game/particles'
import { createId } from '@/utils/id'

export class EffectsEngine implements GameSystem {
  private spawnedTargets = new Set<string>()

  update(time: number): void {
    const { particles, rings, lastHitAt } = useEffectsStore.getState()
    const { targets } = useTargetStore.getState()

    this.pruneSpawnedTargets(targets)

    const nextParticles = particles.filter((particle) =>
      isParticleAlive(particle, time),
    )
    const nextRings = rings.filter(
      (ring) => time - ring.bornAt < HIT_RING_DURATION_MS,
    )
    let nextHitAt = lastHitAt

    for (const target of targets) {
      if (
        target.destroyedAt === undefined ||
        this.spawnedTargets.has(target.id)
      ) {
        continue
      }

      this.spawnedTargets.add(target.id)
      nextParticles.push(...createHitExplosion(target, time))
      nextRings.push({ id: createId(), x: target.x, y: target.y, bornAt: time })
      nextHitAt = time
    }

    useEffectsStore.setState({
      particles: nextParticles,
      rings: nextRings,
      lastHitAt: nextHitAt,
    })
  }

  dispose(): void {
    this.spawnedTargets.clear()
    useEffectsStore.setState({ particles: [], rings: [], lastHitAt: null })
  }

  private pruneSpawnedTargets(targets: { id: string }[]): void {
    const present = new Set(targets.map((target) => target.id))
    for (const id of this.spawnedTargets) {
      if (!present.has(id)) {
        this.spawnedTargets.delete(id)
      }
    }
  }
}
