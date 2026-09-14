import type { FaceDetection } from '@/services/vision/types'
import type { Point2D } from '@/types/geometry'

export interface HeadTrackerOptions {
  /** Time constant of the exponential moving average, in milliseconds. */
  smoothingTauMs: number
  /** Maximum time without a detection before tracking is considered lost, in ms. */
  maxGapMs: number
  /** Minimum detection confidence required to update the tracked position. */
  minConfidence: number
}

export interface HeadTrackingState {
  /** Smoothed head center in video pixel space, or null when no head is tracked. */
  position: Point2D | null
  isTracking: boolean
  confidence: number
}

const DEFAULT_OPTIONS: HeadTrackerOptions = {
  smoothingTauMs: 80,
  maxGapMs: 300,
  minConfidence: 0.5,
}

function computeCenter(detection: FaceDetection): Point2D {
  const { boundingBox } = detection
  return {
    x: boundingBox.x + boundingBox.width / 2,
    y: boundingBox.y + boundingBox.height / 2,
  }
}

export class HeadTracker {
  private readonly options: HeadTrackerOptions
  private smoothed: Point2D | null = null
  private lastSeenAt = 0
  private confidence = 0

  constructor(options: Partial<HeadTrackerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  update(detection: FaceDetection | null, now: number): HeadTrackingState {
    const { minConfidence, smoothingTauMs, maxGapMs } = this.options

    if (detection && detection.confidence >= minConfidence) {
      const raw = computeCenter(detection)
      const dt = Math.max(now - this.lastSeenAt, 1)
      const alpha = 1 - Math.exp(-dt / smoothingTauMs)

      if (this.smoothed === null) {
        this.smoothed = { ...raw }
      } else {
        this.smoothed.x += alpha * (raw.x - this.smoothed.x)
        this.smoothed.y += alpha * (raw.y - this.smoothed.y)
      }

      this.lastSeenAt = now
      this.confidence = detection.confidence

      return {
        position: { ...this.smoothed },
        isTracking: true,
        confidence: this.confidence,
      }
    }

    if (now - this.lastSeenAt > maxGapMs) {
      this.smoothed = null
      this.confidence = 0
      return { position: null, isTracking: false, confidence: 0 }
    }

    return {
      position: this.smoothed ? { ...this.smoothed } : null,
      isTracking: true,
      confidence: this.confidence,
    }
  }

  reset(): void {
    this.smoothed = null
    this.lastSeenAt = 0
    this.confidence = 0
  }
}
