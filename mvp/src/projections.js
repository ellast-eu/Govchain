'use strict';
/**
 * Projections : reconstruit l'état courant à partir du journal d'événements.
 * `applyEvent` est le reducer partagé — utilisé au démarrage (rejeu complet)
 * et à chaud (après chaque append) pour garder l'état en mémoire à jour.
 */
const { EVENTS } = require('./events');

function initialState() {
  return {
    governances: {}, // id -> { id, name, form, referentId, createdAt }
    members: {}, // id -> { id, governanceId, name, joinedAt }
    constats: {}, // id -> { id, governanceId, authorId, title, body, status, contributions[], solutions[], voteId, createdAt }
    votes: {}, // id -> { id, constatId, options[], mentions, status, ballots{memberId->grades}, result }
    decisions: [], // { id, constatId, voteId, chosenOptionId, chosenLabel, at }
  };
}

function applyEvent(state, e) {
  switch (e.type) {
    case EVENTS.GOVERNANCE_CREATED:
      state.governances[e.id] = {
        id: e.id,
        name: e.name,
        form: e.form,
        referentId: e.referentId || null,
        createdAt: e.ts,
      };
      break;

    case EVENTS.MEMBER_JOINED:
      state.members[e.id] = {
        id: e.id,
        governanceId: e.governanceId,
        name: e.name,
        joinedAt: e.ts,
      };
      break;

    case EVENTS.CONSTAT_OPENED:
      state.constats[e.id] = {
        id: e.id,
        governanceId: e.governanceId,
        authorId: e.authorId,
        title: e.title,
        body: e.body,
        status: 'ouvert', // ouvert -> au_vote -> decide
        contributions: [],
        solutions: [],
        voteId: null,
        createdAt: e.ts,
      };
      break;

    case EVENTS.CONTRIBUTION_ADDED: {
      const c = state.constats[e.constatId];
      if (c)
        c.contributions.push({
          id: e.id,
          authorId: e.authorId,
          ctype: e.ctype,
          body: e.body,
          at: e.ts,
        });
      break;
    }

    case EVENTS.SOLUTION_PROPOSED: {
      const c = state.constats[e.constatId];
      if (c)
        c.solutions.push({
          id: e.id,
          authorId: e.authorId,
          title: e.title,
          body: e.body,
          at: e.ts,
        });
      break;
    }

    case EVENTS.VOTE_OPENED: {
      state.votes[e.id] = {
        id: e.id,
        constatId: e.constatId,
        options: e.options, // [{id,label}]
        mentions: e.mentions, // string[]
        status: 'ouvert',
        ballots: {},
        result: null,
      };
      const c = state.constats[e.constatId];
      if (c) {
        c.status = 'au_vote';
        c.voteId = e.id;
      }
      break;
    }

    case EVENTS.BALLOT_CAST: {
      const v = state.votes[e.voteId];
      if (v) v.ballots[e.memberId] = e.grades; // { optionId: mentionIndex }
      break;
    }

    case EVENTS.VOTE_CLOSED: {
      const v = state.votes[e.voteId];
      if (v) {
        v.status = 'clos';
        v.result = e.result;
      }
      break;
    }

    case EVENTS.DECISION_RECORDED: {
      const c = state.constats[e.constatId];
      if (c) c.status = 'decide';
      state.decisions.push({
        id: e.id,
        constatId: e.constatId,
        voteId: e.voteId,
        chosenOptionId: e.chosenOptionId,
        chosenLabel: e.chosenLabel,
        at: e.ts,
      });
      break;
    }

    default:
      break;
  }
  return state;
}

function rebuild(events) {
  return events.reduce(applyEvent, initialState());
}

module.exports = { initialState, applyEvent, rebuild };
