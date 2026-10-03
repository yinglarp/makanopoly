import { useState } from 'react'
import { getProperty, GROUP_COLOR, isStreet, mortgageValue } from '../engine/board'
import { money } from '../engine/format'
import { currentPlayer } from '../engine/rules'
import { foodVisible } from '../engine/quiz'
import type { GameState, StreetProperty } from '../engine/types'
import { useGame } from '../state/gameStore'
import { TokenGlyph } from './icons'

export function Modals({ state, inspectId, onCloseInspect }: { state: GameState; inspectId: string | null; onCloseInspect: () => void }) {
  return (
    <>
      {state.phase === 'handoff' && <Handoff state={state} />}
      {state.phase === 'quiz' && state.quiz && <Quiz state={state} />}
      {state.phase === 'quizResult' && state.quizResult && <QuizResult state={state} />}
      {state.phase === 'buy' && state.buyId && <Buy state={state} propertyId={state.buyId} />}
      {state.phase === 'auction' && state.auction && <Auction state={state} />}
      {state.phase === 'tax' && <Tax />}
      {state.phase === 'card' && state.card && <CardModal text={state.card.text} title={state.card.deck === 'chance' ? 'Chance' : 'Community Chest'} />}
      {state.phase === 'notice' && state.notice && <CardModal text={state.notice.message} title="Lock-up" />}
      {state.phase === 'trade' && state.pendingTrade && <IncomingTrade state={state} />}
      {state.phase === 'gameOver' && <Winner state={state} />}
      {inspectId && <Inspect state={state} propertyId={inspectId} onClose={onCloseInspect} />}
    </>
  )
}

function Handoff({ state }: { state: GameState }) {
  const { dispatch } = useGame()
  const player = currentPlayer(state)
  return (
    <div className="handoff">
      <TokenGlyph token={player.token} color={player.color} />
      <p className="eyebrow">Pass the device</p>
      <h2>{player.name}</h2>
      <p>{player.inJail ? 'You are in lock-up.' : 'The board is public. It is your turn to roll.'}</p>
      <button type="button" className="primary" onClick={() => dispatch({ type: 'ready' })}>I’m ready</button>
    </div>
  )
}

function Quiz({ state }: { state: GameState }) {
  const { dispatch } = useGame()
  const quiz = state.quiz
  if (!quiz) return null
  return (
    <div className="modal-back">
      <div className="modal" role="dialog" aria-labelledby="quiz-title">
        <p className="eyebrow">Street question · wrong answer costs S$50</p>
        <h3 id="quiz-title">{quiz.prompt}</h3>
        <div className="choices">
          {quiz.options.map((option, index) => (
            <button key={option} type="button" disabled={currentPlayer(state).isAi} onClick={() => dispatch({ type: 'answer', choice: index })}>{option}</button>
          ))}
        </div>
        {currentPlayer(state).isAi && <p>{currentPlayer(state).name} is answering.</p>}
      </div>
    </div>
  )
}

function QuizResult({ state }: { state: GameState }) {
  const { dispatch } = useGame()
  const result = state.quizResult
  if (!result) return null
  return (
    <div className="modal-back">
      <div className="modal" role="dialog" aria-labelledby="result-title">
        <h3 id="result-title">{result.correct ? 'Correct' : 'That’ll be S$50'}</h3>
        <p>{result.correct ? 'You mastered this street.' : `You picked ${result.chosen}.`}</p>
        <p>{result.reveal}</p>
        <button type="button" className="primary" onClick={() => dispatch({ type: 'ack' })}>Continue</button>
      </div>
    </div>
  )
}

function Buy({ state, propertyId }: { state: GameState; propertyId: string }) {
  const { dispatch } = useGame()
  const property = getProperty(propertyId)
  const player = currentPlayer(state)
  return (
    <div className="modal-back">
      <div className="modal deed-modal" role="dialog" aria-labelledby="buy-title">
        <DeedBody state={state} propertyId={propertyId} />
        <p className="tip">Buying turns cash into an asset that can earn rent.</p>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={() => dispatch({ type: 'decline' })}>Auction it</button>
          <button type="button" className="primary" disabled={player.cash < property.price} onClick={() => dispatch({ type: 'buy' })}>
            Buy for {money(property.price)}
          </button>
        </div>
      </div>
    </div>
  )
}

function Auction({ state }: { state: GameState }) {
  const { dispatch } = useGame()
  const auction = state.auction
  const bidder = auction ? state.players.find((player) => player.id === auction.bidderId) : undefined
  const [amount, setAmount] = useState((auction?.bid ?? 0) + 10)
  if (!auction || !bidder) return null
  if (bidder.isAi) {
    return (
      <div className="modal-back">
        <div className="modal">
          <h3>Auction</h3>
          <p>{getProperty(auction.propertyId).name}</p>
          <p>{auction.bid > 0 ? `High bid ${money(auction.bid)}.` : 'No bids yet.'} Waiting for {bidder.name}.</p>
        </div>
      </div>
    )
  }
  const offer = Math.max(auction.bid + 1, Number.isFinite(amount) ? amount : auction.bid + 1)
  return (
    <div className="modal-back">
      <div className="modal" role="dialog" aria-labelledby="auction-title">
        <h3 id="auction-title">{bidder.name}, bid on {getProperty(auction.propertyId).short}</h3>
        <p>{auction.bid > 0 ? `Current bid ${money(auction.bid)}.` : 'No bids yet. The printed price is only a guide.'}</p>
        <DeedBody state={state} propertyId={auction.propertyId} />
        <label>
          Your bid
          <input type="number" min={auction.bid + 1} max={bidder.cash} value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
        </label>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={() => dispatch({ type: 'pass' })}>Pass</button>
          <button type="button" className="primary" onClick={() => dispatch({ type: 'bid', amount: offer })}>Bid {money(offer)}</button>
        </div>
      </div>
    </div>
  )
}

function Tax() {
  const { dispatch } = useGame()
  return (
    <div className="modal-back">
      <div className="modal" role="dialog" aria-labelledby="tax-title">
        <h3 id="tax-title">Income tax</h3>
        <p>Choose the smaller bill. Ten percent moves with your cash. S$200 does not.</p>
        <div className="modal-actions">
          <button type="button" onClick={() => dispatch({ type: 'payTax', mode: 'percent' })}>Pay 10%</button>
          <button type="button" className="primary" onClick={() => dispatch({ type: 'payTax', mode: 'flat' })}>Pay S$200</button>
        </div>
      </div>
    </div>
  )
}

function CardModal({ title, text }: { title: string; text: string }) {
  const { dispatch } = useGame()
  return (
    <div className="modal-back">
      <div className="modal" role="dialog" aria-labelledby="card-title">
        <p className="eyebrow">{title}</p>
        <h3 id="card-title">{text}</h3>
        <button type="button" className="primary" onClick={() => dispatch({ type: 'ack' })}>Continue</button>
      </div>
    </div>
  )
}

function IncomingTrade({ state }: { state: GameState }) {
  const { dispatch } = useGame()
  const trade = state.pendingTrade
  if (!trade) return null
  const from = state.players.find((player) => player.id === trade.fromId)
  const to = state.players.find((player) => player.id === trade.toId)
  return (
    <div className="modal-back">
      <div className="modal" role="dialog" aria-labelledby="incoming-title">
        <h3 id="incoming-title">{to?.name}, {from?.name} offers a trade</h3>
        <p>Gives {money(trade.offerCash)} and {labelDeeds(trade.offerIds)}.</p>
        <p>Wants {money(trade.requestCash)} and {labelDeeds(trade.requestIds)}.</p>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={() => dispatch({ type: 'declineTrade' })}>Decline</button>
          <button type="button" className="primary" onClick={() => dispatch({ type: 'acceptTrade' })}>Accept</button>
        </div>
      </div>
    </div>
  )
}

function Winner({ state }: { state: GameState }) {
  const { abandon } = useGame()
  const winner = state.players.find((player) => player.id === state.winnerId)
  return (
    <div className="handoff">
      <p className="eyebrow">Last player standing</p>
      <h2>{winner?.name ?? 'Draw'}</h2>
      <ul className="roster plain">
        {state.players.map((player) => (
          <li key={player.id}>
            <strong>{player.name}</strong>
            <span>{money(player.cash)} · rent earned {money(player.rentEarned)} · streets known {player.mastered.length}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="primary" onClick={abandon}>Back to title</button>
    </div>
  )
}

function Inspect({ state, propertyId, onClose }: { state: GameState; propertyId: string; onClose: () => void }) {
  return (
    <div className="modal-back" onClick={onClose} role="presentation">
      <div className="modal deed-modal" role="dialog" aria-labelledby="inspect-title" onClick={(event) => event.stopPropagation()}>
        <DeedBody state={state} propertyId={propertyId} />
        <button type="button" className="primary" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

function DeedBody({ state, propertyId }: { state: GameState; propertyId: string }) {
  const property = getProperty(propertyId)
  const showFood = isStreet(property) && foodVisible(state, propertyId)
  return (
    <div>
      <p className="eyebrow" style={{ color: GROUP_COLOR[property.group] }}>{property.group === 'mrt' ? 'MRT line' : property.group === 'utility' ? 'Utility' : 'Street deed'}</p>
      <h3 id="buy-title">{property.name}</h3>
      <p className="price-line">{money(property.price)} · mortgage {money(mortgageValue(property.price))}</p>
      {isStreet(property) && showFood && <Food street={property} />}
      {isStreet(property) && !showFood && <p>Land here and answer the question to learn the dish and neighbourhood.</p>}
      {!isStreet(property) && <p>{property.about}</p>}
      {isStreet(property) && <RentTable street={property} />}
    </div>
  )
}

function Food({ street }: { street: StreetProperty }) {
  return (
    <div className="food">
      <strong>{street.dish}</strong>
      <span>{street.neighborhood} · {street.hawker}</span>
      <p>{street.about}</p>
    </div>
  )
}

function RentTable({ street }: { street: StreetProperty }) {
  const rows = ['Rent', '1 house', '2 houses', '3 houses', '4 houses', 'Hotel']
  return (
    <table>
      <tbody>
        {rows.map((label, index) => (
          <tr key={label}><th>{label}</th><td>{money(street.rent[index] ?? 0)}{index === 0 ? ' · double with the set' : ''}</td></tr>
        ))}
        <tr><th>House</th><td>{money(street.houseCost)} each</td></tr>
      </tbody>
    </table>
  )
}

function labelDeeds(ids: string[]): string {
  if (ids.length === 0) return 'no deeds'
  return ids.map((id) => getProperty(id).short).join(', ')
}
