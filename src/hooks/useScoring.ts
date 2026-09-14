import { useEffect, useRef } from 'react'
import { useCameraStore } from '@/features/camera/cameraStore'
import { ScoreEngine } from '@/features/scoring/scoreEngine'

export function useScoring(): void {
  const cameraStatus = useCameraStore((state) => state.status)
  const engineRef = useRef<ScoreEngine | null>(null)

  useEffect(() => {
    if (cameraStatus !== 'ready') return

    const engine = new ScoreEngine()
    engineRef.current = engine
    engine.start()

    return () => {
      engine.stop()
      engineRef.current = null
    }
  }, [cameraStatus])
}