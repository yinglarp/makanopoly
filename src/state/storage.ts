import { SAVE_VERSION, type GameState } from '../engine/types'

const KEY = 'makanopoly-save-v1'

export function saveGame(state: GameState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Private browsing can refuse storage. The match still runs.
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const state = JSON.parse(raw) as GameState
    if (!state || state.version !== SAVE_VERSION || !Array.isArray(state.players) || !state.phase) return null
    return state
  } catch {
    return null
  }
}

export function clearGame() {
  localStorage.removeItem(KEY)
}
