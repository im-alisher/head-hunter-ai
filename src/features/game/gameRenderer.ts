import { useCameraStore } from '@/features/camera/cameraStore'
import { useEffectsStore } from '@/features/effects/effectsStore'
import { drawHitRings, drawParticles } from '@/features/effects/effectsDraw'
import { useGameCanvasStore } from '@/features/game/gameCanvasStore'
import type { GameSystem } from '@/features/game/gameLoop'
import {
  drawReticle,
  RETICLE_PULSE_DURATION_MS,
} from '@/features/reticle/reticleDraw'
import { useTargetStore } from '@/features/targets/targetStore'
import { drawTargets } from '@/features/targets/targetDraw'
import { useTrackingStore } from '@/features/tracking/trackingStore'
import { CanvasSizer } from '@/utils/canvasSizer'
import { computeCoverCrop } from '@/utils/geometry'

const FADE_IN_RATE = 6
const FADE_OUT_RATE = 2.5
const MIN_RADIUS_CSS = 20
const MAX_RADIUS_CSS = 44
const RADIUS_FRACTION = 0.05

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

export class GameRenderer implements GameSystem {
  private lastTime = 0
  private reticleLock = 0
  private sizer: CanvasSizer | null = null
  private context: CanvasRenderingContext2D | null = null

  update(time: number): void {
    const dt = clamp(time - this.lastTime, 0, 100)
    this.lastTime = time

    const canvas = useGameCanvasStore.getState().canvas
    if (!canvas) return

    if (!this.sizer || this.sizer.canvas !== canvas) {
      this.sizer?.dispose()
      this.sizer = new CanvasSizer(canvas)
      this.context = canvas.getContext('2d')
    }

    const sizer = this.sizer
    const context = this.context
    if (!sizer || !context) return

    sizer.applySize()
    const { width, height, dpr } = sizer

    const video = useCameraStore.getState().videoElement
    if (!video || video.videoWidth <= 0) {
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.clearRect(0, 0, width, height)
      return
    }

    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, width, height)

    const crop = computeCoverCrop(
      video.videoWidth,
      video.videoHeight,
      width,
      height,
    )

    const { targets } = useTargetStore.getState()
    drawTargets(context, targets, crop, time, dpr)

    const { particles, rings, lastHitAt } = useEffectsStore.getState()
    drawParticles(context, particles, crop, time)
    const cssWidth = width / dpr
    const cssHeight = height / dpr
    const ringMaxRadius = Math.min(cssWidth, cssHeight) * 0.12
    drawHitRings(context, rings, crop, time, ringMaxRadius, dpr)

    let pulse = 0
    if (lastHitAt !== null) {
      pulse = 1 - (time - lastHitAt) / RETICLE_PULSE_DURATION_MS
      pulse = Math.max(0, pulse) * Math.max(0, pulse)
    }

    const { position } = useTrackingStore.getState()

    if (position) {
      this.reticleLock = clamp(
        this.reticleLock + (dt / 1000) * FADE_IN_RATE,
        0,
        1,
      )
      const ease = smoothstep(this.reticleLock)
      if (ease >= 0.003) {
        const x = (position.x - crop.offsetX) * crop.scale
        const y = (position.y - crop.offsetY) * crop.scale
        const radius =
          clamp(
            Math.min(cssWidth, cssHeight) * RADIUS_FRACTION,
            MIN_RADIUS_CSS,
            MAX_RADIUS_CSS,
          ) *
          dpr *
          (0.85 + 0.15 * ease) *
          (1 + 0.18 * pulse)

        drawReticle(context, { x, y, radius, alpha: ease, dpr, pulse })
      }
    } else {
      this.reticleLock = clamp(
        this.reticleLock - (dt / 1000) * FADE_OUT_RATE,
        0,
        1,
      )
    }
  }

  dispose(): void {
    this.sizer?.dispose()
    this.sizer = null
    this.context = null
    this.reticleLock = 0
  }
}
