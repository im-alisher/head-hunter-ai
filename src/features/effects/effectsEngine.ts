import { useEffectsStore } from '@/features/effects/effectsStore'
import { useTargetStore } from '@/features/targets/targetStore'
import {
  createHitExplosion,
  HIT_RING_DURATION_MS,
  isParticleAlive,
} from '@/game/particles'
import { createId } from '@/utils/id'

export class EffectsEngine {
  private rafId: number | null = null
  private started = false
  private spawnedTargets = new Set<string>()

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
    this.spawnedTargets.clear()
    useEffectsStore.setState({ particles: [], rings: [], lastHitAt: null })
  }

  private readonly tick = (time: number): void => {
    const { particles, rings, lastHitAt } = useEffectsStore.getState()
    const { targets } = useTargetStore.getState()

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

    this.rafId = requestAnimationFrame(this.tick)
  }
}
