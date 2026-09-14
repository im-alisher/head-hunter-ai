import { useCameraStore } from '@/features/camera/cameraStore'
import { useFpsStore } from '@/features/hud/fpsStore'
import { useScoreStore } from '@/features/scoring/scoreStore'

function formatScore(score: number): string {
  return score.toLocaleString('en-US')
}

export function GameHUD() {
  const isReady = useCameraStore((state) => state.status === 'ready')
  const score = useScoreStore((state) => state.score)
  const combo = useScoreStore((state) => state.combo)
  const bestCombo = useScoreStore((state) => state.bestCombo)
  const hits = useScoreStore((state) => state.hits)
  const misses = useScoreStore((state) => state.misses)
  const fps = useFpsStore((state) => state.fps)

  if (!isReady) return null

  const shots = hits + misses
  const accuracy = shots === 0 ? null : Math.round((hits / shots) * 100)
  const fpsTone =
    fps >= 50
      ? 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10'
      : fps >= 30
        ? 'text-amber-300 border-amber-400/30 bg-amber-400/10'
        : 'text-red-300 border-red-400/30 bg-red-400/10'

  return (
    <>
      <div className="absolute left-3 top-3 flex flex-col items-start gap-2.5">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-violet-400" />
          <div className="px-4 pb-3 pt-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
              Score
            </span>
            <div className="mt-0.5 font-mono text-4xl font-black tabular-nums leading-tight text-white drop-shadow-[0_0_14px_rgba(52,211,153,0.35)]">
              {formatScore(score)}
            </div>
          </div>
        </div>

        {combo >= 2 && (
          <div className="animate-fade-in-up flex items-center gap-3 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 shadow-[0_0_22px_rgba(16,185,129,0.25)] backdrop-blur-xl">
            <span className="font-mono text-2xl font-black tabular-nums text-emerald-300">
              ×{combo}
            </span>
            <div className="leading-tight">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
                Combo
              </span>
              <span className="block text-xs text-neutral-400">
                best {bestCombo}
              </span>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-neutral-900/60 px-4 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300/90">
            Accuracy
          </span>
          <div className="mt-0.5 font-mono text-2xl font-bold tabular-nums leading-tight text-white">
            {accuracy === null ? '–' : `${accuracy}%`}
          </div>
          {accuracy !== null && (
            <div className="mt-1.5 h-1 w-28 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${accuracy}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <div
        className={`absolute bottom-3 left-3 rounded-xl border px-3 py-1.5 font-mono text-sm tabular-nums shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl ${fpsTone}`}
      >
        {fps} FPS
      </div>
    </>
  )
}
