import { TeamScore } from '../TeamStats/interfaces';
import { SoloScore } from '../SoloStats/interfaces';
declare type Mods = 'NM' | 'EZ' | 'HD' | 'HR' | 'DT' | 'NC' | 'HT' | 'FL' | 'EZHD' | 'EZDT' | 'EZNC' | 'EZHT' | 'EZFL' | 'HDHR' | 'HDDT' | 'HDNC' | 'HDHT' | 'HDFL' | 'HRDT' | 'HRNC' | 'HRHT' | 'HRFL' | 'DTFL' | 'NCFL' | 'HTFL';
export interface Options {
    filterFailed?: boolean;
    filterTieBreakersPlayedForFun?: boolean;
    applyMultipliersToTieBreaker?: boolean;
    filterIfNoScores?: boolean;
}
export interface Mappool {
    beatmaps: Beatmap[];
    freeMods: Beatmap[];
    tieBreakers: Beatmap[];
}
export interface Beatmap {
    beatmapId: string | number;
    isFreeMod?: boolean;
    isTieBreaker?: boolean;
}
export interface Match {
    match: {
        match_id: string | number;
        start_time: string;
        end_time: string | null;
    };
    games: Game[];
}
export interface Game {
    game_id: string | number;
    start_time: string;
    end_time: string;
    beatmap_id: string | number;
    play_mode: string | number;
    match_type: string | number;
    scoring_type: string | number;
    team_type: string | number;
    mods: string | number;
    scores: Score[];
}
export interface Score {
    slot: string | number;
    team: string | number;
    user_id: string | number;
    score: string | number;
    maxcombo: string | number;
    rank: string | number;
    count50: string | number;
    count100: string | number;
    count300: string | number;
    countmiss: string | number;
    countgeki: string | number;
    countkatu: string | number;
    accuracy?: number;
    perfect: string | number;
    pass: string | number;
    enabled_mods: string | number | null;
    enabled_mods_string?: string;
}
export interface Multiplier {
    mods: Mods;
    multiplier: number;
}
export interface Scores {
    beatmapId: string;
    soloScores: SoloScore[];
    teamScores?: TeamScore[];
}
export interface BeatmapStats {
    beatmapId: string;
    scores: number[];
    highestScore: number;
    average: number;
    stdDev: number;
}
export interface ResultValues {
    totalRank: number;
    relativeRank: number;
    zScore: number;
}
export interface Result {
    totalRank: number;
    relativeRank: number;
    zScore: number;
    placement?: number;
}
export {};
//# sourceMappingURL=interfaces.d.ts.map