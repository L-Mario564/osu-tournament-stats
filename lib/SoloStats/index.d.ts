import Stats from '../Stats';
import { Beatmap, Match, Scores, Multiplier, Options } from '../Stats/interfaces';
import { SoloQualiferResults } from './interfaces';
export default class SoloStats extends Stats {
    private players;
    constructor(matches: Match[], mappool: Beatmap[], players: (string | number)[] | undefined, freeModMultipliers: Multiplier[], options: Options);
    getQualifierStats(calculationMethod: 'rank' | 'relative rank' | 'z-sum'): SoloQualiferResults;
    getBracketStats(): Scores[];
}
//# sourceMappingURL=index.d.ts.map