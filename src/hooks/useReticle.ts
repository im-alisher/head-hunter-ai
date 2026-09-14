import { useEffect, useRef } from 'react'
import { useCameraStore } from '@/features/camera/cameraStore'
import { ReticleRenderer } from '@/features/reticle/reticleRenderer'

export function useReticle(): void {
  const cameraStatus = useCameraStore((state) => state.status)
  const rendererRef = useRef<ReticleRenderer | null>(null)

  useEffect(() => {
    if (cameraStatus !== 'ready') return

    const renderer = new ReticleRenderer()
    rendererRef.current = renderer
    renderer.start()

    return () => {
      renderer.stop()
      rendererRef.current = null
    }
  }, [cameraStatus])
}
