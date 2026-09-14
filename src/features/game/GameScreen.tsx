import { useEffect } from 'react'
import { CameraFeed } from '@/features/camera/CameraFeed'
import { CameraOverlay } from '@/features/camera/CameraOverlay'
import { DetectionBadge } from '@/features/detection/DetectionBadge'
import { DetectionCanvas } from '@/features/detection/DetectionCanvas'
import { TrackingBadge } from '@/features/tracking/TrackingBadge'
import { useCamera } from '@/hooks/useCamera'
import { useFaceDetection } from '@/hooks/useFaceDetection'
import { useHeadTracking } from '@/hooks/useHeadTracking'

export function GameScreen() {
  const { videoRef, start, stop } = useCamera()
  useFaceDetection()
  useHeadTracking()

  useEffect(() => () => stop(), [stop])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <CameraFeed videoRef={videoRef} />
      <DetectionCanvas />
      <DetectionBadge />
      <TrackingBadge />
      <CameraOverlay onStart={start} />
    </div>
  )
}
