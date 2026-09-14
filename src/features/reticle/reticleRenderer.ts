import { useCameraStore } from '@/features/camera/cameraStore'
import { useGameCanvasStore } from '@/features/game/gameCanvasStore'
import { useTrackingStore } from '@/features/tracking/trackingStore'
import type { Point2D } from '@/types/geometry'
import { computeCoverCrop } from '@/utils/geometry'

const TWO_PI = Math.PI * 2
const COLOR_MAIN = '#34d399'
const COLOR_CORE = '#f8fafc'
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

export class ReticleRenderer {
  private rafId: number | null = null
  private started = false
  private lastTime = 0
  private lock = 0

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
    this.lock = 0
  }

  private readonly tick = (time: number): void => {
    const dt = clamp(time - this.lastTime, 0, 100)
    this.lastTime = time

    const canvas = useGameCanvasStore.getState().canvas
    if (canvas) {
      const { position } = useTrackingStore.getState()

      if (position) {
        this.lock = clamp(this.lock + (dt / 1000) * FADE_IN_RATE, 0, 1)
        this.drawReticle(canvas, position)
      } else {
        this.lock = clamp(this.lock - (dt / 1000) * FADE_OUT_RATE, 0, 1)
        this.clearCanvas(canvas)
      }
    }

    this.rafId = requestAnimationFrame(this.tick)
  }

  private drawReticle(canvas: HTMLCanvasElement, position: Point2D): void {
    const context = canvas.getContext('2d')
    if (!context) return

    const video = useCameraStore.getState().videoElement
    if (!video || video.videoWidth <= 0) return

    const dpr = window.devicePixelRatio || 1
    const bounds = canvas.getBoundingClientRect()
    const width = Math.max(1, Math.round(bounds.width * dpr))
    const height = Math.max(1, Math.round(bounds.height * dpr))

    this.resizeCanvas(canvas, width, height)
    this.clearCanvas(canvas)

    const ease = smoothstep(this.lock)
    if (ease < 0.003) return

    const crop = computeCoverCrop(
      video.videoWidth,
      video.videoHeight,
      width,
      height,
    )
    const x = (position.x - crop.offsetX) * crop.scale
    const y = (position.y - crop.offsetY) * crop.scale

    const baseRadius =
      clamp(
        Math.min(bounds.width, bounds.height) * RADIUS_FRACTION,
        MIN_RADIUS_CSS,
        MAX_RADIUS_CSS,
      ) *
      dpr *
      (0.85 + 0.15 * ease)

    context.save()
    context.translate(x, y)
    context.globalAlpha = ease

    const glow = context.createRadialGradient(
      0,
      0,
      baseRadius * 0.3,
      0,
      0,
      baseRadius * 1.25,
    )
    glow.addColorStop(0, 'rgba(52, 211, 153, 0.16)')
    glow.addColorStop(1, 'rgba(52, 211, 153, 0)')
    context.fillStyle = glow
    context.beginPath()
    context.arc(0, 0, baseRadius * 1.25, 0, TWO_PI)
    context.fill()

    context.strokeStyle = COLOR_MAIN
    context.lineWidth = 1.6 * dpr
    context.beginPath()
    context.arc(0, 0, baseRadius, 0, TWO_PI)
    context.stroke()

    context.lineCap = 'round'
    const tickInner = baseRadius * 0.72
    const tickOuter = baseRadius * 0.98
    for (let i = 0; i < 4; i += 1) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      context.beginPath()
      context.moveTo(cos * tickInner, sin * tickInner)
      context.lineTo(cos * tickOuter, sin * tickOuter)
      context.stroke()
    }

    context.fillStyle = COLOR_CORE
    context.beginPath()
    context.arc(0, 0, 2.6 * dpr, 0, TWO_PI)
    context.fill()

    context.restore()
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
