import { Scores, Result } from '../Stats/interfaces';

export interface Team {
  name: string
  players: (string | number)[]
}

export interface Player {
  userId: string
  team: string
}

export interface TeamScore {
  beatmapId: string
  team: string
  totalScore: number
  averageAccuracy: number
  averageCombo: number
  relativeScore?: number
  zScore?: number
  placement?: number
}

export interface TeamResult extends Result {
  team: string
}

export interface TeamQualiferResults {
  scores: Scores[]
  results: TeamResult[]
}