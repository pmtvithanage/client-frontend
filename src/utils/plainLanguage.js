/**
 * Plain-language wording helpers (AGENTS.md §4 — the audience is non-experts).
 *
 * Severity labels, per-category explanations and the security score formula
 * live here so every screen says the same thing.
 * @module utils/plainLanguage
 */

import {
  SCORE_CEILING,
  SCORE_FLOOR,
  SCORE_LABEL_BANDS,
  SCORE_WEIGHTS,
} from '../constants/security.js'
import { SEVERITY_NAME } from '../constants/severity.js'

/**
 * Friendly severity name for a tier.
 * @param {string} tier One of `LOW | MEDIUM | HIGH | CRITICAL`.
 * @returns {string} `Minor`, `Moderate`, `Serious` or `Urgent`.
 *   Unknown tiers are returned unchanged rather than hidden.
 */
export function severityName(tier) {
  return SEVERITY_NAME[tier] ?? tier
}

/**
 * The seven plain-language category explanations.
 * Each entry answers: what happened, why we flag it, and what to do about it.
 * @type {Readonly<Record<string, {what: string, why: string, actions: string[]}>>}
 */
const CATEGORY_EXPLANATIONS = Object.freeze({
  'Port scan': {
    what: 'A machine on the internet checked which services are open on your network, one port after another.',
    why: 'Scanning is the first step an attacker takes before trying to break in, and it is rarely something a normal visitor does.',
    actions: [
      'Find the machine inside your network that is being probed and make sure it is patched.',
      'Block the outside address at your firewall if the scanning continues.',
    ],
  },
  'Denial of service': {
    what: 'Something sent your network a flood of requests so that real users could not get through.',
    why: 'The volume and speed of the requests are far above what your normal traffic looks like.',
    actions: [
      'Check whether a marketing email or a promotion could explain the traffic spike.',
      'Contact us if the traffic keeps up so we can help filter it.',
    ],
  },
  'Suspicious download': {
    what: 'A machine inside your network downloaded a file that our system does not often see here.',
    why: 'The file came from an unusual source, or the file type is one that commonly carries malware.',
    actions: [
      'Ask the person at that machine what they downloaded.',
      'Scan the machine with your antivirus before opening the file.',
    ],
  },
  'Brute-force login': {
    what: 'Someone tried to sign in over and over, with different passwords, until one worked or they gave up.',
    why: 'Repeated failed logins in a short time is how passwords are guessed automatically.',
    actions: [
      'Reset the password for the account that was targeted.',
      'Turn on two-step sign-in for that account, and block the source address if it continues.',
    ],
  },
  'Malware communication': {
    what: 'A machine inside your network was talking to a remote computer that is known to be suspicious.',
    why: 'The conversation matches how infected machines take instructions from an attacker.',
    actions: [
      'Disconnect the machine from the network and run a full malware scan.',
      'Change any passwords used on that machine, then call us if the connection returns.',
    ],
  },
  'Policy violation': {
    what: 'Traffic on your network went somewhere your organisation has decided to block.',
    why: 'This is your own policy being applied — it is not necessarily an attack.',
    actions: [
      'Confirm with your team whether the visit was expected.',
      'Adjust the policy in your settings if the site should be allowed.',
    ],
  },
  'Unusual traffic': {
    what: 'Your network sent or received an unusual amount of data, or at an unusual time.',
    why: 'It does not match the pattern this network normally follows, which can be an early sign of trouble.',
    actions: [
      'Check what was running on your network at that time — backups and updates are common innocent causes.',
      'Mark the alert as expected if you can explain it, so we stop raising it.',
    ],
  },
})

const CATEGORY_FALLBACK = Object.freeze({
  what: 'Something on your network did not look right.',
  why: 'Our system flagged it because it differs from the normal pattern of this network.',
  actions: ['Review the alert details and mark it as expected if you can explain it.'],
})

/**
 * Plain-language explanation of an alert category.
 * @param {string} category One of the values in `constants/categories.js`.
 * @returns {{what: string, why: string, actions: string[]}} Never null.
 */
export function categoryExplanation(category) {
  return CATEGORY_EXPLANATIONS[category] ?? CATEGORY_FALLBACK
}

/**
 * Security score for the counts of still-open alerts.
 *
 * Formula (weights in `constants/security.js`):
 * `score = 100 - (urgent×8 + serious×4 + moderate×2 + minor×0.5)`,
 * clamped to 0–100, then mapped to a band:
 * `≥85 Excellent`, `≥70 Good`, `≥45 Needs attention`, otherwise `At risk`.
 *
 * @param {{urgent?: number, serious?: number, moderate?: number, minor?: number}} counts
 *   Open (not yet resolved) alerts per severity.
 * @returns {{score: number, label: string, penalty: number}} `score` is 0–100.
 */
export function securityScore({ urgent = 0, serious = 0, moderate = 0, minor = 0 } = {}) {
  const penalty =
    urgent * SCORE_WEIGHTS.urgent +
    serious * SCORE_WEIGHTS.serious +
    moderate * SCORE_WEIGHTS.moderate +
    minor * SCORE_WEIGHTS.minor
  const raw = SCORE_CEILING - penalty
  const score = Math.min(SCORE_CEILING, Math.max(SCORE_FLOOR, Math.round(raw)))
  const band = SCORE_LABEL_BANDS.find((entry) => score >= entry.min) ?? SCORE_LABEL_BANDS.at(-1)
  return { score, label: band.label, penalty: Math.round(penalty * 10) / 10 }
}
