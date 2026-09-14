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
      <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
        <div className="rounded-lg border border-neutral-700/60 bg-neutral-900/50 px-4 py-2 backdrop-blur-sm">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
            Score
          </span>
          <div className="font-mono text-3xl font-bold tabular-nums leading-tight text-white">
            {formatScore(score)}
          </div>
        </div>

        {combo >= 2 && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 backdrop-blur-sm">
            <span className="font-mono text-lg font-bold tabular-nums text-emerald-300">
              ×{combo}
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300/80">
              combo
            </span>
            <span className="text-xs text-neutral-400">best {bestCombo}</span>
          </div>
        )}

        <div className="rounded-lg border border-neutral-700/60 bg-neutral-900/50 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
            Accuracy
          </span>
          <div className="font-mono text-lg font-semibold tabular-nums leading-tight text-white">
            {accuracy === null ? '–' : `${accuracy}%`}
          </div>
        </div>
      </div>

      <div
        className={`absolute bottom-3 left-3 rounded-lg border bg-neutral-900/50 px-3 py-1.5 font-mono text-sm tabular-nums backdrop-blur-sm ${fpsTone}`}
      >
        {fps} FPS
      </div>
    </>
  )
}
