// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/team.dummy.js'

/**
 * Everyone on the client's account (any signed-in user may read).
 * @returns {Promise<{data: object[], meta: {total: number, role: string, remaining: number}}>}
 * @throws {{status: number, message: string}} 401 without a session.
 */
export async function listMembers() {
  // const { data } = await http.get('/team');
  // return data;
  return dummy.listMembers()
}

/**
 * Invite a person (owner only).
 * @param {{name: string, email: string, role?: string}} input Invite form values.
 * @returns {Promise<object>} The invited member.
 * @throws {{status: number, message: string}} 403 member, 400 invalid input, 409 duplicate/full.
 */
export async function inviteMember(input) {
  // const { data } = await http.post('/team/invite', input);
  // return data;
  return dummy.inviteMember(input)
}

/**
 * Change a person's role (owner only).
 * @param {string} email Member email.
 * @param {string} role New role (`owner` or `member`).
 * @returns {Promise<object>} The updated member.
 * @throws {{status: number, message: string}} 403/404/409.
 */
export async function updateMemberRole(email, role) {
  // const { data } = await http.post('/team/role', { email, role });
  // return data;
  return dummy.updateMember(email, role)
}

/**
 * Remove a person from the account (owner only, never yourself).
 * @param {string} email Member email.
 * @returns {Promise<{removed: string}>}
 * @throws {{status: number, message: string}} 403/404/409.
 */
export async function removeMember(email) {
  // const { data } = await http.post('/team/remove', { email });
  // return data;
  return dummy.removeMember(email)
}
