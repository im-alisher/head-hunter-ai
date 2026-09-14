import { useCameraStore } from '@/features/camera/cameraStore'
import type { GameSystem } from '@/features/game/gameLoop'
import { useTargetStore } from '@/features/targets/targetStore'
import { useTrackingStore } from '@/features/tracking/trackingStore'
import {
  DESTRUCTION_DURATION_MS,
  calculateTargetRadius,
  createTarget,
  isTargetExpired,
  isTargetHit,
  type Target,
} from '@/game/targets'
import { createId } from '@/utils/id'

const SPAWN_INTERVAL_MS = 1400
const MAX_ACTIVE_TARGETS = 4
const HIT_TOLERANCE = 1.4
const SPAWN_HEAD_MARGIN_FACTOR = 4

export class TargetEngine implements GameSystem {
  private lastSpawnAt = 0

  update(time: number): void {
    const video = useCameraStore.getState().videoElement
    if (!video || video.videoWidth <= 0) return

    const { targets } = useTargetStore.getState()
    const { position, isTracking } = useTrackingStore.getState()

    const next: Target[] = []
    let activeCount = 0

    for (const target of targets) {
      if (target.destroyedAt !== undefined) {
        if (time - target.destroyedAt < DESTRUCTION_DURATION_MS) {
          next.push(target)
        }
        continue
      }

      if (isTargetExpired(target, time)) {
        continue
      }

      if (position && isTargetHit(position, target, HIT_TOLERANCE)) {
        next.push({ ...target, destroyedAt: time })
        continue
      }

      next.push(target)
      activeCount += 1
    }

    if (
      isTracking &&
      activeCount < MAX_ACTIVE_TARGETS &&
      time - this.lastSpawnAt >= SPAWN_INTERVAL_MS
    ) {
      const target = createTarget({
        id: createId(),
        now: time,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        exclusion: position,
        minExclusionDistance:
          calculateTargetRadius(video.videoWidth) * SPAWN_HEAD_MARGIN_FACTOR,
      })
      if (target) {
        next.push(target)
        this.lastSpawnAt = time
      }
    }

    useTargetStore.setState({ targets: next })
  }

  dispose(): void {
    this.lastSpawnAt = 0
    useTargetStore.setState({ targets: [] })
  }
}
