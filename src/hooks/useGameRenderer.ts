import { useEffect, useRef } from 'react'
import { useCameraStore } from '@/features/camera/cameraStore'
import { GameRenderer } from '@/features/game/gameRenderer'

export function useGameRenderer(): void {
  const cameraStatus = useCameraStore((state) => state.status)
  const rendererRef = useRef<GameRenderer | null>(null)

  useEffect(() => {
    if (cameraStatus !== 'ready') return

    const renderer = new GameRenderer()
    rendererRef.current = renderer
    renderer.start()

    return () => {
      renderer.stop()
      rendererRef.current = null
    }
  }, [cameraStatus])
}
