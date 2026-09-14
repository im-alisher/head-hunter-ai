import type { Point2D } from '@/types/geometry'

export interface Target {
  id: string
  x: number
  y: number
  radius: number
  createdAt: number
  expiresAt: number
  /** Set when the target was destroyed by a hit; triggers the destruction animation. */
  destroyedAt?: number
}

export const DESTRUCTION_DURATION_MS = 350

export interface CreateTargetOptions {
  id: string
  now: number
  videoWidth: number
  videoHeight: number
  exclusion?: Point2D | null
  minExclusionDistance?: number
  random?: () => number
}

const TARGET_RADIUS_FRACTION = 0.024
const TARGET_RADIUS_MIN = 22
const TARGET_RADIUS_MAX = 40
const TARGET_LIFETIME_BASE_MS = 5000
const TARGET_LIFETIME_JITTER_MS = 1200
const EDGE_MARGIN_FACTOR = 1.15
const EXCLUSION_DEFAULT_FACTOR = 4
const MAX_PLACEMENT_ATTEMPTS = 14

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function calculateTargetRadius(videoWidth: number): number {
  return clamp(
    videoWidth * TARGET_RADIUS_FRACTION,
    TARGET_RADIUS_MIN,
    TARGET_RADIUS_MAX,
  )
}

export function createTarget(options: CreateTargetOptions): Target | null {
  const { id, now, videoWidth, videoHeight, exclusion = null } = options
  const random = options.random ?? Math.random

  if (videoWidth <= 0 || videoHeight <= 0) return null

  const radius = calculateTargetRadius(videoWidth)
  const margin = radius * EDGE_MARGIN_FACTOR
  const minX = margin
  const minY = margin
  const maxX = videoWidth - margin
  const maxY = videoHeight - margin

  if (maxX <= minX || maxY <= minY) return null

  const exclusionDistance =
    options.minExclusionDistance ?? radius * EXCLUSION_DEFAULT_FACTOR
  const lifetimeMs =
    TARGET_LIFETIME_BASE_MS + random() * TARGET_LIFETIME_JITTER_MS

  for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt += 1) {
    const x = minX + random() * (maxX - minX)
    const y = minY + random() * (maxY - minY)

    if (exclusion) {
      const dx = x - exclusion.x
      const dy = y - exclusion.y
      const distanceSq = dx * dx + dy * dy
      const minDistanceSq = exclusionDistance * exclusionDistance
      if (distanceSq < minDistanceSq) continue
    }

    return { id, x, y, radius, createdAt: now, expiresAt: now + lifetimeMs }
  }

  return null
}

export function isTargetExpired(target: Target, now: number): boolean {
  return now >= target.expiresAt
}

export function isTargetHit(
  aim: Point2D,
  target: Target,
  tolerance: number,
): boolean {
  const hitRadius = target.radius * tolerance
  const dx = aim.x - target.x
  const dy = aim.y - target.y
  return dx * dx + dy * dy <= hitRadius * hitRadius
}
