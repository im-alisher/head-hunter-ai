import { useEffect } from 'react'
import { CameraFeed } from '@/features/camera/CameraFeed'
import { CameraOverlay } from '@/features/camera/CameraOverlay'
import { DetectionBadge } from '@/features/detection/DetectionBadge'
import { DetectionCanvas } from '@/features/detection/DetectionCanvas'
import { useCamera } from '@/hooks/useCamera'
import { useFaceDetection } from '@/hooks/useFaceDetection'

export function GameScreen() {
  const { videoRef, start, stop } = useCamera()
  useFaceDetection()

  useEffect(() => () => stop(), [stop])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <CameraFeed videoRef={videoRef} />
      <DetectionCanvas />
      <DetectionBadge />
      <CameraOverlay onStart={start} />
    </div>
  )
}
