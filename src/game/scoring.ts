export interface ScoreStats {
  score: number
  combo: number
  bestCombo: number
  hits: number
  misses: number
}

export const HIT_POINTS = 100
export const COMBO_BONUS = 50

export function createInitialScore(): ScoreStats {
  return { score: 0, combo: 0, bestCombo: 0, hits: 0, misses: 0 }
}

export function applyHit(stats: ScoreStats): ScoreStats {
  const combo = stats.combo + 1
  const gained = HIT_POINTS + (combo - 1) * COMBO_BONUS

  return {
    score: stats.score + gained,
    combo,
    bestCombo: Math.max(stats.bestCombo, combo),
    hits: stats.hits + 1,
    misses: stats.misses,
  }
}

export function applyMiss(stats: ScoreStats): ScoreStats {
  return {
    score: stats.score,
    combo: 0,
    bestCombo: stats.bestCombo,
    hits: stats.hits,
    misses: stats.misses + 1,
  }
}
