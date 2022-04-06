import Stats from '../Stats';
import { Beatmap, Match, Scores, Multiplier, Options } from '../Stats/interfaces';
import { SoloQualiferResults } from './interfaces';

/**
 * Class that manages the stats for solo tournaments
 * @param matches Array of JSON objects from the osu! API (v1) containing match data
 * @param mappool Array of objects containing the beatmap ID and other optional properties for specifying FreeMods and TieBreakers
 * @param players Array of player user IDs
 * @param freeModMultipliers Array of FreeMod multipliers containing the mods to apply to and the multiplier itself
 * @param options Object containing optional settings used when getting stats
 */
export default class SoloStats extends Stats {
  private players: string[]

  constructor(matches: Match[], mappool: Beatmap[], players: (string | number)[] = [], freeModMultipliers: Multiplier[], options: Options) {
    super(matches, mappool, freeModMultipliers, options)
    this.players = players.map((userId: string | number): string => userId.toString())
    this.tournamentType = 'solo'
  }

  /**
   * Returns an object containg two arrays:
   * - scores: An array of objects containing the beatmap ID and an array of players scores for that map
   * - results: An array containing the qualifier results
   * @param calculationMethod Calculation method to apply to the results
   */
  public getQualifierStats(calculationMethod: 'rank' | 'relative rank' | 'z-sum'): SoloQualiferResults {
    this.runChecks(this.players);
    let scores: Scores[] = this.getStats(this.players, true);
    return this.getQualifierResults(scores, this.players, null, (calculationMethod) ? calculationMethod : 'rank');
  }

  /**
   * Returns an array of objects containing the beatmap ID and an array of player scores for that map
   */
  public getBracketStats(): Scores[] {
    this.runChecks(this.players);
    return this.getStats(this.players);
  }
}