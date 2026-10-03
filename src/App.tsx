import { useState } from 'react'
import { Board } from './components/Board'
import { Modals } from './components/Modals'
import { Setup } from './components/Setup'
import { Sidebar } from './components/Sidebar'
import { GameProvider, useGame } from './state/gameStore'

export function App() {
  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  )
}

function Shell() {
  const { state } = useGame()
  const [inspectId, setInspectId] = useState<string | null>(null)
  if (!state) return <Setup />
  return (
    <main className="table">
      <Board state={state} onInspect={setInspectId} />
      <Sidebar state={state} />
      <Modals state={state} inspectId={inspectId} onCloseInspect={() => setInspectId(null)} />
    </main>
  )
}
