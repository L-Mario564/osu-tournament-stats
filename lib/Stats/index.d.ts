import { Mappool, Beatmap, Match, Game, Multiplier, Options, Scores } from './interfaces';
export default class Stats {
    protected options: Options;
    protected mappool: Mappool;
    protected matches: Game[][];
    protected freeModMultipliers: Multiplier[];
    protected tournamentType?: 'solo' | 'teams';
    constructor(matches?: Match[], mappool?: Beatmap[], freeModMultipliers?: Multiplier[], options?: Options);
    protected getStats(players: any[], isQuals?: boolean): Scores[];
    protected getQualifierResults(scores: Scores[], players: (string | number)[] | null, teams: string[] | null, calculationMethod: 'rank' | 'relative rank' | 'z-sum'): {
        scores: Scores[];
        results: any[];
    };
    private getResultValues;
    protected runChecks(players: any[]): void;
}
//# sourceMappingURL=index.d.ts.map