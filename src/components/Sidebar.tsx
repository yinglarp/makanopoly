import { useState } from 'react'
import { groupIds, isStreet, PROPERTY_LIST, unmortgageCost, mortgageValue } from '../engine/board'
import { buildError, mortgageError, sellError, unmortgageError } from '../engine/develop'
import { money } from '../engine/format'
import { actingPlayerId, bestMortgage, bestSell, currentPlayer } from '../engine/rules'
import type { GameState, TradeOffer } from '../engine/types'
import { useGame } from '../state/gameStore'
import { TokenGlyph } from './icons'

export function Sidebar({ state }: { state: GameState }) {
  const { dispatch, abandon } = useGame()
  const [tradeOpen, setTradeOpen] = useState(false)
  const player = currentPlayer(state)
  const actorId = actingPlayerId(state) ?? player.id
  const actor = state.players.find((candidate) => candidate.id === actorId)
  const aiTurn = Boolean(actor?.isAi)
  const managing = state.phase === 'preRoll' || state.phase === 'postRoll' || state.phase === 'debt'
  const canRoll = state.phase === 'preRoll' || (state.phase === 'postRoll' && state.mustRollAgain) || state.phase === 'jail'
  const canEnd = state.phase === 'postRoll' && !state.mustRollAgain

  return (
    <aside className="side">
      <header className="side-head">
        <div>
          <p className="eyebrow">Now playing</p>
          <h2>{player.name}</h2>
        </div>
        <TokenGlyph token={player.token} color={player.color} />
      </header>
      <div className="turn-actions">
        {aiTurn && <p className="fine">{actor?.name} is taking a turn.</p>}
        {!aiTurn && canRoll && state.phase !== 'jail' && <button type="button" className="primary" onClick={() => dispatch({ type: 'roll' })}>Roll</button>}
        {!aiTurn && state.phase === 'jail' && (
          <>
            <button type="button" className="primary" onClick={() => dispatch({ type: 'roll' })}>Roll for doubles</button>
            <button type="button" onClick={() => dispatch({ type: 'payJail' })}>Pay S$50</button>
            {player.jailCards.length > 0 && <button type="button" onClick={() => dispatch({ type: 'useJailCard' })}>Use card</button>}
          </>
        )}
        {!aiTurn && canEnd && <button type="button" className="teal" onClick={() => dispatch({ type: 'end' })}>End turn</button>}
        {!aiTurn && managing && state.phase !== 'debt' && <button type="button" className="ghost" onClick={() => setTradeOpen(true)}>Trade</button>}
        {!aiTurn && state.phase === 'debt' && state.debt && (
          <>
            <p className="fine">Owe {money(state.debt.amount)} for {state.debt.reason}. Raise cash, then pay.</p>
            <button type="button" className="primary" disabled={(actor?.cash ?? 0) < state.debt.amount} onClick={() => dispatch({ type: 'settle' })}>Pay {money(state.debt.amount)}</button>
            <button
              type="button"
              className="danger"
              disabled={Boolean(bestSell(state, actorId) || bestMortgage(state, actorId))}
              onClick={() => dispatch({ type: 'bankrupt' })}
            >
              Go bankrupt
            </button>
          </>
        )}
      </div>
      <ul className="roster">
        {state.players.map((candidate) => (
          <li key={candidate.id} className={candidate.bankrupt ? 'out' : candidate.id === player.id ? 'active' : ''}>
            <TokenGlyph token={candidate.token} color={candidate.color} />
            <strong>{candidate.name}</strong>
            <span>{candidate.bankrupt ? 'Bankrupt' : money(candidate.cash)}</span>
            <em>{candidate.mastered.length}/22</em>
          </li>
        ))}
      </ul>
      <details className="lessons">
        <summary>Money lessons</summary>
        <p>Payday is S$200 for passing GO. A full colour set doubles base rent. Houses and hotels multiply it, then lock that cash up. A mortgage lends half the printed price and costs 10% interest to clear. Income tax is 10% or S$200, whichever you choose.</p>
      </details>
      {managing && (
        <div className="deeds">
          <h3>Deeds for {state.players.find((candidate) => candidate.id === actorId)?.name}</h3>
          {PROPERTY_LIST.filter((property) => state.holdings[property.id].ownerId === actorId).map((property) => {
            const holding = state.holdings[property.id]
            const build = isStreet(property) ? buildError(state, actorId, property.id) : 'Not a street'
            const sell = isStreet(property) ? sellError(state, actorId, property.id) : 'Not a street'
            const mortgage = mortgageError(state, actorId, property.id)
            const unmortgage = unmortgageError(state, actorId, property.id)
            return (
              <article key={property.id} className="deed">
                <header>
                  <strong>{property.short}</strong>
                  <span>{holding.mortgaged ? 'Mortgaged' : holding.houses === 5 ? 'Hotel' : holding.houses ? `${holding.houses} house${holding.houses > 1 ? 's' : ''}` : money(property.price)}</span>
                </header>
                <div className="deed-actions">
                  {state.phase !== 'debt' && (
                    <button type="button" disabled={aiTurn || Boolean(build)} title={build ?? 'Build'} onClick={() => dispatch({ type: 'build', propertyId: property.id })}>Build</button>
                  )}
                  <button type="button" disabled={aiTurn || Boolean(sell)} title={sell ?? 'Sell a building for half'} onClick={() => dispatch({ type: 'sell', propertyId: property.id })}>Sell</button>
                  {holding.mortgaged ? (
                    <button type="button" disabled={aiTurn || state.phase === 'debt' || Boolean(unmortgage)} title={unmortgage ?? `Pay ${money(unmortgageCost(property.price))}`} onClick={() => dispatch({ type: 'unmortgage', propertyId: property.id })}>
                      Unmortgage {money(unmortgageCost(property.price))}
                    </button>
                  ) : (
                    <button type="button" disabled={aiTurn || Boolean(mortgage)} title={mortgage ?? `Borrow ${money(mortgageValue(property.price))}`} onClick={() => dispatch({ type: 'mortgage', propertyId: property.id })}>
                      Mortgage {money(mortgageValue(property.price))}
                    </button>
                  )}
                </div>
              </article>
            )
          })}
          {PROPERTY_LIST.every((property) => state.holdings[property.id].ownerId !== actorId) && <p className="fine">No deeds yet.</p>}
        </div>
      )}
      <ol className="log">
        {[...state.log].reverse().slice(0, 8).map((line, index) => <li key={`${state.serial}-${index}`}>{line}</li>)}
      </ol>
      <button
        type="button"
        className="texty"
        onClick={() => {
          if (window.confirm('Leave this match and return to the title screen?')) abandon()
        }}
      >
        New match
      </button>
      {tradeOpen && <TradeDesk state={state} onClose={() => setTradeOpen(false)} />}
    </aside>
  )
}

function TradeDesk({ state, onClose }: { state: GameState; onClose: () => void }) {
  const { dispatch } = useGame()
  const me = currentPlayer(state)
  const others = state.players.filter((player) => !player.bankrupt && player.id !== me.id)
  const [toId, setToId] = useState(others[0]?.id ?? '')
  const [offerCash, setOfferCash] = useState(0)
  const [requestCash, setRequestCash] = useState(0)
  const [offerIds, setOfferIds] = useState<string[]>([])
  const [requestIds, setRequestIds] = useState<string[]>([])

  function toggle(list: string[], id: string, set: (ids: string[]) => void) {
    set(list.includes(id) ? list.filter((item) => item !== id) : [...list, id])
  }

  function send() {
    const trade: TradeOffer = { fromId: me.id, toId, offerCash, requestCash, offerIds, requestIds }
    dispatch({ type: 'proposeTrade', trade })
    onClose()
  }

  const mine = PROPERTY_LIST.filter((property) => state.holdings[property.id].ownerId === me.id)
  const theirs = PROPERTY_LIST.filter((property) => state.holdings[property.id].ownerId === toId)

  return (
    <div className="modal-back" role="presentation" onClick={onClose}>
      <div className="modal" role="dialog" aria-labelledby="trade-title" onClick={(event) => event.stopPropagation()}>
        <h3 id="trade-title">Offer a trade</h3>
        <p>Buildings must be sold before a colour set can be traded. A mortgaged deed keeps its debt.</p>
        <label>
          Trade with
          <select value={toId} onChange={(event) => { setToId(event.target.value); setRequestIds([]) }}>
            {others.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}
          </select>
        </label>
        <div className="trade-cols">
          <div>
            <h4>You give</h4>
            <label>Cash <input type="number" min={0} max={me.cash} value={offerCash} onChange={(event) => setOfferCash(Number(event.target.value))} /></label>
            {mine.map((property) => (
              <label key={property.id} className="check">
                <input type="checkbox" checked={offerIds.includes(property.id)} onChange={() => toggle(offerIds, property.id, setOfferIds)} />
                {property.short}
              </label>
            ))}
          </div>
          <div>
            <h4>You receive</h4>
            <label>Cash <input type="number" min={0} value={requestCash} onChange={(event) => setRequestCash(Number(event.target.value))} /></label>
            {theirs.map((property) => (
              <label key={property.id} className="check">
                <input type="checkbox" checked={requestIds.includes(property.id)} onChange={() => toggle(requestIds, property.id, setRequestIds)} />
                {property.short}
              </label>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="primary" onClick={send}>Offer</button>
        </div>
        <p className="fine">{groupIds('brown').length > 0 ? 'Count whether the deed finishes a colour set before you agree.' : ''}</p>
      </div>
    </div>
  )
}
