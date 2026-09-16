// ------------------------------------------------------------------
// Scoring rules for the league:
//   - A castaway voted off in week N is worth N points (week 1 = 1 pt, week 2 = 2 pts, ...).
//   - A non-winning castaway who survives to the end is worth 17 points.
//   - The Sole Survivor (winner) is worth 20 points -- instead of 17, not in addition to it.
//   - A castaway still in the game is worth 0 points so far.
//
// This is all captured in one field per castaway, `outcome`:
//   outcome === null        -> still playing, locked-in value unknown yet
//   outcome === <number 1-16> -> voted out that week, worth that many points
//   outcome === 17           -> survived to the end (did not win)
//   outcome === 20           -> won the season
// ------------------------------------------------------------------

function currentPoints(outcome) {
  if (outcome === null || outcome === undefined) return 0;
  return outcome;
}

// "Max possible" mirrors how bracket standings (e.g. NCAA pools) usually show upside:
// assume every castaway still in the game goes all the way and wins (20 pts).
// Once a castaway's fate is locked in (eliminated, endgame, or winner) their
// contribution is locked too, so max possible converges with current points as the
// season wraps up.
function maxPossiblePoints(outcome) {
  if (outcome === null || outcome === undefined) return 20;
  return outcome;
}

function describeOutcome(outcome) {
  if (outcome === null || outcome === undefined) return "Still in";
  if (outcome === 20) return "Sole Survivor \u2014 20 pts";
  if (outcome === 17) return "Survived to the end \u2014 17 pts";
  return `Voted out wk ${outcome} \u2014 ${outcome} pt${outcome === 1 ? "" : "s"}`;
}

// Given an entry {picks: [castawayId, ...]} and a castawayId -> castaway map,
// return {current, max, breakdown}
function scoreEntry(entry, castawaysById) {
  let current = 0;
  let max = 0;
  const breakdown = entry.picks.map((id) => {
    const c = castawaysById[id];
    const outcome = c ? c.outcome : null;
    current += currentPoints(outcome);
    max += maxPossiblePoints(outcome);
    return { id, name: c ? c.name : id, outcome };
  });
  return { current, max, breakdown };
}

if (typeof module !== "undefined") {
  module.exports = { currentPoints, maxPossiblePoints, describeOutcome, scoreEntry };
}
