import { useEffect, useRef } from 'react'
import { useCameraStore } from '@/features/camera/cameraStore'
import { TargetEngine } from '@/features/targets/targetEngine'

export function useTargets(): void {
  const cameraStatus = useCameraStore((state) => state.status)
  const engineRef = useRef<TargetEngine | null>(null)

  useEffect(() => {
    if (cameraStatus !== 'ready') return

    const engine = new TargetEngine()
    engineRef.current = engine
    engine.start()

    return () => {
      engine.stop()
      engineRef.current = null
    }
  }, [cameraStatus])
}
