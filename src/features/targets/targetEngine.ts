import { useCameraStore } from '@/features/camera/cameraStore'
import { useTargetStore } from '@/features/targets/targetStore'
import { useTrackingStore } from '@/features/tracking/trackingStore'
import {
  calculateTargetRadius,
  createTarget,
  isTargetExpired,
  isTargetHit,
} from '@/game/targets'
import { createId } from '@/utils/id'

const SPAWN_INTERVAL_MS = 1400
const MAX_ACTIVE_TARGETS = 4
const HIT_TOLERANCE = 1.4
const SPAWN_HEAD_MARGIN_FACTOR = 4

export class TargetEngine {
  private rafId: number | null = null
  private started = false
  private lastSpawnAt = 0

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
    this.lastSpawnAt = 0
    useTargetStore.setState({ targets: [] })
  }

  private readonly tick = (time: number): void => {
    const video = useCameraStore.getState().videoElement

    if (video && video.videoWidth > 0) {
      this.update(video.videoWidth, video.videoHeight, time)
    }

    this.rafId = requestAnimationFrame(this.tick)
  }

  private update(videoWidth: number, videoHeight: number, now: number): void {
    const { targets } = useTargetStore.getState()
    const { position, isTracking } = useTrackingStore.getState()

    let next = targets.filter((target) => !isTargetExpired(target, now))

    if (position) {
      next = next.filter(
        (target) => !isTargetHit(position, target, HIT_TOLERANCE),
      )
    }

    if (
      isTracking &&
      next.length < MAX_ACTIVE_TARGETS &&
      now - this.lastSpawnAt >= SPAWN_INTERVAL_MS
    ) {
      const target = createTarget({
        id: createId(),
        now,
        videoWidth,
        videoHeight,
        exclusion: position,
        minExclusionDistance:
          calculateTargetRadius(videoWidth) * SPAWN_HEAD_MARGIN_FACTOR,
      })
      if (target) {
        next.push(target)
        this.lastSpawnAt = now
      }
    }

    useTargetStore.setState({ targets: next })
  }
}
