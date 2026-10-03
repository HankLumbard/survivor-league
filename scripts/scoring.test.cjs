const { test } = require('node:test');
const assert = require('node:assert/strict');
const { currentPoints, maxPossiblePoints, describeOutcome, scoreEntry } = require('../js/scoring.js');
test('Delayed outcomes, sequential eliminations and finale point values', () => {
  for (const [name, outcome, points] of [['Aaliyah',0,0], ['Ana after publication',1,1], ['Next elimination',2,2], ['Last elimination',17,17], ['Losing finalist',20,20], ['Winner',25,25], ['Unpublished Ana',null,0]]) {
    assert.equal(currentPoints(outcome),points,name);
    assert.equal(maxPossiblePoints(outcome),outcome === null ? 25 : points,name);
  }
  assert.match(describeOutcome(0), /before picks locked.*0 pts/);
  assert.match(describeOutcome(1), /Elimination 1.*1 pt$/);
  assert.match(describeOutcome(17), /Elimination 17.*17 pts/);
  assert.match(describeOutcome(20), /Final 3.*20 pts/);
  assert.match(describeOutcome(25), /Sole Survivor.*25 pts/);
});
test('Mixed team totals and maximum/upside converge when every outcome is published', () => {
  const cast = Object.fromEntries([0,1,17,20,null].map((outcome,i)=>[String(i),{name:String(i),outcome}]));
  const entry={picks:Object.keys(cast)};
  let score=scoreEntry(entry,cast);
  assert.equal(score.current,38); assert.equal(score.max,63); assert.equal(score.max-score.current,25);
  cast['4'].outcome=25; score=scoreEntry(entry,cast);
  assert.equal(score.current,63); assert.equal(score.max,63);
  assert.equal(scoreEntry({picks:['a','b','c','d','e']},{}).max,125);
});
