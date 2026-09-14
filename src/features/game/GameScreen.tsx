import { useEffect } from 'react'
import { CameraFeed } from '@/features/camera/CameraFeed'
import { CameraOverlay } from '@/features/camera/CameraOverlay'
import { DetectionBadge } from '@/features/detection/DetectionBadge'
import { DetectionCanvas } from '@/features/detection/DetectionCanvas'
import { GameCanvas } from '@/features/game/GameCanvas'
import { GameHUD } from '@/features/hud/GameHUD'
import { TrackingBadge } from '@/features/tracking/TrackingBadge'
import { useCamera } from '@/hooks/useCamera'
import { useGameLoop } from '@/hooks/useGameLoop'

export function GameScreen() {
  const { videoRef, start, stop } = useCamera()
  useGameLoop()

  useEffect(() => () => stop(), [stop])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <CameraFeed videoRef={videoRef} />
      <DetectionCanvas />
      <GameCanvas />
      <DetectionBadge />
      <TrackingBadge />
      <GameHUD />
      <CameraOverlay onStart={start} />
    </div>
  )
}
