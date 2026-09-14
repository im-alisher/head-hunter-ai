import { useEffect } from 'react'
import { CameraFeed } from '@/features/camera/CameraFeed'
import { CameraOverlay } from '@/features/camera/CameraOverlay'
import { DetectionBadge } from '@/features/detection/DetectionBadge'
import { DetectionCanvas } from '@/features/detection/DetectionCanvas'
import { GameCanvas } from '@/features/game/GameCanvas'
import { TrackingBadge } from '@/features/tracking/TrackingBadge'
import { useCamera } from '@/hooks/useCamera'
import { useFaceDetection } from '@/hooks/useFaceDetection'
import { useGameRenderer } from '@/hooks/useGameRenderer'
import { useHeadTracking } from '@/hooks/useHeadTracking'
import { useScoring } from '@/hooks/useScoring'
import { useTargets } from '@/hooks/useTargets'

export function GameScreen() {
  const { videoRef, start, stop } = useCamera()
  useFaceDetection()
  useHeadTracking()
  useTargets()
  useScoring()
  useGameRenderer()

  useEffect(() => () => stop(), [stop])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <CameraFeed videoRef={videoRef} />
      <DetectionCanvas />
      <GameCanvas />
      <DetectionBadge />
      <TrackingBadge />
      <CameraOverlay onStart={start} />
    </div>
  )
}
