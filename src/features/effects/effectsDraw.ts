import { HIT_RING_DURATION_MS } from '@/game/particles'
import type { Particle } from '@/game/particles'
import type { HitRing } from '@/features/effects/effectsStore'
import type { CoverCrop } from '@/utils/geometry'

const TWO_PI = Math.PI * 2

function particleColor(seed: number): string {
  switch (seed % 4) {
    case 0:
      return '#fb7185'
    case 1:
      return '#f97316'
    case 2:
      return '#fbbf24'
    default:
      return '#f8fafc'
  }
}

export function drawParticles(
  context: CanvasRenderingContext2D,
  particles: Particle[],
  crop: CoverCrop,
  now: number,
): void {
  for (const particle of particles) {
    const age = now - particle.bornAt
    if (age < 0 || age >= particle.lifetimeMs) continue

    const t = age / particle.lifetimeMs
    const x =
      (particle.x + particle.vx * (age / 1000) - crop.offsetX) * crop.scale
    const y =
      (particle.y + particle.vy * (age / 1000) - crop.offsetY) * crop.scale
    const size = Math.max(0.5, particle.size * (1 - t * 0.6)) * crop.scale
    const seed = Math.abs(Math.round(particle.x + particle.y))
    const color = particleColor(seed)

    context.save()
    context.globalAlpha = 1 - t
    context.fillStyle = color
    context.beginPath()
    context.arc(x, y, size, 0, TWO_PI)
    context.fill()
    context.restore()
  }
}

export function drawHitRings(
  context: CanvasRenderingContext2D,
  rings: HitRing[],
  crop: CoverCrop,
  now: number,
  maxRadius: number,
  dpr: number,
): void {
  for (const ring of rings) {
    const age = now - ring.bornAt
    if (age < 0 || age >= HIT_RING_DURATION_MS) continue

    const u = age / HIT_RING_DURATION_MS
    const eased = 1 - (1 - u) * (1 - u)
    const x = (ring.x - crop.offsetX) * crop.scale
    const y = (ring.y - crop.offsetY) * crop.scale
    const radius = maxRadius * eased

    context.save()
    context.globalAlpha = (1 - u) * 0.9
    context.strokeStyle = '#fb7185'
    context.lineWidth = 2.5 * dpr
    context.beginPath()
    context.arc(x, y, radius, 0, TWO_PI)
    context.stroke()
    context.restore()
  }
}
