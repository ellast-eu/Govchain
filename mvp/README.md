# Govchain — MVP (banc d'essai)

Première version testable de Govchain : **délibération structurée + jugement majoritaire + formes de gouvernance**, sur un **cœur événementiel append-only**. Centralisé et volontairement jetable sur l'axe infrastructure — c'est un banc d'essai pour valider la *valeur* (cf. `../MVP_BANC_ESSAI.md`), pas le produit décentralisé final.

## Démarrer

```bash
cd mvp
npm install
npm run seed      # crée une gouvernance de démo + un constat exemple, affiche un lien d'invitation
npm start         # http://localhost:3000
```

Ouvrez le lien d'invitation affiché par `seed` (ou par `npm start`) pour rejoindre la gouvernance en choisissant un nom. Invitez d'autres membres via **Paramètres → lien d'invitation**.

Variables d'environnement : `PORT` (défaut 3000), `GOVCHAIN_DATA` (dossier de données, défaut `mvp/data/`), `PUBLIC_URL` (base des liens d'invitation).

## Le flux

1. **Constat** — décrire une situation à traiter.
2. **Délibération** — contributions typées (Proposition / Demande / Déclaration / Accord).
3. **Solutions** — au moins deux propositions concurrentes.
4. **Vote** — chaque membre attribue une **mention** à chaque solution.
5. **Dépouillement** — classement au **jugement majoritaire** (médiane + départage).
6. **Décision** — la solution de tête est inscrite au **journal**.

## Architecture

- `src/jugement-majoritaire.js` — moteur JM (fonction pure, testée dans `test/`).
- `src/eventstore.js` — journal **append-only** JSONL (`data/events.jsonl`). Chaque acte est un événement immuable : c'est l'investissement « futur » du §7 du cadrage, qui se transpose en *source chain* par agent lors d'une future migration agent-centric (Holochain).
- `src/projections.js` — reconstruit l'état courant à partir des événements.
- `src/domain.js` — commandes → événements (règles, seuils, formes).
- `src/auth.js` — invitation + session par cookie signé (pas de mot de passe, pas de KYC).
- `src/server.js` — Express + EJS.

## Tester

```bash
npm test          # tests du moteur de jugement majoritaire
```

## Limites assumées (v0.1)

Centralisé (pas de P2P) ; unicité locale garantie par l'admin (pas d'unicité globale) ; 2 formes de gouvernance sur 8 ; pas de monnaie ni de modules économiques. Voir `../TORESOLVE.md` et `../MVP_BANC_ESSAI.md`.
