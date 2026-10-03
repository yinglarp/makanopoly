import { getProperty, groupIds, isStreet, PROPERTY_LIST } from './board'
import { bestBuild, bestMortgage, bestSell, bestUnmortgage, monopolyReady, playerById } from './develop'
import { propertyBidValue, suggestTrade } from './trade'
import type { Action, ColorGroup, GameState } from './types'
import { COLOR_GROUPS } from './board'

const RESERVE = 200

export function decideAiAction(state: GameState, rng: () => number = Math.random): Action {
  const actorId = actorIdFor(state)
  const me = actorId ? playerById(state, actorId) : state.players[state.current]
  switch (state.phase) {
    case 'quiz': {
      const quiz = state.quiz
      if (!quiz) return { type: 'ack' }
      if (rng() < 0.75) return { type: 'answer', choice: quiz.answer }
      const wrong = [0, 1, 2].filter((choice) => choice !== quiz.answer)
      return { type: 'answer', choice: wrong[Math.floor(rng() * wrong.length)] ?? 0 }
    }
    case 'quizResult':
    case 'card':
    case 'notice':
      return { type: 'ack' }
    case 'tax': {
      const ten = Math.floor(me.cash * 0.1)
      return { type: 'payTax', mode: ten <= 200 ? 'percent' : 'flat' }
    }
    case 'buy': {
      if (state.buyId && wantsToBuy(state, me.id, state.buyId)) return { type: 'buy' }
      return { type: 'decline' }
    }
    case 'auction': {
      const auction = state.auction
      if (!auction) return { type: 'pass' }
      const completes = wouldComplete(state, me.id, auction.propertyId)
      const ceiling = Math.min(propertyBidValue(state, auction.propertyId, me.id), me.cash - (completes ? 50 : RESERVE))
      const next = auction.bid === 0 ? Math.min(10, ceiling) : auction.bid + 10
      if (next > auction.bid && next <= ceiling) return { type: 'bid', amount: next }
      return { type: 'pass' }
    }
    case 'jail': {
      if (me.jailCards.length > 0) return { type: 'useJailCard' }
      const pressure = opponentsHaveSet(state, me.id)
      if ((pressure || me.jailTurns >= 2 || me.cash > 500) && me.cash >= 50) return { type: 'payJail' }
      return { type: 'roll' }
    }
    case 'debt': {
      const sell = bestSell(state, me.id)
      if (sell) return { type: 'sell', propertyId: sell }
      const mortgage = bestMortgage(state, me.id)
      if (mortgage) return { type: 'mortgage', propertyId: mortgage }
      if (state.debt && me.cash >= state.debt.amount) return { type: 'settle' }
      return { type: 'bankrupt' }
    }
    case 'trade':
      return { type: 'declineTrade' }
    case 'preRoll':
    case 'postRoll': {
      if (state.phase === 'postRoll' && state.mustRollAgain) return { type: 'roll' }
      const build = bestBuild(state, me.id, RESERVE)
      if (build) return { type: 'build', propertyId: build }
      const unmortgage = bestUnmortgage(state, me.id, 250)
      if (unmortgage) return { type: 'unmortgage', propertyId: unmortgage }
      if (state.phase === 'preRoll' && !state.tradeOffered) {
        const trade = suggestTrade(state, me.id)
        if (trade) return { type: 'proposeTrade', trade }
      }
      if (state.phase === 'preRoll') return { type: 'roll' }
      return { type: 'end' }
    }
    default:
      return { type: 'ack' }
  }
}

function actorIdFor(state: GameState): string | null {
  if (state.phase === 'debt' && state.debt) return state.debt.playerId
  if (state.phase === 'auction' && state.auction) return state.auction.bidderId
  if (state.phase === 'trade' && state.pendingTrade) return state.pendingTrade.toId
  return state.players[state.current]?.id ?? null
}

function wantsToBuy(state: GameState, playerId: string, propertyId: string): boolean {
  const property = getProperty(propertyId)
  const player = playerById(state, playerId)
  if (player.cash < property.price) return false
  const left = player.cash - property.price
  if (wouldComplete(state, playerId, propertyId)) return left >= 50
  if (isStreet(property)) {
    const owned = groupIds(property.group).filter((id) => state.holdings[id].ownerId === playerId).length
    if (owned > 0) return left >= 100
  } else {
    const owned = PROPERTY_LIST.filter((item) => item.group === property.group && state.holdings[item.id].ownerId === playerId).length
    if (owned > 0) return left >= 80
  }
  return left >= RESERVE
}

function wouldComplete(state: GameState, playerId: string, propertyId: string): boolean {
  const property = getProperty(propertyId)
  if (!isStreet(property)) return false
  const ids = groupIds(property.group)
  const owned = ids.filter((id) => state.holdings[id].ownerId === playerId).length
  return owned === ids.length - 1
}

function opponentsHaveSet(state: GameState, playerId: string): boolean {
  return state.players.some((player) => {
    if (player.bankrupt || player.id === playerId) return false
    return COLOR_GROUPS.some((group) => monopolyReady(state, player.id, group as ColorGroup))
  })
}
