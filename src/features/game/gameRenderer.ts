import { useCameraStore } from '@/features/camera/cameraStore'
import { useGameCanvasStore } from '@/features/game/gameCanvasStore'
import { drawReticle } from '@/features/reticle/reticleDraw'
import { useTargetStore } from '@/features/targets/targetStore'
import { drawTargets } from '@/features/targets/targetDraw'
import { useTrackingStore } from '@/features/tracking/trackingStore'
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

export class GameRenderer {
  private rafId: number | null = null
  private started = false
  private lastTime = 0
  private reticleLock = 0

  start(): void {
    if (this.started) return
    this.started = true
    this.lastTime = performance.now()
    this.rafId = requestAnimationFrame(this.tick)
  }

  stop(): void {
    if (!this.started) return
    this.started = false

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
    }
    this.rafId = null
    this.reticleLock = 0
  }

  private readonly tick = (time: number): void => {
    const dt = clamp(time - this.lastTime, 0, 100)
    this.lastTime = time

    const canvas = useGameCanvasStore.getState().canvas
    const video = useCameraStore.getState().videoElement

    if (canvas && video && video.videoWidth > 0) {
      this.render(canvas, video, dt, time)
    } else if (canvas) {
      this.clearCanvas(canvas)
    }

    this.rafId = requestAnimationFrame(this.tick)
  }

  private render(
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement,
    dt: number,
    time: number,
  ): void {
    const context = canvas.getContext('2d')
    if (!context) return

    const dpr = window.devicePixelRatio || 1
    const bounds = canvas.getBoundingClientRect()
    const width = Math.max(1, Math.round(bounds.width * dpr))
    const height = Math.max(1, Math.round(bounds.height * dpr))

    this.resizeCanvas(canvas, width, height)
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
            Math.min(bounds.width, bounds.height) * RADIUS_FRACTION,
            MIN_RADIUS_CSS,
            MAX_RADIUS_CSS,
          ) *
          dpr *
          (0.85 + 0.15 * ease)

        drawReticle(context, { x, y, radius, alpha: ease, dpr })
      }
    } else {
      this.reticleLock = clamp(
        this.reticleLock - (dt / 1000) * FADE_OUT_RATE,
        0,
        1,
      )
    }
  }

  private resizeCanvas(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
  ): void {
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
  }

  private clearCanvas(canvas: HTMLCanvasElement): void {
    const context = canvas.getContext('2d')
    if (!context) return
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, canvas.width, canvas.height)
  }
}
