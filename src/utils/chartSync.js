/**
 * Lightweight cross-chart synchroniser for charts in the same group: hovering
 * one chart moves the others' crosshairs, zooming one applies the same window
 * to the rest.
 *
 * The dygraphs `synchronizer` extra is NOT used: the package `module` entry
 * (`src/dygraph`) and `dist/dygraph.js` (which the extra requires) can become
 * two different class instances under Vite, so peer graphs would not be
 * recognised. This module only calls public methods on graph instances,
 * whatever module they came from.
 * @module utils/chartSync
 */

/** Group name → Map(graph → deselect callback). */
const groups = new Map()

/** Re-entrancy guard: peer callbacks re-enter these functions and must no-op. */
let broadcasting = false

/**
 * Register one chart in a sync group.
 * @param {string} group Group name (e.g. `traffic`).
 * @param {object} graph The dygraphs instance.
 * @param {() => void} [deselect] Called on the peer when the source chart's
 *   mouse leaves (resets that chart's accessible latest-values summary).
 * @returns {() => void} Unregister function (call on unmount).
 */
export function registerChart(group, graph, deselect) {
  if (!groups.has(group)) groups.set(group, new Map())
  const members = groups.get(group)
  members.set(graph, deselect)
  return () => {
    members.delete(graph)
    if (!members.size) groups.delete(group)
  }
}

function membersOf(group) {
  return groups.get(group) ?? new Map()
}

/**
 * Mirror the highlighted row onto every other chart in the group.
 * The `broadcasting` guard stops the peer's own highlight callback from
 * bouncing the selection back while this loop is running.
 * @param {string} group Group name.
 * @param {object} source Chart the user is hovering.
 * @param {number} row Data-row index (shared: group charts share one grid).
 */
export function propagateSelection(group, source, row) {
  if (broadcasting) return
  broadcasting = true
  for (const peer of membersOf(group).keys()) {
    if (peer !== source) peer.setSelection(row, undefined, undefined, true)
  }
  broadcasting = false
}

/**
 * Clear the crosshair on every other chart when the pointer leaves `source`.
 * @param {string} group Group name.
 * @param {object} source Chart the user left.
 */
export function propagateUnhighlight(group, source) {
  if (broadcasting) return
  broadcasting = true
  for (const [peer, deselect] of membersOf(group)) {
    if (peer === source) continue
    peer.clearSelection()
    deselect?.()
  }
  broadcasting = false
}

/**
 * Apply the same x window (or clear it) on every other chart in the group.
 * `updateOptions({ dateWindow })` redraws without firing the peer's
 * `zoomCallback`, so this cannot loop.
 * @param {string} group Group name.
 * @param {object} source Chart the user zoomed.
 * @param {[number, number]|null} range `[min, max]` in ms, or null for live.
 */
export function propagateZoom(group, source, range) {
  if (broadcasting) return
  broadcasting = true
  for (const peer of membersOf(group).keys()) {
    if (peer !== source) peer.updateOptions({ dateWindow: range })
  }
  broadcasting = false
}
