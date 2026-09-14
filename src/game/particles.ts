import type { Point2D } from '@/types/geometry'
import { createId } from '@/utils/id'

export interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  size: number
  bornAt: number
  lifetimeMs: number
}

export const HIT_RING_DURATION_MS = 450
const PARTICLE_COUNT = 12
const PARTICLE_MIN_SPEED = 80
const PARTICLE_SPEED_RANGE = 220
const PARTICLE_MIN_LIFETIME_MS = 350
const PARTICLE_LIFETIME_RANGE_MS = 250
const PARTICLE_MIN_RADIUS = 1.5
const PARTICLE_RADIUS_RANGE = 2.5

export function createHitExplosion(
  origin: Point2D,
  now: number,
  random: () => number = Math.random,
): Particle[] {
  const particles: Particle[] = []

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const angle = random() * Math.PI * 2
    const speed = PARTICLE_MIN_SPEED + random() * PARTICLE_SPEED_RANGE

    particles.push({
      id: createId(),
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: PARTICLE_MIN_RADIUS + random() * PARTICLE_RADIUS_RANGE,
      bornAt: now,
      lifetimeMs:
        PARTICLE_MIN_LIFETIME_MS + random() * PARTICLE_LIFETIME_RANGE_MS,
    })
  }

  return particles
}

export function isParticleAlive(particle: Particle, now: number): boolean {
  return now - particle.bornAt < particle.lifetimeMs
}
