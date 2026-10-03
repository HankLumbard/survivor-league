// ------------------------------------------------------------------
// Outcomes are point values entered by the commissioner, not episode numbers.
//   0: eliminated before picks locked (Aaliyah).
//   1-17: successive eliminations after picks locked, starting with Episode 2.
//   20: reaches the Final 3 (non-winner).
//   25: Sole Survivor, total points rather than an additional bonus.
//   null: still playing in the published data; worth 0 points so far.
// Keep outcomes tied to the Sheet's delayed results, never broadcast results.
// ------------------------------------------------------------------

function currentPoints(outcome) {
  if (outcome === null || outcome === undefined) return 0;
  return outcome;
}

// "Max possible" mirrors how bracket standings (e.g. NCAA pools) usually show upside:
// assume every castaway still in the game goes all the way and wins (25 pts).
// Once a castaway's fate is locked in (eliminated, endgame, or winner) their
// contribution is locked too, so max possible converges with current points as the
// season wraps up.
function maxPossiblePoints(outcome) {
  if (outcome === null || outcome === undefined) return 25;
  return outcome;
}

function describeOutcome(outcome) {
  if (outcome === null || outcome === undefined) return "Still in";
  if (outcome === 25) return "Sole Survivor \u2014 25 pts";
  if (outcome === 20) return "Final 3 \u2014 20 pts";
  if (outcome === 0) return "Eliminated before picks locked \u2014 0 pts";
  return `Elimination ${outcome} after picks locked \u2014 ${outcome} pt${outcome === 1 ? "" : "s"}`;
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
