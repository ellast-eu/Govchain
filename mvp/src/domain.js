'use strict';
/**
 * Domaine : transforme des commandes en événements, en validant les règles.
 * Les fonctions renvoient une liste d'événements à persister (elles ne
 * touchent ni au store ni à l'état : c'est le serveur qui append + applique).
 */
const { randomUUID } = require('crypto');
const { EVENTS, CONTRIBUTION_TYPES, FORMS } = require('./events');
const jm = require('./jugement-majoritaire');

const id = () => randomUUID().slice(0, 8);

function createGovernance({ name, form, referentId = null }) {
  if (!name || !FORMS[form]) throw new Error('Nom ou forme de gouvernance invalide.');
  return [{ type: EVENTS.GOVERNANCE_CREATED, id: id(), name, form, referentId }];
}

function joinMember({ governanceId, name }) {
  if (!name || !name.trim()) throw new Error('Un nom est requis pour rejoindre la gouvernance.');
  return [{ type: EVENTS.MEMBER_JOINED, id: id(), governanceId, name: name.trim() }];
}

function openConstat({ governanceId, authorId, title, body }) {
  if (!title || !title.trim()) throw new Error('Le constat doit avoir un intitulé.');
  return [
    { type: EVENTS.CONSTAT_OPENED, id: id(), governanceId, authorId, title: title.trim(), body: (body || '').trim() },
  ];
}

function addContribution({ constatId, authorId, ctype, body }) {
  if (!CONTRIBUTION_TYPES[ctype]) throw new Error('Type de contribution inconnu.');
  if (!body || !body.trim()) throw new Error('La contribution est vide.');
  return [{ type: EVENTS.CONTRIBUTION_ADDED, id: id(), constatId, authorId, ctype, body: body.trim() }];
}

function proposeSolution({ constatId, authorId, title, body }) {
  if (!title || !title.trim()) throw new Error('La solution doit avoir un intitulé.');
  return [
    { type: EVENTS.SOLUTION_PROPOSED, id: id(), constatId, authorId, title: title.trim(), body: (body || '').trim() },
  ];
}

function openVote(state, { constatId, byMemberId }) {
  const constat = state.constats[constatId];
  if (!constat) throw new Error('Constat introuvable.');
  if (constat.status !== 'ouvert') throw new Error('Ce constat n\'est pas ouvert à la mise au vote.');
  if (constat.solutions.length < 2)
    throw new Error('Il faut au moins deux solutions pour ouvrir un vote.');

  const gov = state.governances[constat.governanceId];
  const form = FORMS[gov.form];
  if (form.canOpenVote === 'referent' && byMemberId !== gov.referentId)
    throw new Error('Seul le référent peut ouvrir le vote dans cette forme de gouvernance.');

  const options = constat.solutions.map((s) => ({ id: s.id, label: s.title }));
  return [
    { type: EVENTS.VOTE_OPENED, id: id(), constatId, options, mentions: jm.MENTIONS, openedBy: byMemberId },
  ];
}

function castBallot(state, { voteId, memberId, grades }) {
  const vote = state.votes[voteId];
  if (!vote) throw new Error('Vote introuvable.');
  if (vote.status !== 'ouvert') throw new Error('Ce vote est clos.');
  const optionIds = vote.options.map((o) => o.id);
  for (const oid of optionIds) {
    const g = grades[oid];
    if (g == null || g < 0 || g >= vote.mentions.length)
      throw new Error('Chaque option doit recevoir une mention.');
  }
  return [{ type: EVENTS.BALLOT_CAST, id: id(), voteId, memberId, grades }];
}

/** Clôt un vote : calcule le classement au JM et enregistre la décision. */
function closeVote(state, { voteId }) {
  const vote = state.votes[voteId];
  if (!vote) throw new Error('Vote introuvable.');
  if (vote.status !== 'ouvert') throw new Error('Ce vote est déjà clos.');
  const ballots = Object.values(vote.ballots);
  if (ballots.length === 0) throw new Error('Aucun bulletin : impossible de clore le vote.');

  const optionsForJm = vote.options.map((o) => ({
    id: o.id,
    label: o.label,
    grades: ballots.map((b) => b[o.id]).filter((g) => g != null),
  }));
  const ranking = jm.rank(optionsForJm);
  const winner = ranking[0];
  const result = { ranking, participation: ballots.length };

  return [
    { type: EVENTS.VOTE_CLOSED, id: id(), voteId, result },
    {
      type: EVENTS.DECISION_RECORDED,
      id: id(),
      constatId: vote.constatId,
      voteId,
      chosenOptionId: winner.id,
      chosenLabel: winner.label,
    },
  ];
}

module.exports = {
  id,
  createGovernance,
  joinMember,
  openConstat,
  addContribution,
  proposeSolution,
  openVote,
  castBallot,
  closeVote,
};
