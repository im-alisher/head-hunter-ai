import { useDetectionStore } from '@/features/detection/detectionStore'
import {
  HeadTracker,
  type HeadTrackerOptions,
} from '@/features/tracking/headTracker'
import { useTrackingStore } from '@/features/tracking/trackingStore'

export class HeadTrackingEngine {
  private readonly tracker: HeadTracker
  private rafId: number | null = null
  private started = false

  constructor(options: Partial<HeadTrackerOptions> = {}) {
    this.tracker = new HeadTracker(options)
  }

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
    this.tracker.reset()
    useTrackingStore.getState().resetTracking()
  }

  private readonly tick = (time: number): void => {
    const detection = useDetectionStore.getState().lastDetection
    const state = this.tracker.update(detection, time)

    useTrackingStore.setState({
      position: state.position,
      isTracking: state.isTracking,
      confidence: state.confidence,
    })

    this.rafId = requestAnimationFrame(this.tick)
  }
}
