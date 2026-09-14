import { useCallback } from 'react'
import { useCameraStore } from '@/features/camera/cameraStore'
import type { CameraError, CameraStatus } from '@/types/camera'

interface UseCameraResult {
  status: CameraStatus
  error: CameraError | null
  isRequesting: boolean
  isReady: boolean
  videoRef: (element: HTMLVideoElement | null) => void
  start: () => Promise<void>
  stop: () => void
}

export function useCamera(): UseCameraResult {
  const status = useCameraStore((state) => state.status)
  const error = useCameraStore((state) => state.error)
  const start = useCameraStore((state) => state.start)
  const stop = useCameraStore((state) => state.stop)
  const registerVideoElement = useCameraStore(
    (state) => state.registerVideoElement,
  )

  const videoRef = useCallback(
    (element: HTMLVideoElement | null) => {
      registerVideoElement(element)
    },
    [registerVideoElement],
  )

  return {
    status,
    error,
    isRequesting: status === 'requesting',
    isReady: status === 'ready',
    videoRef,
    start,
    stop,
  }
}
