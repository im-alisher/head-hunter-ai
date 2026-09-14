import { useEffect, useRef } from 'react'
import { useCameraStore } from '@/features/camera/cameraStore'
import { EffectsEngine } from '@/features/effects/effectsEngine'

export function useEffects(): void {
  const cameraStatus = useCameraStore((state) => state.status)
  const engineRef = useRef<EffectsEngine | null>(null)

  useEffect(() => {
    if (cameraStatus !== 'ready') return

    const engine = new EffectsEngine()
    engineRef.current = engine
    engine.start()

    return () => {
      engine.stop()
      engineRef.current = null
    }
  }, [cameraStatus])
}
