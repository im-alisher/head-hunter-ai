import { create } from 'zustand'
import type { FaceDetection } from '@/services/vision/types'

export type DetectionStatus = 'idle' | 'initializing' | 'ready' | 'error'

interface DetectionStore {
  status: DetectionStatus
  error: string | null
  lastDetection: FaceDetection | null
  debugCanvas: HTMLCanvasElement | null
  registerDebugCanvas: (canvas: HTMLCanvasElement | null) => void
}

export const useDetectionStore = create<DetectionStore>()((set, get) => ({
  status: 'idle',
  error: null,
  lastDetection: null,
  debugCanvas: null,

  registerDebugCanvas: (canvas) => {
    if (canvas === get().debugCanvas) return
    set({ debugCanvas: canvas })
  },
}))
