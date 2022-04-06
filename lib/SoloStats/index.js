"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Stats_1 = __importDefault(require("../Stats"));
class SoloStats extends Stats_1.default {
    constructor(matches, mappool, players = [], freeModMultipliers, options) {
        super(matches, mappool, freeModMultipliers, options);
        this.players = players.map((userId) => userId.toString());
        this.tournamentType = 'solo';
    }
    getQualifierStats(calculationMethod) {
        this.runChecks(this.players);
        let scores = this.getStats(this.players, true);
        return this.getQualifierResults(scores, this.players, null, (calculationMethod) ? calculationMethod : 'rank');
    }
    getBracketStats() {
        this.runChecks(this.players);
        return this.getStats(this.players);
    }
}
exports.default = SoloStats;
//# sourceMappingURL=index.js.map