/**
 * Notification preference options (`GET /PUT /notifications`).
 * @module constants/notifications
 */

/** Delivery channels a client can switch on. */
export const NOTIFICATION_CHANNELS = Object.freeze(['email', 'sms'])

/** Minimum severity that triggers a notification. */
export const MIN_SEVERITY_OPTIONS = Object.freeze(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])

/** Default preference block applied the first time a client reads settings. */
export const DEFAULT_NOTIFICATION_PREFERENCES = Object.freeze({
  channels: {
    email: { enabled: true, destination: '' },
    sms: { enabled: false, destination: '' },
  },
  minimum_severity: 'MEDIUM',
  quiet_hours: { enabled: false, start: '22:00', end: '06:00' },
})

/** `HH:MM` validation for quiet-hour inputs. */
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/
