'use strict';
/** Types d'événements du domaine Govchain (banc d'essai). */
const EVENTS = {
  GOVERNANCE_CREATED: 'governance.created',
  MEMBER_JOINED: 'member.joined',
  CONSTAT_OPENED: 'constat.opened',
  CONTRIBUTION_ADDED: 'contribution.added',
  SOLUTION_PROPOSED: 'solution.proposed',
  VOTE_OPENED: 'vote.opened',
  BALLOT_CAST: 'ballot.cast',
  VOTE_CLOSED: 'vote.closed',
  DECISION_RECORDED: 'decision.recorded',
};

/** Types de contribution à un constat (délibération structurée). */
const CONTRIBUTION_TYPES = {
  proposition: 'Proposition',
  demande: 'Demande',
  declaration: 'Déclaration',
  accord: 'Accord',
};

/** Formes de gouvernance implémentées au MVP (2 sur les 8). */
const FORMS = {
  'democratie-directe': {
    label: 'Démocratie directe',
    // Qui peut ouvrir un vote parmi les solutions : tout citoyen.
    canOpenVote: 'any',
    description:
      'Chaque citoyen peut ouvrir un constat, proposer une solution et lancer le vote. La décision se prend au jugement majoritaire de tous les membres.',
  },
  presidentiel: {
    label: 'Présidentiel',
    // Seul le référent désigné ouvre et valide les votes.
    canOpenVote: 'referent',
    description:
      'Un référent désigné organise la mise au vote et la validation. Les citoyens délibèrent et votent ; la conduite du processus revient au référent.',
  },
};

module.exports = { EVENTS, CONTRIBUTION_TYPES, FORMS };
