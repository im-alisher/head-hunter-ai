import { useDetectionStore } from '@/features/detection/detectionStore'
import type { GameSystem } from '@/features/game/gameLoop'
import {
  HeadTracker,
  type HeadTrackerOptions,
} from '@/features/tracking/headTracker'
import { useTrackingStore } from '@/features/tracking/trackingStore'

export class HeadTrackingEngine implements GameSystem {
  private readonly tracker: HeadTracker

  constructor(options: Partial<HeadTrackerOptions> = {}) {
    this.tracker = new HeadTracker(options)
  }

  update(time: number): void {
    const detection = useDetectionStore.getState().lastDetection
    const state = this.tracker.update(detection, time)

    useTrackingStore.setState({
      position: state.position,
      isTracking: state.isTracking,
      confidence: state.confidence,
    })
  }

  dispose(): void {
    this.tracker.reset()
    useTrackingStore.getState().resetTracking()
  }
}
