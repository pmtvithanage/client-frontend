/**
 * Client and sensor seeds for the dummy store.
 *
 * Three tenants, each with EXACTLY ONE sensor and its own users (AGENTS.md §3).
 * Timestamps are offsets in seconds/days so the store can build them relative
 * to "now" at page load.
 * @module constants/clients
 */

/** Client id that must always contain {@link ACME_SAMPLE_FLOW}. */
export const ACME_CLIENT_ID = 'client_acme_textiles'

/**
 * The real sample flow that must appear for Acme Textiles as an Urgent alert:
 * `192.168.8.100 -> 20.205.243.168:443`.
 */
export const ACME_SAMPLE_FLOW = Object.freeze({
  src_ip: '192.168.8.100',
  dst_ip: '20.205.243.168',
  dst_port: 443,
  protocol: 'TCP',
  direction: 'outbound',
  category: 'Malware communication',
  signature: 'ET MALWARE Suspicious Outbound HTTPS C2 Behaviour',
  severity_tier: 'CRITICAL',
  status: 'new',
  hours_ago: 3,
})

/** @type {ReadonlyArray<object>} */
export const CLIENT_SEEDS = Object.freeze([
  {
    id: 'client_acme_textiles',
    code: 'acme',
    rngSeed: 910211,
    alertPrefix: 'ACM',
    name: 'Acme Textiles',
    industry: 'Textile manufacturing',
    plan: 'Premium',
    timezone: 'Asia/Colombo',
    contact_email: 'owner@acme.test',
    created_at: '2025-11-04T09:15:00.000Z',
    ip_prefixes: ['192.168.8'],
    fixed_devices: [{ ip: '192.168.8.100', hostname: 'acme-design-ws-100' }],
    sensor: {
      id: 'sensor_acm_01',
      name: 'acme-main-sensor',
      location: 'Colombo factory — main switch room',
      version: 'Suricata 7.0.7 · CICFlowMeter 1.2',
      status: 'online',
      health: 'healthy',
      paired_days_ago: 210,
      last_seen_seconds_ago: 8,
      events_per_min: 1840,
      kafka_lag: 4,
      ingest_errors: 0,
    },
    users: [
      { email: 'owner@acme.test', name: 'Nimali Fernando', role: 'owner', password: 'owner' },
      { email: 'member@acme.test', name: 'Ruwan Jayasuriya', role: 'member', password: 'member' },
    ],
  },
  {
    id: 'client_lanka_logistics',
    code: 'lanka',
    rngSeed: 423907,
    alertPrefix: 'LKL',
    name: 'Lanka Logistics',
    industry: 'Freight and warehousing',
    plan: 'Standard',
    timezone: 'Asia/Colombo',
    contact_email: 'owner@lanka.test',
    created_at: '2026-01-19T04:40:00.000Z',
    ip_prefixes: ['10.50.0', '10.50.1'],
    fixed_devices: [],
    sensor: {
      id: 'sensor_lkl_01',
      name: 'lanka-warehouse-sensor',
      location: 'Kelaniya warehouse — rack B4',
      version: 'Suricata 7.0.6 · CICFlowMeter 1.2',
      status: 'online',
      health: 'degraded',
      paired_days_ago: 140,
      last_seen_seconds_ago: 45,
      events_per_min: 920,
      kafka_lag: 31,
      ingest_errors: 12,
    },
    users: [
      { email: 'owner@lanka.test', name: 'Chathura Wickrama', role: 'owner', password: 'owner' },
      { email: 'member@lanka.test', name: 'Fathima Rizwan', role: 'member', password: 'member' },
    ],
  },
  {
    id: 'client_sunrise_hospital',
    code: 'sunrise',
    rngSeed: 771645,
    alertPrefix: 'SNR',
    name: 'Sunrise Hospital',
    industry: 'Healthcare',
    plan: 'Basic',
    timezone: 'Asia/Colombo',
    contact_email: 'owner@sunrise.test',
    created_at: '2026-03-02T11:05:00.000Z',
    ip_prefixes: ['172.20.7'],
    fixed_devices: [],
    sensor: {
      id: 'sensor_snr_01',
      name: 'sunrise-core-sensor',
      location: 'Galle Road data closet — floor 2',
      version: 'Suricata 7.0.5 · CICFlowMeter 1.1',
      status: 'offline',
      health: 'offline',
      paired_days_ago: 95,
      last_seen_seconds_ago: 3600,
      events_per_min: 0,
      kafka_lag: 0,
      ingest_errors: 0,
    },
    users: [
      { email: 'owner@sunrise.test', name: 'Dr. Anushka Perera', role: 'owner', password: 'owner' },
      { email: 'member@sunrise.test', name: 'Kasun Dissanayake', role: 'member', password: 'member' },
    ],
  },
])
