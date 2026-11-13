'use strict';
const test = require('node:test');
const assert = require('node:assert');
const jm = require('../src/jugement-majoritaire');

test('médiane basse', () => {
  assert.strictEqual(jm.lowerMedian([4, 5, 6, 6, 6]), 6);
  assert.strictEqual(jm.lowerMedian([2, 2, 4, 4]), 2); // n pair -> médiane basse
  assert.strictEqual(jm.lowerMedian([3]), 3);
  assert.strictEqual(jm.lowerMedian([]), null);
});

test('mention majoritaire', () => {
  assert.strictEqual(jm.majorityGrade([6, 6, 6, 5, 4]), 6);
  assert.strictEqual(jm.majorityGrade([5, 5, 5, 4, 3]), 5);
});

test('classement simple par mention majoritaire', () => {
  const r = jm.rank([
    { id: 'A', grades: [6, 6, 6, 5, 4] }, // médiane 6
    { id: 'B', grades: [5, 5, 5, 4, 3] }, // médiane 5
  ]);
  assert.strictEqual(r[0].id, 'A');
  assert.strictEqual(r[0].rank, 1);
  assert.strictEqual(r[0].majority, 6);
  assert.strictEqual(r[1].id, 'B');
});

test('départage par retrait de médiane (médianes égales)', () => {
  // A et B ont la même médiane basse (2), mais A a plus de mentions hautes.
  const A = [4, 4, 2, 2]; // trié [2,2,4,4] -> médiane 2 ; retrait -> [2,4,4] médiane 4
  const B = [4, 2, 2, 2]; // trié [2,2,2,4] -> médiane 2 ; retrait -> [2,2,4] médiane 2
  assert.ok(jm.compareGrades(A, B) > 0, 'A doit être mieux classé que B');
  const r = jm.rank([
    { id: 'A', grades: A },
    { id: 'B', grades: B },
  ]);
  assert.strictEqual(r[0].id, 'A');
  assert.strictEqual(r[1].id, 'B');
});

test('jauge : parts au-dessus et en dessous de la médiane', () => {
  const r = jm.rank([{ id: 'A', grades: [2, 2, 4, 4] }]); // médiane 2
  const a = r[0];
  assert.strictEqual(a.majority, 2);
  assert.strictEqual(a.proportionAbove, 0.5); // deux 4 sur quatre
  assert.strictEqual(a.proportionBelow, 0);
});

test('égalité stricte renvoie 0', () => {
  assert.strictEqual(jm.compareGrades([3, 3, 1], [3, 3, 1]), 0);
});
