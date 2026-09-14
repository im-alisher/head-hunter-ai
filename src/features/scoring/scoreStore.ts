import { create } from 'zustand'
import { createInitialScore, type ScoreStats } from '@/game/scoring'

interface ScoreStore extends ScoreStats {
  resetScore: () => void
}

export const useScoreStore = create<ScoreStore>()((set) => ({
  ...createInitialScore(),
  resetScore: () => set(createInitialScore()),
}))
