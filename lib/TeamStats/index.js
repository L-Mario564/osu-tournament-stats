"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Stats_1 = __importDefault(require("../Stats"));
const utils_1 = require("../utils");
class TeamStats extends Stats_1.default {
    constructor(matches, mappool, teams = [], freeModMultipliers, options) {
        super(matches, mappool, freeModMultipliers, options);
        this.teams = teams.map(({ name }) => name);
        this.players = utils_1.Utils.toSingleArray(teams.map(({ name, players }) => {
            return players.map((userId) => {
                return {
                    userId: userId.toString(),
                    team: name
                };
            });
        }));
        this.tournamentType = 'teams';
    }
    getQualifierStats(calculationMethod) {
        this.runChecks(this.players);
        let scores = this.getStats(this.players, true);
        return this.getQualifierResults(scores, null, this.teams, (calculationMethod) ? calculationMethod : 'rank');
    }
    getBracketStats() {
        this.runChecks(this.players);
        return this.getStats(this.players);
    }
}
exports.default = TeamStats;
//# sourceMappingURL=index.js.map