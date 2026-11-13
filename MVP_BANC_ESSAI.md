# Govchain — Cadrage du MVP (banc d'essai)

Spec opérationnelle de la première version testable.
Référence : Dossier technique consolidé + TORESOLVE.md (#6).
Dernière mise à jour : 13 novembre 2026.

> **Archétype retenu.** Petit groupe auto-gouverné / association (adhésion bornée et connue). Low-regret : ~80 % du cadrage vaut pour copropriété ou collectif ; seuls l'onboarding des membres et les types de décisions changeraient.
> **Nature.** Banc d'essai **centralisé**, assumé **jetable sur l'axe infrastructure**. Il teste la *valeur*, pas la décentralisation. Le modèle de données est conçu pour migrer vers l'agent-centric plus tard (voir §7).

---

## 1. L'hypothèse à valider

**Un groupe, muni du processus décisionnel structuré (Constat → Solution) + jugement majoritaire + formes de gouvernance paramétrables, produit des décisions :**
1. **auxquelles les membres participent réellement** (pas seulement quelques-uns) ;
2. **qu'ils jugent plus légitimes / meilleures** que leur façon de décider actuelle.

> C'est **le** pari du projet. S'il échoue, la décentralisation ne le sauvera pas — autant le savoir vite et à moindre coût. Tout le reste du MVP est au service de ce test.

---

## 2. Périmètre fonctionnel — ce qui est DANS

- **Comptes & adhésion** : liste de membres connue, entrée **sur invitation**. Auth simple (e-mail + lien magique ou mot de passe). **Pas de KYC.** Unicité locale garantie par l'admin qui connaît le groupe (1 membre = 1 compte).
- **Gouvernance** : créer une gouvernance, choisir sa **forme** (2 à 3 au MVP : démocratie directe + une forme représentative), régler ses paramètres (seuils d'accord, quorum).
- **Processus décisionnel** : ouvrir un **Constat** → contributions **typées** (proposition / demande / déclaration / accord) → **Solutions** → seuils d'accord → passage en vote. Ramification simple au minimum.
- **Vote au jugement majoritaire** : saisie des mentions, dépouillement JM, résultat lisible (mention majoritaire + classement).
- **Visibilité** : fil des sujets (en cours / à voter / décidés), notifications basiques, niveau de priorité.
- **Journal des décisions** : historique consultable — la mémoire de la gouvernance.
- **Admin minimal** : gérer les membres, créer une gouvernance, changer sa forme.

## 3. Périmètre — ce qui est DEHORS (différé explicitement)

- P2P / blockchain / substrat agent-centric → **centralisé** au MVP.
- Unicité **globale**, finalité en contexte hostile, résistance à la coercition avancée.
- Monnaie et modules économiques (EBV / EBR / EBT).
- Machinerie **RGPD réseau** : au MVP, la structure porteuse (asso) **est** le responsable de traitement → trivial.
- Push de code de la Gouvernance Réseau ; carte « système solaire » ; les 8 formes (on en fait 2-3) ; appli mobile native (web responsive suffit).

---

## 4. Les écrans

1. **Connexion / rejoindre par invitation** — entrer dans le groupe via un lien.
2. **Tableau de bord de la gouvernance** — sujets en cours, à voter, décidés ; accès rapide.
3. **Constat** — créer/consulter un constat + ses contributions typées.
4. **Solution** — propositions de solution, niveau d'accord, bascule en vote.
5. **Vote (jugement majoritaire)** — attribuer une mention à chaque option.
6. **Résultat de vote** — dépouillement JM lisible (mention majoritaire, classement, participation).
7. **Journal des décisions** — l'historique décidé, filtrable.
8. **Paramètres de gouvernance** — forme, seuils, quorum, membres.

> 8 écrans. Objectif : qu'un membre non-technique traverse Constat → Solution → Vote → Résultat sans accompagnement.

---

## 5. Ce qu'on mesure (« c'est validé quand… »)

| Indicateur | Question | Cible indicative à fixer |
|---|---|---|
| **Participation** | % de membres qui votent / contribuent (pas seulement qui lisent) | ex. >40 % votent, >15 % contribuent |
| **Complétion** | % de sujets qui aboutissent à une décision (vs abandonnés) | ex. >60 % |
| **Légitimité perçue** | Enquête avant/après : décision jugée plus légitime/meilleure que la méthode habituelle ? | hausse nette sur échelle |
| **Rétention** | Le groupe revient-il pour un 2e, 3e sujet sans qu'on le pousse ? | ≥3 sujets en autonomie |
| **Acceptation du JM** | Les résultats du jugement majoritaire sont-ils acceptés (vs contestés) ? | peu de contestation |

> **Signal d'arrêt.** Si la participation s'effondre ou si les sujets n'aboutissent pas, la valeur n'est pas (encore) là → repenser la mécanique **avant** d'investir dans la décentralisation.

---

## 6. Pilote recommandé

1. **Dogfooding (gouvernance zéro)** — le cercle Govchain se gouverne avec Govchain (décider la feuille de route, les arbitrages du projet). Friction de recrutement minimale, motivation maximale, fit parfait, démo vivante.
2. **Puis** une association externe à faible friction (un club dont on est membre, un petit collectif) pour tester hors de l'effet « équipe convaincue d'avance ».

---

## 7. Note d'architecture (le seul investissement « futur » à faire au MVP)

Même centralisé, **journaliser chaque acte comme un événement en append-only** (ouverture de constat, contribution, bulletin, résultat), signé par son auteur. Deux bénéfices :
- ça donne gratuitement le journal des décisions et l'auditabilité ;
- **ça se transpose directement en *source chain* par agent** le jour où l'on migre vers l'agent-centric / Holochain (Partie II du dossier). On évite de recoder le cœur.

Pour le reste : stack web classique, légère, **non sur-investie** (c'est un banc d'essai). Aucune autre anticipation de la décentralisation n'est nécessaire à ce stade.

---

## 8. Prochaines étapes

- [ ] Confirmer l'archétype et le pilote (dogfooding ?).
- [ ] Choisir les 2-3 formes de gouvernance implémentées au MVP.
- [ ] Fixer les cibles chiffrées du §5 avec le groupe pilote.
- [ ] Spécifier finement l'écran de vote JM et le dépouillement (le plus sensible).
- [ ] Maquetter les 8 écrans.
