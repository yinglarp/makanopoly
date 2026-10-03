import { BOARD, getProperty, gridCell, GROUP_COLOR, inkFor, isStreet, squareLabel } from '../engine/board'
import { money } from '../engine/format'
import { spotlightFood } from '../engine/rules'
import type { GameState, Square } from '../engine/types'
import { TokenGlyph } from './icons'

export function Board({ state, onInspect }: { state: GameState; onInspect: (id: string) => void }) {
  const spotlight = spotlightFood(state)
  return (
    <div className="board-wrap">
      <div className="board">
        {BOARD.map((square) => (
          <SquareView key={square.index} square={square} state={state} onInspect={onInspect} />
        ))}
        <div className="center">
          <p className="center-kicker">Makanopoly</p>
          <h2>{spotlight?.title ?? 'Singapore'}</h2>
          {spotlight?.group && <span className="swatch" style={{ background: GROUP_COLOR[spotlight.group] }} />}
          <div className="center-copy">
            {(spotlight?.lines ?? []).map((line) => <p key={line}>{line}</p>)}
          </div>
          <div className="dice-row" aria-label="Dice">
            <Die value={state.dice?.[0] ?? 1} hidden={!state.dice} />
            <Die value={state.dice?.[1] ?? 1} hidden={!state.dice} />
          </div>
          <p className="tip">{state.tip}</p>
        </div>
      </div>
    </div>
  )
}

function SquareView({ state, square, onInspect }: { state: GameState; square: Square; onInspect: (id: string) => void }) {
  const cell = gridCell(square.index)
  const property = square.kind === 'property' ? getProperty(square.propertyId) : null
  const holding = property ? state.holdings[property.id] : null
  const owner = holding?.ownerId ? state.players.find((player) => player.id === holding.ownerId) : null
  const here = state.players.filter((player) => !player.bankrupt && player.position === square.index)
  const price = property ? money(property.price) : ''
  return (
    <button
      type="button"
      className={`sq ${cell.side}${square.index === state.players[state.current]?.position ? ' here' : ''}`}
      style={{ gridColumn: cell.col + 1, gridRow: cell.row + 1 }}
      onClick={() => property && onInspect(property.id)}
    >
      <span className="sq-face">
        {property && <span className="bar" style={{ background: GROUP_COLOR[property.group], color: inkFor(property.group) }} />}
        <span className="sq-copy">
          <span className="sq-name">{property ? property.short : squareLabel(square)}</span>
          {price && <span className="sq-price">{price}</span>}
          {holding && holding.houses > 0 && (
            <span className="pips">{holding.houses === 5 ? 'Hotel' : `${holding.houses} hs`}</span>
          )}
        </span>
        {owner && <span className="owner-dot" style={{ background: owner.color }} title={owner.name} />}
        {holding?.mortgaged && <span className="mortgage-flag">M</span>}
      </span>
      <span className="occupants">
        {here.map((player) => <TokenGlyph key={player.id} token={player.token} color={player.color} />)}
      </span>
      {property && isStreet(property) ? <span className="sr">{property.name}</span> : null}
    </button>
  )
}

function Die({ value, hidden }: { value: number; hidden: boolean }) {
  const pips: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  }
  return (
    <div className={hidden ? 'die ghost' : 'die'} aria-hidden={hidden}>
      {Array.from({ length: 9 }, (_, index) => (
        <span key={index} className={(pips[value] ?? []).includes(index) ? 'pip on' : 'pip'} />
      ))}
    </div>
  )
}
