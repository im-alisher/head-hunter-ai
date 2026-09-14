import { create } from 'zustand'
import type { Point2D } from '@/types/geometry'

interface TrackingStore {
  position: Point2D | null
  isTracking: boolean
  confidence: number
  resetTracking: () => void
}

export const useTrackingStore = create<TrackingStore>()((set) => ({
  position: null,
  isTracking: false,
  confidence: 0,
  resetTracking: () =>
    set({ position: null, isTracking: false, confidence: 0 }),
}))
