# TORESOLVE — Govchain

Registre des points à clarifier avant/pendant le développement.
Référence : **Dossier technique consolidé** (Parties I–III + Annexe), en regard du Livre Blanc v1.0.
Dernière mise à jour : 13 novembre 2026.

**Légende**

- 🔴 **Problème dur** — pas de solution éprouvée sur étagère
- 🟠 **Décision à trancher** — un choix à faire, pas une inconnue
- 🟡 **Spécification** — on sait faire, il reste à l'écrire
- 🟢 **Spécifié** — arbitré (sous-questions éventuelles listées)

> **Principe directeur.** La plupart de ces points n'ont pas de réponse *dans l'abstrait* : leur niveau d'exigence dépend entièrement du **premier cas d'usage** retenu (voir #6). Trancher ce périmètre transforme des questions philosophiques en questions d'ingénierie tranchables. → **C'est la priorité n°1.**

---

## 🔴 Problèmes durs (sans solution propre à ce jour)

### 1. Unicité globale des citoyens
- [ ] Définir comment garantir « un humain = un seul citoyen » **à l'échelle du réseau**.
- **Enjeu.** La validation en personne prouve « humain réel, vivant, ici » — pas « pas déjà enregistré ailleurs sous une autre identité ». Tout le principe *un humain = une voix* en dépend. C'est le trou le plus profond qui subsiste.
- **Pistes.** Empreinte biométrique calculée et comparée *en aveugle* (sans stockage en clair) ; ou tiers dédié à l'unicité seule (pas à l'identité complète). Aucune n'est une réponse complète : dédupliquer sans base biométrique centrale reste non résolu et rouvre la tension vie privée.
- **Résolu quand.** On dispose d'un mécanisme de déduplication réseau qui ne crée ni base biométrique centrale, ni honeypot, et qui résiste à un attaquant motivé.

### 2. Finalité des votes sur substrat agent-centric P2P
- [ ] Concevoir un scrutin **final, sans double-vote, résistant à la coercition, et croyable par un tiers** sur réplication partielle.
- **Enjeu.** Sans PoW/PoS/jeton, rien n'ordonne nativement les écritures ni n'empêche les forks d'une gouvernance. Les votes contraignants exigent une finalité que le pur agent-centric ne donne pas.
- **Pistes.** Source chains par agent (anti-équivocation) + BFT léger par gouvernance (comité tournant) ; anti-collusion type MACI pour la coercition. → **indication, pas design éprouvé.**
- **Dépendance.** Présuppose #1 (ensemble de citoyens Sybil-résistant) et la disponibilité des données (Partie II §5.2).
- **Résolu quand.** Un prototype produit des tallies finalisés, vérifiables par un extérieur, sous churn mobile réel.

---

## 🟠 Décisions à trancher (choix, pas inconnues)

### 4. Socle technique
- [ ] Choisir : **Holochain** / app-chain (**Cosmos SDK**, **Substrate**) / sur-mesure.
- **Enjeu.** Détermine énormément (modèle de données, consensus, outillage). Holochain est le plus aligné sur l'intuition agent-centric (Partie II §4).
- **Méthode.** Trancher par **prototype comparatif**, pas par débat.

### 5. Modèle d'infrastructure
- [ ] Choisir : **nœuds volontaires purs** vs **incitation par jeton**.
- **Enjeu.** À la fois idéologique (licence non-commerciale) et technique (la durabilité en dépend). Non tranché dans le Livre Blanc.
- **Note.** Le tout-mobile ne suffit pas à la durabilité : des nœuds always-on non-autoritaires sont nécessaires quel que soit le choix (Partie II §5.7).

### 6. ⭐ Premier cas d'usage & périmètre de la v1
- [ ] Choisir **une communauté réelle** pour la v1 (association, copropriété, collectif…).
- **Enjeu.** **Débloque presque tout le reste.** Le niveau d'exigence sur #1, #2, #3 et le choix de #4/#5 dépendent de l'échelle. Une asso de 200 membres et « tous les citoyens de la planète » n'appellent pas les mêmes réponses.
- **Résolu quand.** On a nommé la communauté cible et écrit le périmètre fonctionnel exact de sa v1.

### 7. Véhicule juridique
- [ ] Choisir la structure qui porte le projet (association, fondation, autre).
- **Lien.** Conditionne #3 et le positionnement « outil de délibération / budget participatif » (Partie I §5.2).

---

## 🟡 Travail de spécification (on sait faire — reste à écrire)

### 8. Commutation de forme de gouvernance
- [ ] Définir la **migration d'état** : que deviennent les processus en cours quand une gouvernance change de forme ? (gel / reprise / invalidation / achèvement sous l'ancienne règle ?)
- **Risque si non traité.** Changer de forme pour capturer un vote en cours (Partie I §4.4).

### 9. Quorum de référents & cascade de révocation
- [ ] Fixer le nombre minimal de référents (≥2, 3 recommandé), les critères d'indépendance, et la mécanique exacte de sanction/révocation en cascade (Partie III §5 + Annexe).

### 10. Amorçage / genèse
- [ ] Spécifier le **noyau fondateur** de référents à t=0, et sa dissolution progressive.
- [ ] Spécifier la **première version du code** et des règles de la Gouvernance Réseau à la genèse (qui les écrit ?).

### 11. Cold-start (zones sans référent)
- [ ] Détailler la vérification via gouvernance intégrée supérieure + la visio encadrée en dernier recours (sans stockage de documents).

---

## 🟢 Spécifié

### 3. Responsabilité RGPD — responsabilité conjointe des gouvernances — *décidé par Stella*
**Décision (modèle en couches).** Responsabilité conjointe (**art. 26 RGPD**) avec le rôle de **responsable principal porté par la couche Réseau**, incarnée en **personne morale** (fondation / association porteuse du réseau). Les gouvernances locales restent **responsables conjoints** pour leurs traitements propres (certification, votes) ; chaque gouvernance UE désigne un **citoyen comme DPO / point de contact** (représentant art. 27 pour le hors-UE). Ce montage donne un responsable identifiable et solvable, sans faire peser de responsabilité ruineuse sur un bénévole, et **sans introduire d'autorité *décisionnelle* centrale** : la couche Réseau est *responsable* mais *non-autoritaire* — même logique que les relais P2P (incontournable ≠ autoritaire).

**Sous-questions résiduelles (à traiter / valider) :**
- [x] **Ancrage en personne morale** — *résolu* : le rôle de responsable est porté au niveau de la **couche Réseau**, incarnée en personne morale (fondation). Cela déplace la responsabilité d'un bénévole vers une entité **solvable et assurable**, alignée sur la couche qui écrit réellement le protocole, sans créer d'autorité décisionnelle centrale.
- [ ] **Responsable *principal*, pas *unique*.** Le RGPD qualifie selon les **faits**, pas selon la déclaration : comme les gouvernances locales co-déterminent leurs traitements, elles restent probablement responsables *conjoints* pour le local (jurisprudence CJUE large : Fashion ID, Wirtschaftsakademie). La couche Réseau est donc responsable **chef de file**, pas *unique* — à acter avec le juriste, et à refléter dans l'accord art. 26.
- [ ] **Contrepartie : concentration de la responsabilité.** En écrivant le protocole, la fondation Réseau peut être tenue responsable pour *tout* le réseau → entité bien dotée, réserves, assurance obligatoires. (C'est un bien meilleur porteur de ce risque qu'un citoyen.)
- [ ] **Continuité du citoyen-contact** : réattribution automatique en cas de départ/révocation, pas de trou.
- [ ] **Accord art. 26.** Les responsables conjoints doivent avoir un accord définissant qui fait quoi (droits des personnes, transparence, sécurité). Qui le rédige et le maintient à l'échelle de millions de gouvernances ? L'intégrer à la constituante ?
- [ ] **Responsabilité solidaire envers la personne concernée** (art. 26(3) + 82). Un citoyen peut exercer ses droits contre *n'importe quel* responsable conjoint et réclamer réparation à un seul. Une petite gouvernance locale peut donc être exposée à une faille réseau. Prévoir répartition / indemnités / assurance.
- [ ] **Cohérence juridique ↔ technique.** Le modèle ne peut promettre que ce que l'architecture tient : droit à l'effacement vs réplication P2P (d'où « aucune donnée perso on-chain » — cf. Acquis). Le juridique et le technique doivent dire la même chose.
- [ ] **Autorité de contrôle chef de file.** Désormais déterminée par le **lieu d'établissement de la fondation Réseau** (p. ex. CNIL si en France). Reste à choisir ce lieu d'établissement.
- [ ] **Statut des référents.** Responsable ? Sous-traitant ? Exposition personnelle en cas de fausse attestation (lien avec #9).

**Reste requis.** Validation par un juriste spécialisé RGPD / échange avec la CNIL : la décision fixe le *modèle*, pas encore sa validité juridique.

### 12. Gouvernance du protocole (Gouvernance Réseau) — *spécifié par Stella*
La **Gouvernance Réseau** fonctionne comme les autres gouvernances (processus décisionnel, type et forme paramétrables), avec une capacité supplémentaire : **pousser du code**.

**Mécanisme retenu :**
1. Le code du réseau est **lisible directement dans le réseau**, avec versionnement.
2. On peut **proposer du nouveau code**, soumis au **vote** à l'issue du processus décisionnel.
3. Vote positif → le code est poussé à tout le réseau **en pré-version**.
4. Un **second vote** valide le **bon fonctionnement** de la pré-version.
5. Vote positif → elle devient la **version de référence** sur laquelle les instances se basent à date.

**Précédent rassurant.** Ce schéma en deux votes (proposition → pré-version/test → promotion) reproduit l'**auto-amendement de Tezos** (proposition → exploration → test → promotion), qui tourne en production. Bonne nouvelle pour la faisabilité.

**Sous-questions résiduelles ouvertes (à traiter) :**
- [ ] **Patch d'urgence de sécurité.** Attend-on réellement deux votes complets si une faille est activement exploitée ? Prévoir une voie accélérée — et la réconcilier avec l'absence d'autorité.
- [ ] **Définition concrète de « fonctionnement correct ».** Suite de tests automatisés ? Période d'observation bornée sur instances réelles (canary) ? Métriques ? À écrire noir sur blanc.
- [ ] **Divergence de versions.** Que deviennent les instances qui ne mettent pas à jour (ou échouent) entre pré-version et promotion ? Compatibilité ascendante, fenêtre de mise à jour obligatoire, risque de fork.
- [ ] **Code malveillant vs. électeurs non-experts.** Le vote approuve une *intention* ; la plupart des citoyens ne peuvent pas relire le code. Prévoir un **gate d'audit** (revue, builds reproductibles) pour empêcher un backdoor subtil de passer via un vote positif.
- [ ] **Intégrité du code poussé.** Chaque instance doit vérifier que le code reçu est exactement celui voté (releases signées + ancrage d'empreinte, cf. Merkle Partie II §5.5).
- [ ] **Portée du code.** Le code est global au réseau — confirmer que les gouvernances inférieures n'ont pas de variantes de code propres (seulement des *paramètres*).

---

## Acquis (rappel — déjà arbitrés dans le dossier)

- **Identité** : validation en personne, multi-référents, **attestation sans stockage de documents** (Partie III + Annexe).
- **Données** : **aucune donnée personnelle on-chain**, seulement des empreintes (Partie I §5.2, Partie II §5.5).
- **Stockage P2P** : « 5 % » = **erasure coding + placement DHT + réparation active**, pas de l'aléatoire ; nœuds volontaires always-on pour la durabilité (Partie II §5.2, §5.7).
- **« Sans serveur »** = **sans infrastructure de confiance/autoritaire**, pas « zéro infra » : relais/bootstrap permissionless admis (Partie II §2).
- **Fonctions régaliennes** (monnaie propre, impôts, urgence militaire) : **hors périmètre** technique/juridique de la v1 (Partie I §5.2).

---

## Prochaine étape recommandée

**Trancher #6 (premier cas d'usage).** C'est le seul point qui débloque tous les autres : il fixe l'échelle, donc le niveau d'exigence sur l'unicité, la finalité, le juridique et le socle technique. Tout le reste peut attendre ce choix sans perte.
