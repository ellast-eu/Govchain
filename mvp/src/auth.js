'use strict';
/**
 * Authentification minimale pour le banc d'essai :
 * - adhésion par lien d'invitation (jeton signé portant la gouvernance) ;
 * - session via cookie signé (HMAC) portant l'identifiant du membre.
 * Pas de mot de passe, pas de KYC : l'unicité est garantie hors-ligne par le
 * fait que la communauté est connue (cf. cadrage MVP).
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function loadSecret(dataDir) {
  const f = path.join(dataDir, 'secret.key');
  if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8').trim();
  const s = crypto.randomBytes(32).toString('hex');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(f, s, { mode: 0o600 });
  return s;
}

function sign(value, secret) {
  const mac = crypto.createHmac('sha256', secret).update(value).digest('base64url');
  return `${value}.${mac}`;
}

function verify(signed, secret) {
  if (!signed || !signed.includes('.')) return null;
  const idx = signed.lastIndexOf('.');
  const value = signed.slice(0, idx);
  const mac = signed.slice(idx + 1);
  const expected = crypto.createHmac('sha256', secret).update(value).digest('base64url');
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return value;
}

/** Jeton d'invitation = gouvernanceId signé. */
function makeInvite(governanceId, secret) {
  return sign(`inv:${governanceId}`, secret);
}
function readInvite(token, secret) {
  const v = verify(token, secret);
  if (!v || !v.startsWith('inv:')) return null;
  return v.slice(4);
}

/** Cookie de session = memberId signé. */
function makeSession(memberId, secret) {
  return sign(`mem:${memberId}`, secret);
}
function readSession(cookie, secret) {
  const v = verify(cookie, secret);
  if (!v || !v.startsWith('mem:')) return null;
  return v.slice(4);
}

function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach((pair) => {
    const i = pair.indexOf('=');
    if (i > -1) out[pair.slice(0, i).trim()] = decodeURIComponent(pair.slice(i + 1).trim());
  });
  return out;
}

module.exports = {
  loadSecret,
  makeInvite,
  readInvite,
  makeSession,
  readSession,
  parseCookies,
};
