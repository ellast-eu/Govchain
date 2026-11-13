'use strict';
/**
 * Moteur de jugement majoritaire (Balinski & Laraki).
 *
 * Les mentions sont indexées de 0 (pire) à MENTIONS.length-1 (meilleure).
 * Entrée : des options, chacune portant la liste des mentions reçues
 *          (un indice par votant ayant évalué l'option).
 * Sortie : le classement, avec pour chaque option sa mention majoritaire
 *          (médiane basse) et sa « jauge » (part au-dessus / en dessous).
 *
 * Départage : en cas d'égalité de mention majoritaire, on retire une
 * occurrence de la médiane à chaque option et on recompte, jusqu'à ce
 * que les médianes diffèrent (procédure standard du jugement majoritaire).
 *
 * Fonction PURE et sans dépendance : c'est la pièce la plus sensible du
 * MVP, isolée et testée à part (voir test/jm.test.js).
 */

const MENTIONS = [
  'À rejeter',
  'Insuffisant',
  'Passable',
  'Assez bien',
  'Bien',
  'Très bien',
  'Excellent',
];

/** Médiane basse d'un tableau trié ascendant (convention du JM). */
function lowerMedian(sortedAsc) {
  const n = sortedAsc.length;
  if (n === 0) return null;
  return sortedAsc[Math.ceil(n / 2) - 1];
}

/** Compare deux distributions de mentions. >0 si a est mieux classé que b. */
function compareGrades(gradesA, gradesB) {
  const a = [...gradesA].sort((x, y) => x - y);
  const b = [...gradesB].sort((x, y) => x - y);
  while (true) {
    if (a.length === 0 && b.length === 0) return 0;
    if (a.length === 0) return -1;
    if (b.length === 0) return 1;
    const ma = lowerMedian(a);
    const mb = lowerMedian(b);
    if (ma !== mb) return ma - mb;
    // Retire une occurrence de la médiane commune de chaque côté.
    a.splice(a.indexOf(ma), 1);
    b.splice(b.indexOf(mb), 1);
  }
}

/** Mention majoritaire (indice) d'une distribution. */
function majorityGrade(grades) {
  if (!grades.length) return null;
  return lowerMedian([...grades].sort((x, y) => x - y));
}

/**
 * Classe des options.
 * @param {{id:string,label?:string,grades:number[]}[]} options
 * @returns {{id,label,count,majority,majorityLabel,proportionAbove,proportionBelow,rank}[]}
 */
function rank(options) {
  const enriched = options.map((o) => {
    const grades = o.grades || [];
    const n = grades.length;
    const maj = majorityGrade(grades);
    const above = n ? grades.filter((g) => g > maj).length / n : 0;
    const below = n ? grades.filter((g) => g < maj).length / n : 0;
    return {
      id: o.id,
      label: o.label,
      count: n,
      majority: maj,
      majorityLabel: maj == null ? null : MENTIONS[maj],
      proportionAbove: above,
      proportionBelow: below,
    };
  });

  enriched.sort((x, y) => {
    const base = options.find((o) => o.id === x.id).grades || [];
    const other = options.find((o) => o.id === y.id).grades || [];
    return compareGrades(other, base); // tri décroissant (meilleur d'abord)
  });

  enriched.forEach((o, i) => {
    o.rank = i + 1;
  });
  return enriched;
}

module.exports = {
  MENTIONS,
  lowerMedian,
  majorityGrade,
  compareGrades,
  rank,
};
