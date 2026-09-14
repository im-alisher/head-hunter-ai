import type { CameraFeedProps } from './types'

export function CameraFeed({ videoRef }: CameraFeedProps) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay
        muted
        playsInline
      />
    </div>
  )
}
