// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/auth.dummy.js'

/**
 * Sign in a client user (owner or member).
 * @param {string} email Account email.
 * @param {string} password Account password.
 * @returns {Promise<{token: string, expires_in: number, user: object, client: object}>}
 * @throws {{status: number, message: string}} 401 when the credentials are wrong.
 */
export async function login(email, password) {
  // const { data } = await http.post('/auth/login', { email, password });
  // return data;
  return dummy.login(email, password)
}

/**
 * The signed-in user and their client.
 * @returns {Promise<{user: object, client: object}>}
 * @throws {{status: number, message: string}} 401 without a session.
 */
export async function me() {
  // const { data } = await http.get('/auth/me');
  // return data;
  return dummy.me()
}

/**
 * Sign out (clears the locally stored session; always succeeds).
 * @returns {Promise<{ok: boolean}>}
 */
export async function logout() {
  // const { data } = await http.post('/auth/logout');
  // return data;
  return dummy.logout()
}
