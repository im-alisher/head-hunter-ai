import { useGameCanvasStore } from '@/features/game/gameCanvasStore'

export function GameCanvas() {
  const registerCanvas = useGameCanvasStore((state) => state.registerCanvas)

  return (
    <canvas
      ref={registerCanvas}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
