import { getProperty, groupIds, isStreet } from './board'
import { groupHasBuildings, playerById } from './develop'
import type { ColorGroup, GameState, TradeOffer } from './types'
import { COLOR_GROUPS } from './board'

export function tradeError(state: GameState, trade: TradeOffer): string | null {
  if (trade.fromId === trade.toId) return 'Pick another player.'
  const from = state.players.find((player) => player.id === trade.fromId)
  const to = state.players.find((player) => player.id === trade.toId)
  if (!from || !to || from.bankrupt || to.bankrupt) return 'That player is out of the match.'
  if (trade.offerCash < 0 || trade.requestCash < 0) return 'Cash cannot be negative.'
  if (from.cash < trade.offerCash) return `${from.name} does not have that much cash.`
  if (to.cash < trade.requestCash) return `${to.name} does not have that much cash.`
  const seen = new Set<string>()
  for (const id of [...trade.offerIds, ...trade.requestIds]) {
    if (seen.has(id)) return 'Each deed can only be in the trade once.'
    seen.add(id)
  }
  for (const id of trade.offerIds) {
    const reason = deedTradeError(state, id, trade.fromId)
    if (reason) return reason
  }
  for (const id of trade.requestIds) {
    const reason = deedTradeError(state, id, trade.toId)
    if (reason) return reason
  }
  if (trade.offerCash === 0 && trade.requestCash === 0 && trade.offerIds.length === 0 && trade.requestIds.length === 0) {
    return 'Add cash or a deed to the trade.'
  }
  return null
}

function deedTradeError(state: GameState, propertyId: string, ownerId: string): string | null {
  const holding = state.holdings[propertyId]
  if (!holding || holding.ownerId !== ownerId) return 'A deed in this trade is not owned by that player.'
  if (groupHasBuildings(state, propertyId)) return 'Sell the buildings on that colour set before you trade it.'
  return null
}

export function executeTrade(state: GameState, trade: TradeOffer): void {
  const from = playerById(state, trade.fromId)
  const to = playerById(state, trade.toId)
  from.cash -= trade.offerCash
  from.cash += trade.requestCash
  to.cash += trade.offerCash
  to.cash -= trade.requestCash
  for (const id of trade.offerIds) state.holdings[id].ownerId = trade.toId
  for (const id of trade.requestIds) state.holdings[id].ownerId = trade.fromId
}

function valueTo(state: GameState, propertyId: string, playerId: string, mode: 'gain' | 'lose'): number {
  const property = getProperty(propertyId)
  if (!isStreet(property)) return mode === 'lose' ? property.price : Math.round(property.price * 0.85)
  const ids = groupIds(property.group)
  const owned = ids.filter((id) => state.holdings[id].ownerId === playerId).length
  if (mode === 'lose') {
    if (owned === ids.length) return property.price * 3
    if (owned >= 2) return Math.round(property.price * 1.8)
    return property.price
  }
  if (owned === ids.length - 1) return property.price * 2
  if (owned > 0) return Math.round(property.price * 1.15)
  return Math.round(property.price * 0.75)
}

export function aiAccepts(state: GameState, trade: TradeOffer): boolean {
  const to = playerById(state, trade.toId)
  if (to.cash + trade.offerCash - trade.requestCash < 80) return false
  let score = trade.offerCash - trade.requestCash
  for (const id of trade.offerIds) score += valueTo(state, id, trade.toId, 'gain')
  for (const id of trade.requestIds) score -= valueTo(state, id, trade.toId, 'lose')
  return score >= 0
}

export function suggestTrade(state: GameState, fromId: string): TradeOffer | null {
  const me = playerById(state, fromId)
  for (const group of COLOR_GROUPS) {
    const ids = groupIds(group as ColorGroup)
    const mine = ids.filter((id) => state.holdings[id].ownerId === fromId)
    const missing = ids.filter((id) => {
      const owner = state.holdings[id].ownerId
      return owner !== null && owner !== fromId
    })
    if (mine.length !== ids.length - 1 || missing.length !== 1) continue
    const propertyId = missing[0]
    if (groupHasBuildings(state, propertyId)) continue
    const ownerId = state.holdings[propertyId].ownerId
    if (!ownerId) continue
    const property = getProperty(propertyId)
    const cash = Math.min(me.cash - 200, property.price * 2)
    if (cash < property.price * 1.5) continue
    const trade: TradeOffer = {
      fromId,
      toId: ownerId,
      offerCash: cash,
      requestCash: 0,
      offerIds: [],
      requestIds: [propertyId],
    }
    const target = playerById(state, ownerId)
    if (target.isAi && !aiAccepts(state, trade)) continue
    return trade
  }
  return null
}

export function propertyBidValue(state: GameState, propertyId: string, playerId: string): number {
  const property = getProperty(propertyId)
  if (!isStreet(property)) return Math.round(property.price * 0.9)
  const ids = groupIds(property.group)
  const owned = ids.filter((id) => state.holdings[id].ownerId === playerId).length
  if (owned === ids.length - 1) return Math.round(property.price * 1.6)
  if (owned > 0) return Math.round(property.price * 1.2)
  const rivalCompletes = state.players.some((player) => {
    if (player.id === playerId || player.bankrupt) return false
    const rivalOwned = ids.filter((id) => state.holdings[id].ownerId === player.id).length
    return rivalOwned === ids.length - 1
  })
  if (rivalCompletes) return Math.round(property.price * 1.35)
  return Math.round(property.price * 0.8)
}
