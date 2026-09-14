import { create } from 'zustand'

interface GameCanvasStore {
  canvas: HTMLCanvasElement | null
  registerCanvas: (canvas: HTMLCanvasElement | null) => void
}

export const useGameCanvasStore = create<GameCanvasStore>()((set, get) => ({
  canvas: null,

  registerCanvas: (canvas) => {
    if (canvas === get().canvas) return
    set({ canvas })
  },
}))
