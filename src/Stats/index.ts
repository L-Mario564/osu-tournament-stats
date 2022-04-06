import { Player } from '../TeamStats/interfaces';
import { Mappool, Beatmap, Match, Game, Score, Multiplier, Options, Scores, BeatmapStats, ResultValues } from './interfaces';
import { SoloScore, SoloResult } from '../SoloStats/interfaces';
import { TeamScore, TeamResult } from '../TeamStats/interfaces';
import { Utils, MathUtils } from '../utils';

export default class Stats {
  protected options: Options
  protected mappool: Mappool
  protected matches: Game[][]
  protected freeModMultipliers: Multiplier[]
  protected tournamentType?: 'solo' | 'teams'

  constructor(matches: Match[] = [], mappool: Beatmap[] = [], freeModMultipliers: Multiplier[] = [], options: Options = {}) {
    this.options = {
      filterFailed: (options.filterFailed) ? options.filterFailed : false,
      filterTieBreakersPlayedForFun: (options.filterTieBreakersPlayedForFun) ? options.filterTieBreakersPlayedForFun : true,
      applyMultipliersToTieBreaker: (options.applyMultipliersToTieBreaker) ? options.applyMultipliersToTieBreaker : true,
      filterIfNoScores: (options.filterIfNoScores) ? options.filterIfNoScores : true
    }
    this.mappool = {
      beatmaps: mappool,
      freeMods: mappool.filter(({ isFreeMod }: Beatmap): boolean => isFreeMod!),
      tieBreakers: mappool.filter(({ isTieBreaker }: Beatmap): boolean => isTieBreaker!)
    }
    this.matches = matches.map(({ games }) => games)
    this.freeModMultipliers = (freeModMultipliers) ? freeModMultipliers : []
  }

  protected getStats(players: any[], isQuals?: boolean): Scores[] {
    let { beatmaps, freeMods, tieBreakers } = this.mappool;
    let { filterFailed, filterTieBreakersPlayedForFun, applyMultipliersToTieBreaker } = this.options;
    let beatmapIds: (string | number)[] = beatmaps.map(({ beatmapId }: Beatmap): string | number => beatmapId);
    let freeModIds: (string | number)[] = (freeMods.length > 0) ? freeMods.map(({ beatmapId }: Beatmap): string | number => beatmapId) : [];
    let tieBreakerIds: (string | number)[] = (tieBreakers.length > 0) ? tieBreakers.map(({ beatmapId }: Beatmap): string | number => beatmapId) : [];

    let userIds: string[];

    if (this.tournamentType === 'teams') {
      userIds = players.map(({ userId }: Player): string => userId);
    } else {
      userIds = players;
    }

    let soloScores: SoloScore[] = [];
    let teamScores: TeamScore[] = [];

    this.matches.forEach((games: Game[]): void => {
      // Filter warmups
      games = games.filter(({ beatmap_id }: Game): boolean => {
        return beatmapIds.some((beatmapId: string | number): boolean => beatmapId == beatmap_id);
      });

      if (games.length == 0) return;

      // Filter beatmaps that are replayed, leaving the last game of that beatmap as the one to use for stats (this doesn't apply to qualifiers)
      if (!isQuals) {
        let playedMaps: (string | number)[] = games.map(({ beatmap_id }: Game): string | number => beatmap_id);
  
        let indexes: number[] = playedMaps.map((beatmapId: string | number): number => playedMaps.lastIndexOf(beatmapId));
        indexes = [... new Set(indexes)];
  
        games = indexes.map((index: number): Game => games[index]);
      }
      
      // Filter beatmaps played after TB
      let tieBreakerWasPlayed: boolean = games.filter(({ beatmap_id }: Game): boolean => {
        return tieBreakerIds.some((tieBreaker: string | number): boolean => tieBreaker == beatmap_id);
      }).length > 0

      if (tieBreakerWasPlayed) {
        let indexOfPlayedTieBreaker: number;

        for (let i: number = 0; i < games.length; i++) {
          if (tieBreakerIds.some((tieBreaker: string | number): boolean => tieBreaker == games[i].beatmap_id)) {
            indexOfPlayedTieBreaker = i;
            break;
          }
        }

        games.splice(indexOfPlayedTieBreaker!, games.length - indexOfPlayedTieBreaker!);
      }

      if (games.length == 0) return;

      // Apply mod multipliers to FM and/or TB maps
      if ((freeMods.length > 0 || tieBreakers.length > 0) && this.freeModMultipliers.length > 0) {
        let freeModMaps: (string | number)[] = (applyMultipliersToTieBreaker) ? freeModIds.concat(tieBreakerIds) : freeModIds;
        
        enum Mods {
          EZ = 2,
          HD = 8,
          HR = 16,
          DT = 64,
          HT = 256,
          NC = 512,
          FL = 1024,
        };
    
        let values: number[] = Object.values(Mods)
        .filter((value: string | Mods): boolean => typeof value === 'number')
        .map((value: string | Mods): number => Number(value))
        .reverse();
    
        let multiplierMods: string[] = this.freeModMultipliers.map(({ mods }: Multiplier) => mods);
    
        games = games.map((game: Game): Game => {
          if (!freeModMaps.some((freeMod: string | number): boolean => freeMod == game.beatmap_id)) return game;
    
          let globalMods: number = Number(game.mods); 
    
          game.scores = game.scores.map((score: Score): Score => {
            let modEnum: number = Number(score.enabled_mods) + globalMods;
    
            let mods: string[] = [];
            values.forEach((value: number): any => {
              if (modEnum - value >= 0) {
                modEnum -= value;
                mods.push(Mods[value]);
              }
            });
    
            let modsString: string = mods.reduce((prev: string, current: string): string => `${prev}${current}`, '');
            score.enabled_mods_string = (modsString) ? modsString : 'NM';
    
            if (multiplierMods.some((mod: string): boolean => mod === modsString)) {
              let index: number = multiplierMods.indexOf(modsString);
              score.score = Number(score.score) * this.freeModMultipliers[index].multiplier;
            }
    
            return score;
          });
    
          return game;
        });
      }

      // filter TBs played for fun
      if (tieBreakerWasPlayed && filterTieBreakersPlayedForFun) {
        let filterTieBreaker: boolean;

        if (this.tournamentType === 'teams') {
          let team1Points: number = 0;
          let team2Points: number = 0;

          games.forEach((game: Game): void => {
            if (tieBreakerIds.some((tieBreaker: string | number): boolean => tieBreaker == game.beatmap_id)) return;

            let team1Scores: Score[] = game.scores.filter(({ team }: Score): boolean => team == '1');
            let team2Scores: Score[] = game.scores.filter(({ team }: Score): boolean => team == '2');

            let team1Score: number = (team1Scores.length > 0) ? MathUtils.sum(team1Scores, 'score') : 0;
            let team2Score: number = (team2Scores.length > 0) ? MathUtils.sum(team2Scores, 'score') : 0;

            if (team1Score > team2Score) team1Points++;
            else if (team2Score > team1Score) team2Points++;
          });

          if (team1Points !== team2Points) {
            filterTieBreaker = true
          }
        } else {
          let player1Points: number = 0;
          let player2Points: number = 0;

          games.forEach((game: Game): void => {
            if (tieBreakerIds.some((tieBreaker: string | number): boolean => tieBreaker == game.beatmap_id)) return;
            let players: (string | number)[] = [... new Set(game.scores.map(({ user_id }: Score): string | number => user_id))];

            if (players.length > 2) {
              players = players.filter((userId: (string | number)): boolean => {
                return userIds.some((player: string | number): boolean => player == userId);
              });
            }

            let player1Scores: Score[] = game.scores.filter(({ user_id }: Score): boolean => user_id == players[0]);
            let player2Scores: Score[] = game.scores.filter(({ user_id }: Score): boolean => user_id == players[1]);

            let player1Score: number = (player1Scores[0].score) ? Number(player1Scores[0].score) : 0;
            let player2Score: number = (player2Scores[0].score) ? Number(player2Scores[0].score) : 0;

            if (player1Score > player2Score) player1Points++;
            else if (player2Score > player1Score) player2Points++;
          });

          if (player1Points !== player2Points) {
            filterTieBreaker = true
          }
        }

        if (filterTieBreaker!) {
          games = games.filter((game: Game): boolean => {
            return !tieBreakerIds.some((tieBreaker: string | number): boolean => tieBreaker == game.beatmap_id);
          });
        }
      }

      if (games.length == 0) return;

      // Filter failed scores
      if (filterFailed) {
        games = games.map((game: Game): Game => {
          game.scores = game.scores.filter((score: Score): boolean => score.pass == '1');
          return game;
        });
      }

      if (games.length == 0) return;

      // Filter players that aren't in the team listing
      games = games.map((game: Game): Game => {
        game.scores = game.scores.filter((score: Score): boolean => {
          return userIds.some((player: string | number): boolean => player == score.user_id);
        });

        return game;
      });

      let solo: SoloScore[] = Utils.toSingleArray(games.map((game: Game): SoloScore[] => {
        let { beatmap_id } = game;

        let scores: SoloScore[] = game.scores.map((score: Score): SoloScore => {
          let { count300, count100, count50, countmiss, user_id, enabled_mods_string, maxcombo } = score;
          count300 = Number(count300);
          count100 = Number(count100);
          count50 = Number(count50);
          countmiss = Number(countmiss);

          let accuracy = (((50 * count50) + (100 * count100) + (300 * count300)) / (300 * (countmiss + count50 + count100 + count300))) * 100;

          let newScore: SoloScore = {
            beatmapId: beatmap_id.toString(),
            userId: user_id.toString(),
            score: Number(score.score),
            mods: (enabled_mods_string) ? enabled_mods_string : null,
            accuracy,
            combo: Number(maxcombo),
            count300,
            count100,
            count50,
            misses: countmiss
          };

          if (this.tournamentType === 'teams') {
            newScore.team = players[userIds.indexOf(user_id.toString())].team;
          }

          return newScore;
        });

        return scores;
      }));

      soloScores.push(... solo);

      if (this.tournamentType === 'teams') {
        solo.map(({ beatmapId, team }: SoloScore): any => {
          return {
            beatmapId,
            team: team!
          };
        })
        .filter((obj: any, i: number, array: any[]): any => {
          return i === array.findIndex((obj1: any) => (
            obj1.beatmapId === obj.beatmapId && obj1.team === obj.team
          ));
        })
        .forEach(({ beatmapId, team }: any): void => {
          let scores: SoloScore[] = solo.filter((score: SoloScore): boolean => score.team === team && score.beatmapId === beatmapId);
  
          let totalScore: number = MathUtils.sum(scores, 'score');
          let averageAccuracy: number = MathUtils.average(scores, 'accuracy');
          let averageCombo: number = MathUtils.average(scores, 'combo');

          teamScores.push({ beatmapId, team, totalScore, averageAccuracy, averageCombo });
        });
      }
    });

    return beatmapIds.map((beatmapId: string | number): any => {
      beatmapId = beatmapId.toString();
      let solo: SoloScore[] = Utils.sort(soloScores.filter((score: SoloScore): boolean => score.beatmapId == beatmapId), 'descending', 'score')
      .map((score: SoloScore, i: number): SoloScore => {
        score.placement = i + 1;
        return score;
      });
      
      if (this.tournamentType === 'teams') {
        let teams: TeamScore[] = Utils.sort(teamScores.filter((score: TeamScore): boolean => score.beatmapId == beatmapId), 'descending', 'totalScore')
        .map((score: TeamScore, i: number): TeamScore => {
          score.placement = i + 1;
          return score;
        });

        return { beatmapId, soloScores: solo, teamScores: teams };
      }

      return { beatmapId, soloScores: solo };
    });
  }

  protected getQualifierResults(scores: Scores[], players: (string | number)[] | null, teams: string[] | null, calculationMethod: 'rank' | 'relative rank' | 'z-sum'): { scores: Scores[], results: any[] } {
    let key: string;
    let scoresRef: any[];

    if (this.tournamentType === 'solo') {
      scoresRef = scores.map(({ soloScores }: Scores): SoloScore[] => soloScores);
      key = 'score';
    } else {
      scoresRef = scores.map(({ teamScores }: Scores): TeamScore[] => teamScores!);
      key = 'totalScore';
    }

    let beatmapStats: BeatmapStats[] = this.mappool.beatmaps.map(({ beatmapId }: Beatmap, i: number): BeatmapStats => {
      let filteredScores: number[] = scoresRef[i].filter((score: any): boolean => score.beatmapId == beatmapId)
      .map((score: any): number => score[key]);

      let scoreAverage: number = MathUtils.average(filteredScores);

      return {
        beatmapId: beatmapId.toString(),
        scores: filteredScores,
        highestScore: Math.max(... filteredScores),
        average: scoreAverage,
        stdDev: MathUtils.stdDev(filteredScores, scoreAverage)
      };
    });

    let resultsScores: any[] = Utils.toSingleArray(
      scoresRef.map((scores: any[], i: number): any[] => {
        let { highestScore, average, stdDev } = beatmapStats[i];

        return scores.map((score: any): any => {
          score.zScore = MathUtils.normStdDist((score[key] - average) / stdDev);
          score.relativeScore = score[key] / highestScore;
          return score;
        })
      })
    );

    let results: any[];

    if (this.tournamentType === 'solo') {
      results = players!.map((player: string | number): SoloResult => {
        let soloScores: SoloScore[] = resultsScores.filter((score: SoloScore): boolean => score.userId == player);
        let { totalRank, relativeRank, zScore } = this.getResultValues(soloScores);
        return { userId: player, totalRank, relativeRank, zScore };
      });
    } else {
      results = teams!.map((team: string): TeamResult => {
        let teamScores: TeamScore[] = resultsScores.filter((score: TeamScore): boolean => score.team === team);
        let { totalRank, relativeRank, zScore } = this.getResultValues(teamScores);
        return { team, totalRank, relativeRank, zScore };
      });
    }

    if (this.options.filterIfNoScores) {
      results = results.filter(({ totalRank }: SoloResult | TeamResult): boolean => totalRank !== Infinity);
    }

    switch (calculationMethod) {
      case 'rank':
        results = Utils.sort(results, 'ascending', 'totalRank');
        break;
      case 'relative rank':
        results = Utils.sort(results, 'descending', 'relativeRank');
        break;
      case 'z-sum':
        results = Utils.sort(results, 'descending', 'zScore');
        break;
    }

    results = results.map((result: SoloResult | TeamResult, i: number): SoloResult | TeamResult => {
      result.placement = i + 1;
      return result;
    });

    return { scores, results };
  }

  private getResultValues(scores: any[]): ResultValues {
    if (scores.length === 0) {
      return {
        totalRank: Infinity,
        relativeRank: 0,
        zScore: 0
      };
    }

    let totalRank: number = MathUtils.sum(scores, 'placement');
    let relativeRank: number = MathUtils.sum(scores, 'relativeScore');
    let zScore: number = MathUtils.sum(scores, 'zScore');

    return { totalRank, relativeRank, zScore };
  }

  protected runChecks(players: any[]): void {
    if (this.matches.length === 0) throw new Error('No match data has been provided');
    if (this.mappool.beatmaps.length === 0) throw new Error('No mappool has been provided');
    if (players.length === 0) {
      let message: string = (this.tournamentType === 'solo') ? 'No player user IDs have been provided' : 'No team data has been provided';
      throw new Error(message);
    }
  }
}