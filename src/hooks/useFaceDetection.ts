import { useEffect, useRef } from 'react'
import { useCameraStore } from '@/features/camera/cameraStore'
import { DetectionEngine } from '@/features/detection/detectionEngine'
import { useDetectionStore } from '@/features/detection/detectionStore'

interface UseFaceDetectionResult {
  status: ReturnType<typeof useDetectionStore.getState>['status']
  error: ReturnType<typeof useDetectionStore.getState>['error']
}

export function useFaceDetection(): UseFaceDetectionResult {
  const cameraStatus = useCameraStore((state) => state.status)
  const videoElement = useCameraStore((state) => state.videoElement)
  const engineRef = useRef<DetectionEngine | null>(null)

  useEffect(() => {
    if (cameraStatus !== 'ready' || !videoElement) return

    const engine = new DetectionEngine()
    engineRef.current = engine
    void engine.start(videoElement)

    return () => {
      engine.stop()
      engineRef.current = null
    }
  }, [cameraStatus, videoElement])

  const status = useDetectionStore((state) => state.status)
  const error = useDetectionStore((state) => state.error)

  return { status, error }
}
