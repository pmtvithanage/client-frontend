/**
 * Support request options and validation limits for `GET|POST /support`.
 * @module constants/support
 */

/** Request categories a client can choose from. */
export const SUPPORT_CATEGORIES = Object.freeze(['Question', 'Report a problem', 'Feedback', 'Billing'])

/** Friendly explanation shown beside each category. */
export const SUPPORT_CATEGORY_HELP = Object.freeze({
  Question: 'Something you want to ask us',
  'Report a problem': 'The dashboard or your sensor is not working right',
  Feedback: 'Ideas to make the portal better',
  Billing: 'Invoices and your plan',
})

/** Request lifecycle values (client-authored, SOC-free). */
export const REQUEST_STATUS = Object.freeze(['open', 'answered', 'closed'])

/** Status shown for each value. */
export const REQUEST_STATUS_LABEL = Object.freeze({
  open: 'Waiting for us',
  answered: 'We replied',
  closed: 'Closed',
})

/** Shortest subject accepted by `POST /support`. */
export const SUBJECT_MIN_LENGTH = 3

/** Shortest message accepted by `POST /support`. */
export const MESSAGE_MIN_LENGTH = 10

/** Shortest reply accepted by `POST /support/:id/replies`. */
export const REPLY_MIN_LENGTH = 2

/** Support requests seeded per client the first time the list is read. */
export const SEED_REQUEST_COUNT = 2

/** Author name used for replies written by the NIDS team. */
export const TEAM_AUTHOR = 'NIDS team'

/** Author name used for replies written by the client. */
export const CLIENT_AUTHOR = 'You'
