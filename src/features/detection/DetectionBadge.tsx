import type { DetectionStatus } from '@/features/detection/detectionStore'
import { useDetectionStore } from '@/features/detection/detectionStore'

const STATUS_LABELS: Record<DetectionStatus, string> = {
  idle: 'Detection idle',
  initializing: 'Loading detection model…',
  ready: 'Face tracking active',
  error: 'Detection error',
}

const STATUS_STYLES: Record<DetectionStatus, string> = {
  idle: 'border-white/10 bg-white/5 text-neutral-300',
  initializing: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  ready: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  error: 'border-red-400/30 bg-red-400/10 text-red-300',
}

export function DetectionBadge() {
  const status = useDetectionStore((state) => state.status)

  return (
    <div className="absolute right-3 top-3">
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl ${STATUS_STYLES[status]}`}
      >
        <span className="relative flex size-2">
          {status === 'ready' && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          )}
          <span className="relative inline-flex size-2 rounded-full bg-current" />
        </span>
        {STATUS_LABELS[status]}
      </span>
    </div>
  )
}
