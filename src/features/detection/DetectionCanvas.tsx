import { useDetectionStore } from '@/features/detection/detectionStore'

export function DetectionCanvas() {
  const registerDebugCanvas = useDetectionStore(
    (state) => state.registerDebugCanvas,
  )

  return (
    <canvas
      ref={registerDebugCanvas}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
