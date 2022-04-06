# osu-tournament-stats

An npm package that makes getting bracket and qualifier stage stats for osu! standard tournaments much easier. Intended for use in websites made for these tournaments.

### Features
- Supports solo and team tournaments of any team size
- Bracket stage stats
- Qualifier stage stats sorted by: 
  - Rank: Sum of every rank on each beatmap, sorted from lowest to highest
  - Relative Rank: Divides the score between the highest score on each beatmap, then sums all values, sorted from highest to lowest
  - Z-Sum: Calculates the value of the standard normal cumulative distribution for the z-score of the score on each beatmap, then sums all values, sorted from highest to lowest

### Installation

`npm i osu-tournament-stats`

## Documentation

Get started:

```js
import { SoloStats, TeamStats } from 'osu-tournament-stats';

// Array of JSON objects from the osu! API (v1) containing match data
let matches = [{
    match: {
      match_id: '99349514',
      name: 'GC: (:moyai:) vs (käsi)',
      start_time: '2022-04-02 16:55:52',
      end_time: '2022-04-02 18:00:57'
    },
    games: [{
      game_id: '506340923',
      start_time: '2022-04-02 17:20:35',
      end_time: '2022-04-02 17:23:56',
      beatmap_id: '1158221',
      play_mode: '0',
      match_type: '0',
      scoring_type: '3',
      team_type: '0',
      mods: '0',
      scores: [{
        slot: '0',
        team: '0',
        user_id: '10184558',
        score: '612283',
        maxcombo: '1028',
        rank: '0',
        count50: '3',
        count100: '39',
        count300: '908',
        countmiss: '4',
        countgeki: '259',
        countkatu: '27',
        perfect: '0',
        pass: '1',
        enabled_mods  : '1'
      }, ...]
    }, ...]
}];

// Array of objects containing the beatmap ID and other optional properties for specifying FreeMods and TieBreakers
let mappool = [{
  beatmapId: '1974409',
}, {
  beatmapId: '1158221',
  isFreeMod: true
}, {
  beatmapId: '1634214',
  isTieBreaker: true
}];

// Array of player user IDs (SoloStats only)
let players = ['9634978', '3786620', '11836334', '10184558', '6867478', '4277118'];

// Array of objects containing the team name and an array of the user IDs of each player in that team (TeamStats only)
let teams = [{
  name: 'käsi',
  players: ['9634978', '3786620', '11836334']
}, {
  name: ':moyai:',
  players: ['10184558', '6867478', '4277118']
}];

// Array of FreeMod multipliers containing the mods to apply to and the multiplier itself (optional)
let freeModMultipliers = [{
  mods: 'EZ',
  multiplier: 2.2
}];

// Object containing settings used when getting stats (optional), the following object corresponds to the default values
let options = {
  filterFailed: false, // Filter failed scores
  filterTieBreakersPlayedForFun: true, // Filter TieBreakers played for fun, if the score between the teams/players isn't a tie before the TieBreaker gets played, it gets filtered
  applyMultipliersToTieBreaker: true, // Apply FreeMod multipliers to TieBreakers as well
  filterIfNoScores: true // (Qualifiers) If the team/player has no scores but still wants be displayed in the results (false), else filters them (true)
};

const soloStats = new SoloStats(matches, mappool, players, freeModMultipliers, options);
const teamStats = new TeamStats(matches, mappool, teams, freeModMultipliers, options);
```

### getBracketStats()

```js
let soloBracketStats = soloStats.getBracketStats();
let teamBracketStats = teamStats.getBracketStats();
```

SoloStats returns:

```js
[{
  beatmapId: '1974409',
  soloScores: [{
    beatmapId: '1974409',
    userId: '9634978',
    score: '951077',
    mods: null,
    accuracy: 98.53,
    combo: 1401,
    count300: 933,
    count100: 21,
    count50: 0,
    misses: 0,
    placement: 1
  }, ...]
}, ...]
```

TeamStats returns:

```js
[{
  beatmapId: '1974409',
  soloScores: [{
    beatmapId: '1974409',
    userId: '9634978',
    score: '951077',
    mods: null,
    accuracy: 98.53,
    combo: 1401,
    count300: 933,
    count100: 21,
    count50: 0,
    misses: 0,
    team: 'käsi',
    placement: 1
  }, { ... }, ...],
  teamScores: [{
    beatmapId: '1974409',
    team: 'käsi',
    totalScore: 1661191,
    averageAccuracy: 96.09,
    averageCombo: 741,
    placement: 1
  }, ...]
}, ...]
```

### getQualifierStats(calculationMethod)

```js
// Calculation method to apply to the results, if no string is provided, it will default to 'rank'
let calculationMethod = 'rank' | 'relative rank' | 'z-sum';

let soloQualifierStats = soloStats.getQualifierStats(calculationMethod);
let teamQualifierStats = teamStats.getQualifierStats(calculationMethod);
```

SoloStats returns:

```js
{
  scores: [{
    beatmapId: '1974409',
    soloScores: [{
      beatmapId: '1974409',
      userId: '9634978',
      score: '951077',
      mods: null,
      accuracy: 98.53,
      combo: 1401,
      count300: 933,
      count100: 21,
      count50: 0,
      misses: 0,
      placement: 1,
      zScore: 0.9663309426954451,
      relativeRank: 1
    }, ...]
  }, ...],
  results: [{
    userId: '9634978',
    totalRank: 1,
    relativeRank: 1,
    zScore: 0.9663309426954451,
    placement: 1
  }, ...]
}
```

TeamStats returns:

```js
{
  scores: [{
    beatmapId: '1974409',
    soloScores: [{
      beatmapId: '1974409',
      userId: '9634978',
      score: '951077',
      mods: null,
      accuracy: 98.53,
      combo: 1401,
      count300: 933,
      count100: 21,
      count50: 0,
      misses: 0,
      placement: 1,
    }, ...],
    teamScores: [{
      beatmapId: '1974409',
      team: 'käsi',
      totalScore: 1661191,
      averageAccuracy: 96.09,
      averageCombo: 741,
      placement: 1,
      zScore: 0.7602499363678128,
      relativeScore: 1
    }, ...]
  }, ...],
  results: [{
    team: 'käsi',
    totalRank: 1,
    relativeRank: 1,
    zScore: 0.7602499363678128,
    placement: 1
  }, ...]
}
```