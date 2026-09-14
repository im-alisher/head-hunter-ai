import { useEffect } from 'react'
import { useCameraStore } from '@/features/camera/cameraStore'
import { useFpsStore } from '@/features/hud/fpsStore'

export function useFps(): void {
  const cameraStatus = useCameraStore((state) => state.status)

  useEffect(() => {
    if (cameraStatus !== 'ready') return

    let rafId = 0
    let frames = 0
    let windowStart = performance.now()
    const setFps = useFpsStore.getState().setFps

    const loop = (): void => {
      frames += 1
      const now = performance.now()

      if (now - windowStart >= 1000) {
        setFps(frames)
        frames = 0
        windowStart = now
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      useFpsStore.getState().setFps(0)
    }
  }, [cameraStatus])
}
