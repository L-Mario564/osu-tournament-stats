"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
class Stats {
    constructor(matches = [], mappool = [], freeModMultipliers = [], options = {}) {
        this.options = {
            filterFailed: (options.filterFailed) ? options.filterFailed : false,
            filterTieBreakersPlayedForFun: (options.filterTieBreakersPlayedForFun) ? options.filterTieBreakersPlayedForFun : true,
            applyMultipliersToTieBreaker: (options.applyMultipliersToTieBreaker) ? options.applyMultipliersToTieBreaker : true,
            filterIfNoScores: (options.filterIfNoScores) ? options.filterIfNoScores : true
        };
        this.mappool = {
            beatmaps: mappool,
            freeMods: mappool.filter(({ isFreeMod }) => isFreeMod),
            tieBreakers: mappool.filter(({ isTieBreaker }) => isTieBreaker)
        };
        this.matches = matches.map(({ games }) => games);
        this.freeModMultipliers = (freeModMultipliers) ? freeModMultipliers : [];
    }
    getStats(players, isQuals) {
        let { beatmaps, freeMods, tieBreakers } = this.mappool;
        let { filterFailed, filterTieBreakersPlayedForFun, applyMultipliersToTieBreaker } = this.options;
        let beatmapIds = beatmaps.map(({ beatmapId }) => beatmapId);
        let freeModIds = (freeMods.length > 0) ? freeMods.map(({ beatmapId }) => beatmapId) : [];
        let tieBreakerIds = (tieBreakers.length > 0) ? tieBreakers.map(({ beatmapId }) => beatmapId) : [];
        let userIds;
        if (this.tournamentType === 'teams') {
            userIds = players.map(({ userId }) => userId);
        }
        else {
            userIds = players;
        }
        let soloScores = [];
        let teamScores = [];
        this.matches.forEach((games) => {
            games = games.filter(({ beatmap_id }) => {
                return beatmapIds.some((beatmapId) => beatmapId == beatmap_id);
            });
            if (games.length == 0)
                return;
            if (!isQuals) {
                let playedMaps = games.map(({ beatmap_id }) => beatmap_id);
                let indexes = playedMaps.map((beatmapId) => playedMaps.lastIndexOf(beatmapId));
                indexes = [...new Set(indexes)];
                games = indexes.map((index) => games[index]);
            }
            let tieBreakerWasPlayed = games.filter(({ beatmap_id }) => {
                return tieBreakerIds.some((tieBreaker) => tieBreaker == beatmap_id);
            }).length > 0;
            if (tieBreakerWasPlayed) {
                let indexOfPlayedTieBreaker;
                for (let i = 0; i < games.length; i++) {
                    if (tieBreakerIds.some((tieBreaker) => tieBreaker == games[i].beatmap_id)) {
                        indexOfPlayedTieBreaker = i;
                        break;
                    }
                }
                games.splice(indexOfPlayedTieBreaker, games.length - indexOfPlayedTieBreaker);
            }
            if (games.length == 0)
                return;
            if ((freeMods.length > 0 || tieBreakers.length > 0) && this.freeModMultipliers.length > 0) {
                let freeModMaps = (applyMultipliersToTieBreaker) ? freeModIds.concat(tieBreakerIds) : freeModIds;
                let Mods;
                (function (Mods) {
                    Mods[Mods["EZ"] = 2] = "EZ";
                    Mods[Mods["HD"] = 8] = "HD";
                    Mods[Mods["HR"] = 16] = "HR";
                    Mods[Mods["DT"] = 64] = "DT";
                    Mods[Mods["HT"] = 256] = "HT";
                    Mods[Mods["NC"] = 512] = "NC";
                    Mods[Mods["FL"] = 1024] = "FL";
                })(Mods || (Mods = {}));
                ;
                let values = Object.values(Mods)
                    .filter((value) => typeof value === 'number')
                    .map((value) => Number(value))
                    .reverse();
                let multiplierMods = this.freeModMultipliers.map(({ mods }) => mods);
                games = games.map((game) => {
                    if (!freeModMaps.some((freeMod) => freeMod == game.beatmap_id))
                        return game;
                    let globalMods = Number(game.mods);
                    game.scores = game.scores.map((score) => {
                        let modEnum = Number(score.enabled_mods) + globalMods;
                        let mods = [];
                        values.forEach((value) => {
                            if (modEnum - value >= 0) {
                                modEnum -= value;
                                mods.push(Mods[value]);
                            }
                        });
                        let modsString = mods.reduce((prev, current) => `${prev}${current}`, '');
                        score.enabled_mods_string = (modsString) ? modsString : 'NM';
                        if (multiplierMods.some((mod) => mod === modsString)) {
                            let index = multiplierMods.indexOf(modsString);
                            score.score = Number(score.score) * this.freeModMultipliers[index].multiplier;
                        }
                        return score;
                    });
                    return game;
                });
            }
            if (tieBreakerWasPlayed && filterTieBreakersPlayedForFun) {
                let filterTieBreaker;
                if (this.tournamentType === 'teams') {
                    let team1Points = 0;
                    let team2Points = 0;
                    games.forEach((game) => {
                        if (tieBreakerIds.some((tieBreaker) => tieBreaker == game.beatmap_id))
                            return;
                        let team1Scores = game.scores.filter(({ team }) => team == '1');
                        let team2Scores = game.scores.filter(({ team }) => team == '2');
                        let team1Score = (team1Scores.length > 0) ? utils_1.MathUtils.sum(team1Scores, 'score') : 0;
                        let team2Score = (team2Scores.length > 0) ? utils_1.MathUtils.sum(team2Scores, 'score') : 0;
                        if (team1Score > team2Score)
                            team1Points++;
                        else if (team2Score > team1Score)
                            team2Points++;
                    });
                    if (team1Points !== team2Points) {
                        filterTieBreaker = true;
                    }
                }
                else {
                    let player1Points = 0;
                    let player2Points = 0;
                    games.forEach((game) => {
                        if (tieBreakerIds.some((tieBreaker) => tieBreaker == game.beatmap_id))
                            return;
                        let players = [...new Set(game.scores.map(({ user_id }) => user_id))];
                        if (players.length > 2) {
                            players = players.filter((userId) => {
                                return userIds.some((player) => player == userId);
                            });
                        }
                        let player1Scores = game.scores.filter(({ user_id }) => user_id == players[0]);
                        let player2Scores = game.scores.filter(({ user_id }) => user_id == players[1]);
                        let player1Score = (player1Scores[0].score) ? Number(player1Scores[0].score) : 0;
                        let player2Score = (player2Scores[0].score) ? Number(player2Scores[0].score) : 0;
                        if (player1Score > player2Score)
                            player1Points++;
                        else if (player2Score > player1Score)
                            player2Points++;
                    });
                    if (player1Points !== player2Points) {
                        filterTieBreaker = true;
                    }
                }
                if (filterTieBreaker) {
                    games = games.filter((game) => {
                        return !tieBreakerIds.some((tieBreaker) => tieBreaker == game.beatmap_id);
                    });
                }
            }
            if (games.length == 0)
                return;
            if (filterFailed) {
                games = games.map((game) => {
                    game.scores = game.scores.filter((score) => score.pass == '1');
                    return game;
                });
            }
            if (games.length == 0)
                return;
            games = games.map((game) => {
                game.scores = game.scores.filter((score) => {
                    return userIds.some((player) => player == score.user_id);
                });
                return game;
            });
            let solo = utils_1.Utils.toSingleArray(games.map((game) => {
                let { beatmap_id } = game;
                let scores = game.scores.map((score) => {
                    let { count300, count100, count50, countmiss, user_id, enabled_mods_string, maxcombo } = score;
                    count300 = Number(count300);
                    count100 = Number(count100);
                    count50 = Number(count50);
                    countmiss = Number(countmiss);
                    let accuracy = (((50 * count50) + (100 * count100) + (300 * count300)) / (300 * (countmiss + count50 + count100 + count300))) * 100;
                    let newScore = {
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
            soloScores.push(...solo);
            if (this.tournamentType === 'teams') {
                solo.map(({ beatmapId, team }) => {
                    return {
                        beatmapId,
                        team: team
                    };
                })
                    .filter((obj, i, array) => {
                    return i === array.findIndex((obj1) => (obj1.beatmapId === obj.beatmapId && obj1.team === obj.team));
                })
                    .forEach(({ beatmapId, team }) => {
                    let scores = solo.filter((score) => score.team === team && score.beatmapId === beatmapId);
                    let totalScore = utils_1.MathUtils.sum(scores, 'score');
                    let averageAccuracy = utils_1.MathUtils.average(scores, 'accuracy');
                    let averageCombo = utils_1.MathUtils.average(scores, 'combo');
                    teamScores.push({ beatmapId, team, totalScore, averageAccuracy, averageCombo });
                });
            }
        });
        return beatmapIds.map((beatmapId) => {
            beatmapId = beatmapId.toString();
            let solo = utils_1.Utils.sort(soloScores.filter((score) => score.beatmapId == beatmapId), 'descending', 'score')
                .map((score, i) => {
                score.placement = i + 1;
                return score;
            });
            if (this.tournamentType === 'teams') {
                let teams = utils_1.Utils.sort(teamScores.filter((score) => score.beatmapId == beatmapId), 'descending', 'totalScore')
                    .map((score, i) => {
                    score.placement = i + 1;
                    return score;
                });
                return { beatmapId, soloScores: solo, teamScores: teams };
            }
            return { beatmapId, soloScores: solo };
        });
    }
    getQualifierResults(scores, players, teams, calculationMethod) {
        let key;
        let scoresRef;
        if (this.tournamentType === 'solo') {
            scoresRef = scores.map(({ soloScores }) => soloScores);
            key = 'score';
        }
        else {
            scoresRef = scores.map(({ teamScores }) => teamScores);
            key = 'totalScore';
        }
        let beatmapStats = this.mappool.beatmaps.map(({ beatmapId }, i) => {
            let filteredScores = scoresRef[i].filter((score) => score.beatmapId == beatmapId)
                .map((score) => score[key]);
            let scoreAverage = utils_1.MathUtils.average(filteredScores);
            return {
                beatmapId: beatmapId.toString(),
                scores: filteredScores,
                highestScore: Math.max(...filteredScores),
                average: scoreAverage,
                stdDev: utils_1.MathUtils.stdDev(filteredScores, scoreAverage)
            };
        });
        let resultsScores = utils_1.Utils.toSingleArray(scoresRef.map((scores, i) => {
            let { highestScore, average, stdDev } = beatmapStats[i];
            return scores.map((score) => {
                score.zScore = utils_1.MathUtils.normStdDist((score[key] - average) / stdDev);
                score.relativeScore = score[key] / highestScore;
                return score;
            });
        }));
        let results;
        if (this.tournamentType === 'solo') {
            results = players.map((player) => {
                let soloScores = resultsScores.filter((score) => score.userId == player);
                let { totalRank, relativeRank, zScore } = this.getResultValues(soloScores);
                return { userId: player, totalRank, relativeRank, zScore };
            });
        }
        else {
            results = teams.map((team) => {
                let teamScores = resultsScores.filter((score) => score.team === team);
                let { totalRank, relativeRank, zScore } = this.getResultValues(teamScores);
                return { team, totalRank, relativeRank, zScore };
            });
        }
        if (this.options.filterIfNoScores) {
            results = results.filter(({ totalRank }) => totalRank !== Infinity);
        }
        switch (calculationMethod) {
            case 'rank':
                results = utils_1.Utils.sort(results, 'ascending', 'totalRank');
                break;
            case 'relative rank':
                results = utils_1.Utils.sort(results, 'descending', 'relativeRank');
                break;
            case 'z-sum':
                results = utils_1.Utils.sort(results, 'descending', 'zScore');
                break;
        }
        results = results.map((result, i) => {
            result.placement = i + 1;
            return result;
        });
        return { scores, results };
    }
    getResultValues(scores) {
        if (scores.length === 0) {
            return {
                totalRank: Infinity,
                relativeRank: 0,
                zScore: 0
            };
        }
        let totalRank = utils_1.MathUtils.sum(scores, 'placement');
        let relativeRank = utils_1.MathUtils.sum(scores, 'relativeScore');
        let zScore = utils_1.MathUtils.sum(scores, 'zScore');
        return { totalRank, relativeRank, zScore };
    }
    runChecks(players) {
        if (this.matches.length === 0)
            throw new Error('No match data has been provided');
        if (this.mappool.beatmaps.length === 0)
            throw new Error('No mappool has been provided');
        if (players.length === 0) {
            let message = (this.tournamentType === 'solo') ? 'No player user IDs have been provided' : 'No team data has been provided';
            throw new Error(message);
        }
    }
}
exports.default = Stats;
//# sourceMappingURL=index.js.map