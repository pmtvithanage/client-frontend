/**
 * Team management options for `GET|POST|PATCH|DELETE /team`.
 * @module constants/team
 */

/** Roles a client user can hold. */
export const TEAM_ROLES = Object.freeze(['owner', 'member'])

/** What each role means, shown in the invite form. */
export const TEAM_ROLE_LABEL = Object.freeze({
  owner: 'Owner — manages the team, notifications and support',
  member: 'Member — reads alerts and can acknowledge them',
})

/** Invite lifecycle (invited people appear in the list until they accept). */
export const INVITE_STATUS = Object.freeze(['active', 'invited'])

/** Friendly text for each status. */
export const INVITE_STATUS_LABEL = Object.freeze({ active: 'Active', invited: 'Invite sent' })

/** A client account can never hold more people than this. */
export const MAX_TEAM_MEMBERS = 5

/** Basic email shape used for invite validation. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
