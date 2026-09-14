import { create } from 'zustand'
import type { Target } from '@/game/targets'

interface TargetStore {
  targets: Target[]
  setTargets: (targets: Target[]) => void
}

export const useTargetStore = create<TargetStore>()((set) => ({
  targets: [],
  setTargets: (targets) => set({ targets }),
}))
