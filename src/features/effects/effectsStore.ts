import { create } from 'zustand'
import type { Particle } from '@/game/particles'

export interface HitRing {
  id: string
  x: number
  y: number
  bornAt: number
}

interface EffectsStore {
  particles: Particle[]
  rings: HitRing[]
  lastHitAt: number | null
  setParticles: (particles: Particle[]) => void
  setRings: (rings: HitRing[]) => void
  setLastHitAt: (lastHitAt: number | null) => void
}

export const useEffectsStore = create<EffectsStore>()((set) => ({
  particles: [],
  rings: [],
  lastHitAt: null,
  setParticles: (particles) => set({ particles }),
  setRings: (rings) => set({ rings }),
  setLastHitAt: (lastHitAt) => set({ lastHitAt }),
}))
