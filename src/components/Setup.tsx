import { useState } from 'react'
import type { Seat, TokenId } from '../engine/types'
import { useGame } from '../state/gameStore'
import { TOKEN_CHOICES, TokenGlyph } from './icons'

interface Draft extends Seat {
  key: string
}

const COLORS = ['#c23b22', '#0f6e6e', '#b8860b', '#2c4c8c']

function freshSeat(index: number, ai: boolean): Draft {
  const names = ['You', 'Auntie May', 'Uncle Tan', 'Botak']
  const used = TOKEN_CHOICES.map((token) => token.id)
  return {
    key: `${index}-${ai ? 'ai' : 'you'}`,
    name: names[index] ?? `Player ${index + 1}`,
    isAi: ai,
    token: used[index] ?? 'orchid',
  }
}

export function Setup() {
  const { start, resume, hasSave } = useGame()
  const [seats, setSeats] = useState<Draft[]>([freshSeat(0, false), freshSeat(1, true)])

  function update(key: string, patch: Partial<Draft>) {
    setSeats((current) => current.map((seat) => (seat.key === key ? { ...seat, ...patch } : seat)))
  }

  function takeToken(key: string, token: TokenId) {
    setSeats((current) => current.map((seat) => {
      if (seat.key === key) return { ...seat, token }
      if (seat.token === token) {
        const spare = TOKEN_CHOICES.find((choice) => !current.some((other) => other.key !== key && other.token === choice.id))
        return spare ? { ...seat, token: spare.id } : seat
      }
      return seat
    }))
  }

  return (
    <main className="setup">
      <div className="setup-card">
        <p className="eyebrow">Singapore streets · hawker stalls · rent</p>
        <h1>Makanopoly</h1>
        <p className="lede">
          Walk the island, learn the neighbourhood dish, and keep enough cash to pay rent.
          The default match is you against Auntie May.
        </p>
        <ol className="lesson-list">
          <li>Passing GO pays a S$200 salary.</li>
          <li>A deed is an asset. A full colour set doubles the base rent.</li>
          <li>Houses and hotels raise rent, and they tie up cash.</li>
          <li>A mortgage is a loan of half the price, plus 10% interest to close it.</li>
          <li>A wrong street question costs S$50. Lock-up skips your movement.</li>
        </ol>
        <div className="seat-list">
          {seats.map((seat, index) => (
            <fieldset key={seat.key} className="seat">
              <legend style={{ color: COLORS[index] }}>{seat.isAi ? 'AI' : 'Human'} {index + 1}</legend>
              <label>
                Name
                <input value={seat.name} maxLength={18} onChange={(event) => update(seat.key, { name: event.target.value })} />
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={seat.isAi}
                  onChange={(event) => update(seat.key, { isAi: event.target.checked })}
                />
                Computer player
              </label>
              <div className="token-row">
                {TOKEN_CHOICES.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    className={seat.token === choice.id ? 'token-pick on' : 'token-pick'}
                    onClick={() => takeToken(seat.key, choice.id)}
                    aria-label={choice.label}
                    title={choice.label}
                  >
                    <TokenGlyph token={choice.id} color={COLORS[index]} />
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <div className="setup-actions">
          {seats.length < 4 && (
            <button type="button" className="ghost" onClick={() => setSeats((current) => [...current, freshSeat(current.length, false)])}>
              Add player
            </button>
          )}
          {seats.length > 2 && (
            <button type="button" className="ghost" onClick={() => setSeats((current) => current.slice(0, -1))}>
              Remove last
            </button>
          )}
          <button type="button" className="primary" onClick={() => start(seats.map(({ name, isAi, token }) => ({ name, isAi, token })))}>
            Start match
          </button>
          {hasSave && (
            <button type="button" className="teal" onClick={resume}>
              Continue saved match
            </button>
          )}
        </div>
        <p className="fine">Unofficial game for learning streets, food, and money. Pass one device around for more than one human.</p>
      </div>
    </main>
  )
}
