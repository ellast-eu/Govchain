'use strict';
/**
 * Journal d'événements append-only, au format JSONL (une ligne = un événement).
 *
 * C'est l'investissement « futur » du §7 du cadrage MVP : chaque acte est un
 * événement immuable, horodaté et séquencé. Le fichier est inspectable à la main
 * et se transpose directement en « source chain » par agent le jour où l'on
 * migre vers l'agent-centric / Holochain. On n'écrit jamais en place : on ajoute.
 */
const fs = require('fs');
const path = require('path');

class EventStore {
  constructor(file) {
    this.file = file;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (!fs.existsSync(file)) fs.writeFileSync(file, '');
    this.count = this.readAll().length;
  }

  /** Ajoute un événement (type + payload) ; renvoie l'événement enrichi. */
  append(event) {
    this.count += 1;
    const enriched = {
      seq: this.count,
      ts: new Date().toISOString(),
      ...event,
    };
    fs.appendFileSync(this.file, JSON.stringify(enriched) + '\n');
    return enriched;
  }

  /** Relit tout le journal, dans l'ordre. */
  readAll() {
    const raw = fs.readFileSync(this.file, 'utf8');
    return raw
      .split('\n')
      .filter((l) => l.trim().length > 0)
      .map((l) => JSON.parse(l));
  }
}

module.exports = { EventStore };
