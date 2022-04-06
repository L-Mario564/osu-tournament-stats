import { Scores, Result } from '../Stats/interfaces';
export interface SoloScore {
    beatmapId: string;
    userId: string;
    score: number;
    mods: string | null;
    accuracy: number;
    combo: number;
    count300: number;
    count100: number;
    count50: number;
    misses: number;
    team?: string;
    relativeScore?: number;
    zScore?: number;
    placement?: number;
}
export interface SoloResult extends Result {
    userId: string | number;
}
export interface SoloQualiferResults {
    scores: Scores[];
    results: SoloResult[];
}
//# sourceMappingURL=interfaces.d.ts.map