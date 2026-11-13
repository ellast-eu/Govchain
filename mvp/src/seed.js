'use strict';
/**
 * Seed de démonstration (dogfooding) : crée une gouvernance, un membre
 * « noyau fondateur », et un constat exemple avec deux solutions, afin que
 * le flux complet (délibérer → voter → décider) soit démontrable d'emblée.
 * N'écrase rien : si des événements existent déjà, il s'arrête.
 */
const path = require('path');
const { EventStore } = require('./eventstore');
const domain = require('./domain');
const auth = require('./auth');

const DATA_DIR = process.env.GOVCHAIN_DATA || path.join(__dirname, '..', 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.jsonl');

const store = new EventStore(EVENTS_FILE);
if (store.readAll().length > 0) {
  console.log('Des événements existent déjà — seed ignoré. (Supprimez data/ pour repartir de zéro.)');
  process.exit(0);
}

const append = (evts) => evts.map((e) => store.append(e));

const gov = append(domain.createGovernance({ name: 'Govchain — Noyau', form: 'democratie-directe' }))[0];
const founder = append(domain.joinMember({ governanceId: gov.id, name: 'Noyau fondateur' }))[0];

const constat = append(
  domain.openConstat({
    governanceId: gov.id,
    authorId: founder.id,
    title: 'Comment prioriser la feuille de route du MVP ?',
    body: "Premier constat de dogfooding : la gouvernance se sert d'elle-même pour décider de ses propres prochaines étapes.",
  })
)[0];

append(domain.addContribution({ constatId: constat.id, authorId: founder.id, ctype: 'declaration', body: "L'écran de vote est la pièce la plus sensible à éprouver." }));
append(domain.addContribution({ constatId: constat.id, authorId: founder.id, ctype: 'demande', body: 'Pouvons-nous tester avec un vrai petit groupe dès cette semaine ?' }));
append(domain.proposeSolution({ constatId: constat.id, authorId: founder.id, title: 'Peaufiner d\'abord le vote JM', body: 'Fiabiliser et clarifier l\'écran de vote avant tout le reste.' }));
append(domain.proposeSolution({ constatId: constat.id, authorId: founder.id, title: 'Maquetter tous les écrans d\'abord', body: 'Donner une vue d\'ensemble visuelle avant d\'approfondir.' }));
append(domain.proposeSolution({ constatId: constat.id, authorId: founder.id, title: 'Recruter le groupe pilote d\'abord', body: 'Trouver la communauté avant de figer le périmètre.' }));

const secret = auth.loadSecret(DATA_DIR);
const link = `/join?token=${encodeURIComponent(auth.makeInvite(gov.id, secret))}`;

console.log('Seed effectué.');
console.log(`Gouvernance : « ${gov.name} » (démocratie directe)`);
console.log(`Constat exemple : « ${constat.title} » (3 solutions)`);
console.log(`\nLien d'invitation : http://localhost:${process.env.PORT || 3000}${link}`);
