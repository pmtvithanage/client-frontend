/**
 * Central TanStack Query key factory for the client portal.
 * @module hooks/queryKeys
 */

export const queryKeys = {
  me: () => ['auth', 'me'],
  overview: () => ['overview'],
  alerts: (params) => ['alerts', params ?? {}],
  alert: (id) => ['alert', id],
  alertExplain: (id) => ['alert-explain', id],
  destinations: (params) => ['network', 'destinations', params ?? {}],
  ports: (params) => ['network', 'ports', params ?? {}],
  devices: () => ['network', 'devices'],
  trafficHistory: (params) => ['traffic', 'history', params ?? {}],
  sensor: () => ['sensor'],
  checklist: () => ['sensor', 'checklist'],
  report: (params) => ['reports', params ?? {}],
  notifications: (params) => ['notifications', params ?? {}],
  preferences: () => ['notifications', 'preferences'],
  requests: () => ['support', 'requests'],
  team: () => ['team'],
}
