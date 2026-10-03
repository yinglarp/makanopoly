import { getProperty, isStreet, PROPERTY_LIST } from './board'
import { QUIZ_FEE, type GameState, type Quiz } from './types'

export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1))
    const current = copy[index]
    copy[index] = copy[swap]
    copy[swap] = current
  }
  return copy
}

export function makeQuiz(streetId: string, topic: 'dish' | 'line', rng: () => number): Quiz {
  const street = getProperty(streetId)
  if (!isStreet(street)) throw new Error('Only streets have a quiz')
  const correct = topic === 'dish' ? street.dish : street.line
  const pool = PROPERTY_LIST.filter(isStreet)
    .filter((other) => other.id !== streetId)
    .map((other) => (topic === 'dish' ? other.dish : other.line))
    .filter((value) => value !== correct)
  const unique = [...new Set(pool)]
  const distractors = shuffle(unique, rng).slice(0, 2)
  const options = shuffle([correct, ...distractors], rng)
  const prompt = topic === 'dish'
    ? `What should you eat at ${street.name}?`
    : `Which LTA rail line serves ${street.name}?`
  return {
    streetId,
    topic,
    prompt,
    options,
    answer: options.indexOf(correct),
    reveal: `${street.neighborhood} · ${street.dish} at ${street.hawker}. ${street.about}`,
  }
}

export function foodVisible(state: GameState, streetId: string): boolean {
  if (state.revealedStreet === streetId) return true
  const player = state.players[state.current]
  if (!player || player.isAi) return false
  return player.mastered.includes(streetId)
}

export { QUIZ_FEE }
