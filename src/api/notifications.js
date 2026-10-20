// oxlint-disable-next-line no-unused-vars -- http is referenced by the commented real Axios calls
import http from './http.js'
import * as dummy from '../dummy/notifications.dummy.js'

/**
 * In-app notification feed (alerts + sensor notices) for the current client.
 * @param {{unread_only?: boolean, limit?: number}} [params] Filters.
 * @returns {Promise<{data: object[], meta: {total: number, unread: number, limit: number, has_more: boolean}}>}
 * @throws {{status: number, message: string}} 401 without a session.
 */
export async function listNotifications(params) {
  // const { data } = await http.get('/notifications', { params });
  // return data;
  return dummy.listNotifications(params)
}

/**
 * Mark one notification as read.
 * @param {string} id Notification id.
 * @returns {Promise<{updated: number}>}
 * @throws {{status: number, message: string}} 404 unknown id.
 */
export async function markNotificationRead(id) {
  // const { data } = await http.post(`/notifications/${encodeURIComponent(id)}/read`);
  // return data;
  return dummy.markRead(id)
}

/**
 * Mark every notification as read.
 * @returns {Promise<{updated: number}>}
 */
export async function markAllNotificationsRead() {
  // const { data } = await http.post('/notifications/read-all');
  // return data;
  return dummy.markAllRead()
}

/**
 * Notification preferences (channels, minimum severity, quiet hours).
 * @returns {Promise<object>} The stored preferences.
 */
export async function getNotificationPreferences() {
  // const { data } = await http.get('/notifications/preferences');
  // return data;
  return dummy.getPreferences()
}

/**
 * Update notification preferences (owner only, persisted until reload).
 * @param {object} patch Partial preferences to merge.
 * @returns {Promise<object>} The stored preferences.
 * @throws {{status: number, message: string}} 403 member, 400 invalid value.
 */
export async function updateNotificationPreferences(patch) {
  // const { data } = await http.put('/notifications/preferences', patch);
  // return data;
  return dummy.updatePreferences(patch)
}
