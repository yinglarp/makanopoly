import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { decideAiAction } from '../engine/ai'
import { actingPlayerId, applyAction, createGame } from '../engine/rules'
import type { Action, GameState, Seat } from '../engine/types'
import { clearGame, loadGame, saveGame } from './storage'

interface Store {
  state: GameState | null
  hasSave: boolean
  start: (seats: Seat[]) => void
  resume: () => void
  dispatch: (action: Action) => void
  abandon: () => void
}

const GameContext = createContext<Store | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState | null>(null)
  const [hasSave, setHasSave] = useState(() => loadGame() !== null)

  useEffect(() => {
    if (!state) return
    const actorId = actingPlayerId(state)
    const actor = state.players.find((player) => player.id === actorId)
    if (!actor?.isAi) return
    const serial = state.serial
    const timer = window.setTimeout(() => {
      setState((current) => {
        if (!current || current.serial !== serial) return current
        const next = applyAction(current, decideAiAction(current))
        if (next === current) return current
        saveGame(next)
        return next
      })
    }, 700)
    return () => window.clearTimeout(timer)
  }, [state])

  const store = useMemo<Store>(() => ({
    state,
    hasSave,
    start: (seats) => {
      const next = createGame(seats)
      saveGame(next)
      setHasSave(true)
      setState(next)
    },
    resume: () => {
      const saved = loadGame()
      if (saved) setState(saved)
    },
    dispatch: (action) => {
      setState((current) => {
        if (!current) return current
        const next = applyAction(current, action)
        if (next === current) return current
        saveGame(next)
        return next
      })
    },
    abandon: () => {
      clearGame()
      setHasSave(false)
      setState(null)
    },
  }), [state, hasSave])

  return <GameContext.Provider value={store}>{children}</GameContext.Provider>
}

export function useGame(): Store {
  const store = useContext(GameContext)
  if (!store) throw new Error('useGame must be used inside GameProvider')
  return store
}
