/**
 * Plain-language alert categories plus the generation profiles used by the
 * dummy data layer (signatures and severity mix per category).
 * @module constants/categories
 */

/** The only category values that ever appear in this app. */
export const CATEGORIES = Object.freeze([
  'Port scan',
  'Denial of service',
  'Suspicious download',
  'Brute-force login',
  'Malware communication',
  'Policy violation',
  'Unusual traffic',
])

/** Weighted severity mix used when seeding alerts for a category, in
 * {@link SEVERITY_ORDER} order: [LOW, MEDIUM, HIGH, CRITICAL]. */
const MIX = {
  balanced: [0.3, 0.4, 0.2, 0.1],
  harsh: [0.1, 0.3, 0.35, 0.25],
  soft: [0.6, 0.3, 0.08, 0.02],
}

/** @type {Readonly<Record<string, {signatures: string[], mix: number[]}>>} */
export const CATEGORY_PROFILE = Object.freeze({
  'Port scan': {
    signatures: ['ET SCAN Nmap SYN Sweep', 'ET SCAN Rapid TCP SYN Attempts', 'ET SCAN Unusual Port Scan Pattern'],
    mix: MIX.harsh,
  },
  'Denial of service': {
    signatures: ['ET DOS SYN Flood Observed', 'ET DOS HTTP Flood Against Single Host', 'DDOS Probe Detected'],
    mix: MIX.harsh,
  },
  'Suspicious download': {
    signatures: ['ET POLICY Suspicious Archive Download', 'ET INFO Executable Download From Non-Software Host', 'ET MALWARE Downloader User Agent'],
    mix: MIX.balanced,
  },
  'Brute-force login': {
    signatures: ['ET SCAN Multiple Failed SSH Logins', 'ET BRUTE_FORCE Repeated Login Failures', 'ET SCAN RDP Brute Force Attempt'],
    mix: MIX.balanced,
  },
  'Malware communication': {
    signatures: ['ET MALWARE Suspicious Outbound HTTPS C2 Behaviour', 'ET MALWARE Known Bad Host Connection', 'ET TROJAN DNS Query To Newly Registered Domain'],
    mix: MIX.harsh,
  },
  'Policy violation': {
    signatures: ['ET POLICY Corporate Policy Block', 'ET INFO Outbound Traffic To Blocklisted Category', 'ET POLICY cleartext credentials on the wire'],
    mix: MIX.soft,
  },
  'Unusual traffic': {
    signatures: ['ET POLICY Odd Time Of Day Traffic Spike', 'ET INFO Large Upload To Single Destination', 'ET ANOMALOUS Low And Slow Outbound Flow'],
    mix: MIX.soft,
  },
})

/** Ports used when seeding alerts, with how often they appear. */
export const COMMON_PORTS = Object.freeze([
  443, 443, 443, 80, 80, 22, 53, 445, 3389, 3306, 8080, 4444, 25, 161, 123, 1900,
])

/** Relative frequency of each category when seeding alerts (sums to 1). */
export const CATEGORY_WEIGHTS = Object.freeze([
  0.18, 0.1, 0.14, 0.16, 0.14, 0.14, 0.14,
])

/** Ports that make sense for each category (falls back to {@link COMMON_PORTS}). */
export const CATEGORY_PORTS = Object.freeze({
  'Port scan': [21, 22, 23, 25, 80, 110, 135, 139, 443, 445, 1433, 3389, 5900, 8080],
  'Denial of service': [443, 80, 53, 8080],
  'Suspicious download': [443, 80, 8080, 4444],
  'Brute-force login': [22, 443, 445, 3389],
  'Malware communication': [443, 4444, 53, 8080],
  'Policy violation': [80, 443, 25, 1080],
  'Unusual traffic': [443, 80, 445, 3306],
})
