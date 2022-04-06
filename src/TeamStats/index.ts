import Stats from '../Stats';
import { Beatmap, Match, Scores, Multiplier, Options } from '../Stats/interfaces';
import { Team, Player, TeamQualiferResults } from './interfaces';
import { Utils } from '../utils';

/**
 * Class that manages the stats for team tournaments
 * @param matches Array of JSON objects from the osu! API (v1) containing match data
 * @param mappool Array of objects containing the beatmap ID and other optional properties for specifying FreeMods and TieBreakers
 * @param teams Array of objects containing the team name and an array of the user IDs of each player in that team
 * @param freeModMultipliers Array of FreeMod multipliers containing the mods to apply to and the multiplier itself
 * @param options Object containing optional settings used when getting stats
 */
export default class TeamStats extends Stats {
  private teams: string[]
  private players: Player[]

  constructor(matches: Match[], mappool: Beatmap[], teams: Team[] = [], freeModMultipliers: Multiplier[], options: Options) {
    super(matches, mappool, freeModMultipliers, options)
    this.teams = teams.map(({ name }: Team): string => name);
    this.players = Utils.toSingleArray(teams.map(({ name, players }: Team): Player[] => {
      return players.map((userId: string | number): Player => {
        return {
          userId: userId.toString(),
          team: name
        };
      });
    }))
    this.tournamentType = 'teams'
  }

  /**
   * Returns an object containg two arrays:
   * - scores: An array of objects containing the beatmapID, an array of players scores and an array of team scores for that map
   * - results: An array containing the qualifier results
   * @param calculationMethod Calculation method to apply to the results
   */
  public getQualifierStats(calculationMethod: 'rank' | 'relative rank' | 'z-sum'): TeamQualiferResults {
    this.runChecks(this.players);
    let scores: Scores[] = this.getStats(this.players, true);
    return this.getQualifierResults(scores, null, this.teams, (calculationMethod) ? calculationMethod : 'rank');
  }

  /**
   * Returns an array of objects containing the beatmap ID, an array of player scores and an array of team scores for that map
   */
  public getBracketStats(): Scores[] {
    this.runChecks(this.players);
    return this.getStats(this.players);
  }
}