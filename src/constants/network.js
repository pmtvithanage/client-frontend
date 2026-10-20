/**
 * Network view constants: shared public destinations, well-known ports and the
 * device roles used to name machines inside a client's own network.
 * @module constants/network
 */

/**
 * Public destination prefixes shared by every client's alerts.
 * Includes RFC 5737 documentation ranges (203.0.113.0/24, 198.51.100.0/24).
 */
export const EXTERNAL_PREFIXES = Object.freeze([
  '20.205.243',
  '185.199.108',
  '104.18.32',
  '45.33.32',
  '95.216.10',
  '203.0.113',
  '198.51.100',
])

/** Friendly service names for the ports shown in "top ports". */
export const PORT_SERVICE = Object.freeze({
  443: 'HTTPS',
  80: 'HTTP',
  22: 'SSH',
  53: 'DNS',
  445: 'SMB (Windows files)',
  3389: 'RDP (remote desktop)',
  3306: 'MySQL',
  8080: 'HTTP (alt)',
  4444: 'Unusual control channel',
  25: 'Email (SMTP)',
  161: 'Network monitoring (SNMP)',
  123: 'Time sync (NTP)',
  1900: 'Device discovery (SSDP)',
  1433: 'MS SQL',
  5900: 'VNC (remote control)',
})

/** Device roles used to build hostnames like `acme-ws-04`. */
export const DEVICE_ROLES = Object.freeze([
  'ws',
  'ws',
  'laptop',
  'printer',
  'srv',
  'cam',
  'pos',
  'ap',
  'tablet',
  'till',
])

/** How many devices each client network contains. */
export const DEVICE_COUNT = 12

/** Upper bound of the host-number suffix in a device hostname. */
export const DEVICE_HOST_MAX = 24

/** Default number of rows returned by `GET /network/destinations`. */
export const DESTINATION_LIMIT = 10

/** Default number of rows returned by `GET /network/ports`. */
export const PORT_LIMIT = 8

/** Service name used when a port has no friendly label. */
export const UNKNOWN_SERVICE = 'Other'
