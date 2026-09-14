import { useEffect, useRef } from 'react'
import { useDetectionStore } from '@/features/detection/detectionStore'
import { HeadTrackingEngine } from '@/features/tracking/trackingEngine'

export function useHeadTracking(): void {
  const detectionStatus = useDetectionStore((state) => state.status)
  const engineRef = useRef<HeadTrackingEngine | null>(null)

  useEffect(() => {
    if (detectionStatus !== 'ready') return

    const engine = new HeadTrackingEngine()
    engineRef.current = engine
    engine.start()

    return () => {
      engine.stop()
      engineRef.current = null
    }
  }, [detectionStatus])
}
