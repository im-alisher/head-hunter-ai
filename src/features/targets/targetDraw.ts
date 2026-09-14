import { DESTRUCTION_DURATION_MS, type Target } from '@/game/targets'
import type { CoverCrop } from '@/utils/geometry'

const TWO_PI = Math.PI * 2
const TARGET_COLOR = '#fb7185'
const TARGET_COLOR_CORE = '#fde8ef'
const SPAWN_DURATION_MS = 300
const EXPIRE_BLINK_MS = 700

export function drawTargets(
  context: CanvasRenderingContext2D,
  targets: Target[],
  crop: CoverCrop,
  now: number,
  dpr: number,
): void {
  for (const target of targets) {
    if (target.destroyedAt !== undefined) {
      const progress = (now - target.destroyedAt) / DESTRUCTION_DURATION_MS
      if (progress < 0 || progress >= 1) continue

      const x = (target.x - crop.offsetX) * crop.scale
      const y = (target.y - crop.offsetY) * crop.scale
      const radius = target.radius * crop.scale * (1 + progress * 1.2)
      drawDestruction(context, x, y, radius, 1 - progress, dpr)
      continue
    }

    const x = (target.x - crop.offsetX) * crop.scale
    const y = (target.y - crop.offsetY) * crop.scale
    const age = Math.min(1, (now - target.createdAt) / SPAWN_DURATION_MS)
    const grow = 0.6 + 0.4 * age
    const radius = Math.max(0.1, target.radius * crop.scale * grow)

    const timeUntilExpiry = target.expiresAt - now
    const blinkOff =
      timeUntilExpiry < EXPIRE_BLINK_MS &&
      Math.floor(timeUntilExpiry / 100) % 2 === 0
    const alpha = (blinkOff ? 0.45 : 0.95) * (0.4 + 0.6 * age)

    drawTarget(context, x, y, radius, alpha, dpr)
  }
}

function drawDestruction(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  alpha: number,
  dpr: number,
): void {
  context.save()
  context.globalAlpha = alpha

  const glow = context.createRadialGradient(
    x,
    y,
    radius * 0.2,
    x,
    y,
    radius * 1.3,
  )
  glow.addColorStop(0, 'rgba(251, 113, 133, 0.35)')
  glow.addColorStop(1, 'rgba(251, 113, 133, 0)')
  context.fillStyle = glow
  context.beginPath()
  context.arc(x, y, radius * 1.3, 0, TWO_PI)
  context.fill()

  context.strokeStyle = TARGET_COLOR
  context.lineWidth = 3 * dpr
  context.beginPath()
  context.arc(x, y, radius, 0, TWO_PI)
  context.stroke()

  context.lineWidth = 1.3 * dpr
  context.beginPath()
  context.arc(x, y, radius * 0.6, 0, TWO_PI)
  context.stroke()

  context.restore()
}

function drawTarget(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  alpha: number,
  dpr: number,
): void {
  context.save()
  context.globalAlpha = alpha

  const glow = context.createRadialGradient(
    x,
    y,
    radius * 0.2,
    x,
    y,
    radius * 1.35,
  )
  glow.addColorStop(0, 'rgba(251, 113, 133, 0.25)')
  glow.addColorStop(1, 'rgba(251, 113, 133, 0)')
  context.fillStyle = glow
  context.beginPath()
  context.arc(x, y, radius * 1.35, 0, TWO_PI)
  context.fill()

  context.strokeStyle = TARGET_COLOR
  context.lineWidth = 2 * dpr
  context.beginPath()
  context.arc(x, y, radius, 0, TWO_PI)
  context.stroke()

  context.lineWidth = 1.2 * dpr
  context.beginPath()
  context.arc(x, y, radius * 0.55, 0, TWO_PI)
  context.stroke()

  context.fillStyle = TARGET_COLOR_CORE
  context.beginPath()
  context.arc(x, y, 3 * dpr, 0, TWO_PI)
  context.fill()

  context.restore()
}
