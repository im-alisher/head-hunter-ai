import { useCamera } from '@/hooks/useCamera'

interface CameraOverlayProps {
  onStart: () => void
}

export function CameraOverlay({ onStart }: CameraOverlayProps) {
  const { status, error, isRequesting } = useCamera()

  if (isRequesting) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm">
        <div className="size-10 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
        <p className="text-sm text-neutral-300">Requesting camera access…</p>
      </div>
    )
  }

  if (status === 'error' && error) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 p-8 text-center backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-red-400">Camera error</h2>
        <p className="max-w-md text-sm text-neutral-300">{error.message}</p>
        <button
          type="button"
          onClick={onStart}
          className="mt-2 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
        >
          Try again
        </button>
      </div>
    )
  }

  if (status === 'idle') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/60 p-8 text-center backdrop-blur-sm">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Head Hunter AI
        </h1>
        <p className="max-w-md text-sm text-neutral-300">
          Move your head to aim at targets. The camera is your controller.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="rounded-lg bg-emerald-500 px-8 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-400"
        >
          Start game
        </button>
      </div>
    )
  }

  return null
}
