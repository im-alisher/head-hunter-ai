import { useDetectionStore } from '@/features/detection/detectionStore'
import { useTrackingStore } from '@/features/tracking/trackingStore'

export function TrackingBadge() {
  const detectionStatus = useDetectionStore((state) => state.status)
  const isTracking = useTrackingStore((state) => state.isTracking)

  if (detectionStatus !== 'ready') return null

  return (
    <div className="absolute right-3 top-14">
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
          isTracking
            ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
            : 'border-amber-400/40 bg-amber-400/10 text-amber-300'
        }`}
      >
        <span className="relative flex size-2">
          {isTracking && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          )}
          <span className="relative inline-flex size-2 rounded-full bg-current" />
        </span>
        {isTracking ? 'Head locked' : 'Searching for head…'}
      </span>
    </div>
  )
}
