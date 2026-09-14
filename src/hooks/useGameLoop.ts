import { useEffect } from 'react'
import { useCameraStore } from '@/features/camera/cameraStore'
import { DetectionEngine } from '@/features/detection/detectionEngine'
import { EffectsEngine } from '@/features/effects/effectsEngine'
import { GameLoop, type GameSystem } from '@/features/game/gameLoop'
import { GameRenderer } from '@/features/game/gameRenderer'
import { FpsCounter } from '@/features/hud/fpsCounter'
import { ScoreEngine } from '@/features/scoring/scoreEngine'
import { TargetEngine } from '@/features/targets/targetEngine'
import { HeadTrackingEngine } from '@/features/tracking/trackingEngine'

export function useGameLoop(): void {
  const cameraStatus = useCameraStore((state) => state.status)
  const videoElement = useCameraStore((state) => state.videoElement)

  useEffect(() => {
    if (cameraStatus !== 'ready' || !videoElement) return

    const detection = new DetectionEngine()
    void detection.initialize(videoElement)

    const systems: GameSystem[] = [
      new FpsCounter(),
      detection,
      new HeadTrackingEngine(),
      new TargetEngine(),
      new ScoreEngine(),
      new EffectsEngine(),
      new GameRenderer(),
    ]

    const loop = new GameLoop(systems)
    loop.start()

    return () => {
      loop.stop()
      for (const system of systems) {
        system.dispose()
      }
    }
  }, [cameraStatus, videoElement])
}
