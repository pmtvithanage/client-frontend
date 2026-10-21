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

/**
 * Country and organisation shown for well-known destination prefixes.
 * Prefixes without an entry (documentation ranges, unknown hosts) simply have
 * no country/organisation — the UI omits those rows rather than guessing.
 */
export const DESTINATION_GEO = Object.freeze({
  '20.205.243': { country: 'Singapore', org: 'Microsoft Azure' },
  '185.199.108': { country: 'United States', org: 'GitHub' },
  '104.18.32': { country: 'United States', org: 'Cloudflare' },
  '45.33.32': { country: 'United States', org: 'Linode' },
  '95.216.10': { country: 'Germany', org: 'Hetzner' },
})

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

/**
 * Plain-language explanation of what a port is for, shown next to every row in
 * "Ports and protocols" (for example `443` = secure web traffic).
 */
export const PORT_HINT = Object.freeze({
  443: 'Secure web traffic — websites, apps and API calls.',
  80: 'Normal, unencrypted web browsing.',
  22: 'Remote system administration (SSH).',
  53: 'Name lookups that turn website addresses into IP addresses.',
  445: 'Windows file and printer sharing.',
  3389: 'Remote desktop control of another machine.',
  3306: 'A MySQL database answering a query.',
  8080: 'Web traffic on a non-standard port — often a proxy or admin tool.',
  4444: 'Not a normal service — commonly a remote-control channel used by intruders.',
  25: 'Email being sent between mail servers.',
  161: 'Network devices reporting status to monitoring.',
  123: 'Computers syncing their clocks.',
  1900: 'Devices finding each other on the local network.',
  1433: 'A Microsoft SQL database answering a query.',
  5900: 'Remote screen control (VNC).',
})

/** Fallback wording when a port has no well-known service. */
export const PORT_HINT_FALLBACK = Object.freeze(
  'No common service uses this port — it may be a custom or one-off tool.',
)

/** Default number of protocol rows returned by `GET /network/protocols`. */
export const PROTOCOL_LIMIT = 4

/** Plain-language explanation of each protocol shown in the protocol share. */
export const PROTOCOL_HINT = Object.freeze({
  TCP: 'The reliable, ordered way most web, email and file traffic travels.',
  UDP: 'Fast, connectionless traffic — video calls, games and device discovery.',
  ICMP: 'Network testing messages (pings and "host unreachable" replies).',
  OTHER: 'Less common protocol — usually special-purpose tooling.',
})

/** Fallback wording when a protocol has no dedicated hint. */
export const PROTOCOL_HINT_FALLBACK = Object.freeze(PROTOCOL_HINT.OTHER)

/** Recent alerts shown in the device side panel. */
export const DEVICE_RECENT_LIMIT = 8

/** Top destinations shown in the device side panel. */
export const DEVICE_DEST_LIMIT = 5

/**
 * Look up the country/organisation metadata for an external address.
 * @param {string} ip Dotted-quad IPv4 address.
 * @returns {{country: string, org: string}|null} Geo entry, or null if unknown.
 */
export function geoForIp(ip) {
  if (!ip) return null
  const prefix = Object.keys(DESTINATION_GEO).find((key) => ip === key || ip.startsWith(`${key}.`))
  return prefix ? DESTINATION_GEO[prefix] : null
}

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

/** Height of the "Where your traffic goes" bar chart, in pixels. */
export const DESTINATION_CHART_HEIGHT = 260

/** Inner margin of the destinations bar chart (room for long labels). */
export const DESTINATION_CHART_MARGIN = Object.freeze({ top: 0, right: 12, bottom: 0, left: 0 })

/** Height of the protocol-share donut, in pixels. */
export const PROTOCOL_CHART_HEIGHT = 200

/** CSS variables used for the protocol-share slices, in order. */
export const PROTOCOL_COLOR_VARS = Object.freeze(['--accent', '--sev-medium', '--muted', '--sev-low'])
