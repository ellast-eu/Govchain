'use strict';
const path = require('path');
const express = require('express');
const { EventStore } = require('./eventstore');
const projections = require('./projections');
const domain = require('./domain');
const auth = require('./auth');
const { FORMS, CONTRIBUTION_TYPES } = require('./events');
const jm = require('./jugement-majoritaire');

const DATA_DIR = process.env.GOVCHAIN_DATA || path.join(__dirname, '..', 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.jsonl');
const PORT = process.env.PORT || 3000;

const store = new EventStore(EVENTS_FILE);
const state = projections.rebuild(store.readAll());
const secret = auth.loadSecret(DATA_DIR);

/** Persiste des événements et met l'état en mémoire à jour. */
function record(events) {
  let last = null;
  for (const ev of events) {
    const e = store.append(ev);
    projections.applyEvent(state, e);
    last = e;
  }
  return last;
}

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// Session : résout le membre courant et sa gouvernance.
app.use((req, res, next) => {
  const cookies = auth.parseCookies(req.headers.cookie);
  const memberId = auth.readSession(cookies.gc_session, secret);
  const member = memberId ? state.members[memberId] : null;
  req.member = member || null;
  req.gov = member ? state.governances[member.governanceId] : null;
  res.locals.member = req.member;
  res.locals.gov = req.gov;
  res.locals.FORMS = FORMS;
  next();
});

function requireMember(req, res, next) {
  if (!req.member) return res.redirect('/');
  next();
}
function renderError(res, message, code = 400) {
  return res.status(code).render('error', { message });
}

// --- Entrée / adhésion ---
app.get('/', (req, res) => {
  if (req.member) return res.redirect('/dashboard');
  res.render('landing');
});

app.get('/join', (req, res) => {
  const governanceId = auth.readInvite(req.query.token, secret);
  const gov = governanceId ? state.governances[governanceId] : null;
  if (!gov) return renderError(res, "Lien d'invitation invalide ou expiré.");
  res.render('join', { token: req.query.token, gov });
});

app.post('/join', (req, res) => {
  const governanceId = auth.readInvite(req.body.token, secret);
  const gov = governanceId ? state.governances[governanceId] : null;
  if (!gov) return renderError(res, "Lien d'invitation invalide.");
  try {
    const e = record(domain.joinMember({ governanceId, name: req.body.name }));
    res.setHeader('Set-Cookie', `gc_session=${auth.makeSession(e.id, secret)}; HttpOnly; Path=/; SameSite=Lax`);
    res.redirect('/dashboard');
  } catch (err) {
    renderError(res, err.message);
  }
});

app.get('/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'gc_session=; HttpOnly; Path=/; Max-Age=0');
  res.redirect('/');
});

// --- Tableau de bord ---
app.get('/dashboard', requireMember, (req, res) => {
  const constats = Object.values(state.constats)
    .filter((c) => c.governanceId === req.gov.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const by = (s) => constats.filter((c) => c.status === s);
  res.render('dashboard', {
    ouverts: by('ouvert'),
    auVote: by('au_vote'),
    decides: by('decide'),
    memberName: (id) => (state.members[id] ? state.members[id].name : '—'),
  });
});

// --- Constats ---
app.get('/constats/new', requireMember, (req, res) => res.render('new-constat'));

app.post('/constats', requireMember, (req, res) => {
  try {
    const e = record(
      domain.openConstat({ governanceId: req.gov.id, authorId: req.member.id, title: req.body.title, body: req.body.body })
    );
    res.redirect('/constats/' + e.id);
  } catch (err) {
    renderError(res, err.message);
  }
});

app.get('/constats/:id', requireMember, (req, res) => {
  const constat = state.constats[req.params.id];
  if (!constat || constat.governanceId !== req.gov.id) return renderError(res, 'Constat introuvable.', 404);
  const form = FORMS[req.gov.form];
  const canOpenVote =
    constat.status === 'ouvert' &&
    constat.solutions.length >= 2 &&
    (form.canOpenVote === 'any' || req.member.id === req.gov.referentId);
  res.render('constat', {
    constat,
    contributionTypes: CONTRIBUTION_TYPES,
    canOpenVote,
    memberName: (id) => (state.members[id] ? state.members[id].name : '—'),
  });
});

app.post('/constats/:id/contributions', requireMember, (req, res) => {
  try {
    record(domain.addContribution({ constatId: req.params.id, authorId: req.member.id, ctype: req.body.ctype, body: req.body.body }));
    res.redirect('/constats/' + req.params.id);
  } catch (err) {
    renderError(res, err.message);
  }
});

app.post('/constats/:id/solutions', requireMember, (req, res) => {
  try {
    record(domain.proposeSolution({ constatId: req.params.id, authorId: req.member.id, title: req.body.title, body: req.body.body }));
    res.redirect('/constats/' + req.params.id);
  } catch (err) {
    renderError(res, err.message);
  }
});

app.post('/constats/:id/open-vote', requireMember, (req, res) => {
  try {
    const e = record(domain.openVote(state, { constatId: req.params.id, byMemberId: req.member.id }));
    res.redirect('/votes/' + e.id);
  } catch (err) {
    renderError(res, err.message);
  }
});

// --- Votes ---
app.get('/votes/:id', requireMember, (req, res) => {
  const vote = state.votes[req.params.id];
  if (!vote) return renderError(res, 'Vote introuvable.', 404);
  const constat = state.constats[vote.constatId];
  const hasVoted = Boolean(vote.ballots[req.member.id]);
  res.render('vote', { vote, constat, mentions: jm.MENTIONS, hasVoted });
});

app.post('/votes/:id/ballot', requireMember, (req, res) => {
  const vote = state.votes[req.params.id];
  if (!vote) return renderError(res, 'Vote introuvable.', 404);
  const grades = {};
  for (const o of vote.options) grades[o.id] = Number(req.body['grade_' + o.id]);
  try {
    record(domain.castBallot(state, { voteId: vote.id, memberId: req.member.id, grades }));
    res.redirect('/votes/' + vote.id);
  } catch (err) {
    renderError(res, err.message);
  }
});

app.post('/votes/:id/close', requireMember, (req, res) => {
  try {
    record(domain.closeVote(state, { voteId: req.params.id }));
    res.redirect('/votes/' + req.params.id + '/result');
  } catch (err) {
    renderError(res, err.message);
  }
});

app.get('/votes/:id/result', requireMember, (req, res) => {
  const vote = state.votes[req.params.id];
  if (!vote) return renderError(res, 'Vote introuvable.', 404);
  const constat = state.constats[vote.constatId];
  if (vote.status !== 'clos') return res.render('vote-pending', { vote, constat });
  res.render('result', { vote, constat, result: vote.result });
});

// --- Journal & paramètres ---
app.get('/journal', requireMember, (req, res) => {
  const decisions = state.decisions
    .filter((d) => {
      const c = state.constats[d.constatId];
      return c && c.governanceId === req.gov.id;
    })
    .sort((a, b) => b.at.localeCompare(a.at));
  res.render('journal', { decisions, constatOf: (id) => state.constats[id] });
});

app.get('/settings', requireMember, (req, res) => {
  const members = Object.values(state.members).filter((m) => m.governanceId === req.gov.id);
  const inviteToken = auth.makeInvite(req.gov.id, secret);
  const base = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
  res.render('settings', {
    members,
    inviteLink: `${base}/join?token=${encodeURIComponent(inviteToken)}`,
    referentName: req.gov.referentId && state.members[req.gov.referentId] ? state.members[req.gov.referentId].name : null,
  });
});

app.listen(PORT, () => {
  console.log(`Govchain MVP (banc d'essai) — http://localhost:${PORT}`);
  const govs = Object.values(state.governances);
  if (govs.length) {
    const t = auth.makeInvite(govs[0].id, secret);
    console.log(`Invitation « ${govs[0].name} » : http://localhost:${PORT}/join?token=${encodeURIComponent(t)}`);
  } else {
    console.log('Aucune gouvernance. Lancez d\'abord : npm run seed');
  }
});
