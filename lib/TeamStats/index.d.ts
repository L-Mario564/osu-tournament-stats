import Stats from '../Stats';
import { Beatmap, Match, Scores, Multiplier, Options } from '../Stats/interfaces';
import { Team, TeamQualiferResults } from './interfaces';
export default class TeamStats extends Stats {
    private teams;
    private players;
    constructor(matches: Match[], mappool: Beatmap[], teams: Team[] | undefined, freeModMultipliers: Multiplier[], options: Options);
    getQualifierStats(calculationMethod: 'rank' | 'relative rank' | 'z-sum'): TeamQualiferResults;
    getBracketStats(): Scores[];
}
//# sourceMappingURL=index.d.ts.map