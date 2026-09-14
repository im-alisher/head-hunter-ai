import { create } from 'zustand'

interface FpsStore {
  fps: number
  setFps: (fps: number) => void
}

export const useFpsStore = create<FpsStore>()((set) => ({
  fps: 0,
  setFps: (fps) => set({ fps }),
}))
