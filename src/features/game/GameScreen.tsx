import { useEffect } from 'react'
import { CameraFeed } from '@/features/camera/CameraFeed'
import { CameraOverlay } from '@/features/camera/CameraOverlay'
import { useCamera } from '@/hooks/useCamera'

export function GameScreen() {
  const { videoRef, start, stop } = useCamera()

  useEffect(() => () => stop(), [stop])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <CameraFeed videoRef={videoRef} />
      <CameraOverlay onStart={start} />
    </div>
  )
}
