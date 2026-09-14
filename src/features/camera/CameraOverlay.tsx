import { useCamera } from '@/hooks/useCamera'

interface CameraOverlayProps {
  onStart: () => void
}

const TIPS = [
  {
    title: 'Aim',
    caption: 'Steer the reticle with your head',
  },
  {
    title: 'Fire',
    caption: 'Sweep the crosshair over a target',
  },
  {
    title: 'Combo',
    caption: 'Chain rapid hits for a multiplier',
  },
] as const

function AmbientGlows() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-32 -top-40 size-96 animate-float rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute -bottom-44 -right-32 size-[28rem] animate-float rounded-full bg-violet-600/25 blur-3xl [animation-delay:-3s]" />
      <div className="absolute left-1/2 top-1/3 size-72 -translate-x-1/2 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(4,7,14,0.7)_100%)]" />
    </div>
  )
}

export function CameraOverlay({ onStart }: CameraOverlayProps) {
  const { status, error, isRequesting } = useCamera()

  if (isRequesting) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[#070b12]/80 backdrop-blur-md">
        <div className="relative size-14">
          <div className="absolute inset-0 animate-float rounded-full bg-emerald-400/25 blur-2xl" />
          <div className="relative size-14 animate-spin rounded-full border-2 border-emerald-400/20 border-t-emerald-400" />
        </div>
        <p className="text-sm font-medium text-neutral-300">
          Requesting camera access…
        </p>
      </div>
    )
  }

  if (status === 'error' && error) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[#070b12]/85 p-8 text-center backdrop-blur-md">
        <div className="flex size-14 animate-float items-center justify-center rounded-full border border-red-400/30 bg-red-400/10 text-2xl font-bold text-red-300">
          !
        </div>
        <h2 className="text-2xl font-bold text-white">Camera error</h2>
        <p className="max-w-md text-sm text-neutral-300">{error.message}</p>
        <button
          type="button"
          onClick={onStart}
          className="mt-2 rounded-xl border border-red-400/30 bg-red-400/10 px-8 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-400/20"
        >
          Try again
        </button>
      </div>
    )
  }

  if (status === 'idle') {
    return (
      <div className="absolute inset-0 overflow-hidden bg-[#070b12] text-center">
        <AmbientGlows />

        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6 p-8">
          <span className="animate-fade-in-up rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-300">
            Webcam aim trainer
          </span>

          <h1
            className="animate-fade-in-up max-w-3xl bg-gradient-to-r from-emerald-300 via-teal-200 to-violet-300 bg-clip-text text-6xl font-black tracking-tight text-transparent drop-shadow-[0_0_30px_rgba(52,211,153,0.35)] sm:text-7xl"
            style={{ animationDelay: '80ms' }}
          >
            Head Hunter AI
          </h1>

          <p
            className="max-w-md animate-fade-in-up text-sm leading-relaxed text-neutral-300"
            style={{ animationDelay: '160ms' }}
          >
            Your face is the controller. Move your head to aim, sweep the
            reticle over a target to destroy it, and chain hits to build your
            combo.
          </p>

          <div className="mt-2 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            {TIPS.map((tip, index) => (
              <div
                key={tip.title}
                className="animate-fade-in-up rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
                style={{ animationDelay: `${240 + index * 80}ms` }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-gradient-to-r from-emerald-400 to-violet-400" />
                  <span className="text-sm font-semibold text-white">
                    {tip.title}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-neutral-400">
                  {tip.caption}
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onStart}
            className="group mt-4 animate-fade-in-up rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 px-12 py-4 text-lg font-bold text-emerald-950 shadow-[0_0_28px_rgba(16,185,129,0.45)] transition duration-200 hover:scale-105 hover:shadow-[0_0_48px_rgba(16,185,129,0.7)] active:scale-95"
            style={{ animationDelay: '480ms' }}
          >
            <span className="inline-block transition-transform duration-200 group-hover:-translate-y-0.5">
              Start game
            </span>
          </button>

          <p className="absolute bottom-5 text-xs text-neutral-500">
            All processing happens on-device — your camera feed never leaves
            this browser.
          </p>
        </div>
      </div>
    )
  }

  return null
}
