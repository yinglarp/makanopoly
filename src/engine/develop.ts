import { getProperty, groupIds, isStreet, mortgageValue, PROPERTY_LIST, unmortgageCost } from './board'
import type { ColorGroup, GameState, Player } from './types'

export function playerById(state: GameState, id: string): Player {
  const player = state.players.find((candidate) => candidate.id === id)
  if (!player) throw new Error(`Unknown player ${id}`)
  return player
}

export function ownsFullSet(state: GameState, playerId: string, group: ColorGroup): boolean {
  return groupIds(group).every((id) => state.holdings[id]?.ownerId === playerId)
}

export function monopolyReady(state: GameState, playerId: string, group: ColorGroup): boolean {
  return groupIds(group).every((id) => state.holdings[id]?.ownerId === playerId && !state.holdings[id]?.mortgaged)
}

export function groupHasBuildings(state: GameState, propertyId: string): boolean {
  const property = getProperty(propertyId)
  if (!isStreet(property)) return false
  return groupIds(property.group).some((id) => state.holdings[id].houses > 0)
}

function houseCounts(state: GameState, group: ColorGroup): number[] {
  return groupIds(group).map((id) => state.holdings[id].houses)
}

export function buildError(state: GameState, playerId: string, propertyId: string): string | null {
  const property = getProperty(propertyId)
  const holding = state.holdings[propertyId]
  if (!holding || holding.ownerId !== playerId) return 'You do not own this deed.'
  if (!isStreet(property)) return 'Only streets can be built on.'
  if (!ownsFullSet(state, playerId, property.group)) return 'You need the whole colour set before you build.'
  if (!monopolyReady(state, playerId, property.group)) return 'Unmortgage every street in the set before you build.'
  if (holding.houses >= 5) return 'This street already has a hotel.'
  const next = houseCounts(state, property.group).map((count, index) => {
    const id = groupIds(property.group)[index]
    return id === propertyId ? count + 1 : count
  })
  if (Math.max(...next) - Math.min(...next) > 1) return 'Build evenly across the colour set.'
  if (holding.houses === 4) {
    if (state.hotelsLeft < 1) return 'No hotels left in the bank.'
  } else if (state.housesLeft < 1) return 'No houses left in the bank.'
  const owner = playerById(state, playerId)
  if (owner.cash < property.houseCost) return 'Not enough cash to build.'
  return null
}

export function sellError(state: GameState, playerId: string, propertyId: string): string | null {
  const property = getProperty(propertyId)
  const holding = state.holdings[propertyId]
  if (!holding || holding.ownerId !== playerId) return 'You do not own this deed.'
  if (!isStreet(property)) return 'There is nothing to sell here.'
  if (holding.houses <= 0) return 'This street has no buildings.'
  if (holding.houses === 5 && state.housesLeft < 4) return 'The bank does not have four houses to break this hotel.'
  const next = houseCounts(state, property.group).map((count, index) => {
    const id = groupIds(property.group)[index]
    return id === propertyId ? count - 1 : count
  })
  if (Math.max(...next) - Math.min(...next) > 1) return 'Sell buildings evenly across the colour set.'
  return null
}

export function mortgageError(state: GameState, playerId: string, propertyId: string): string | null {
  const holding = state.holdings[propertyId]
  if (!holding || holding.ownerId !== playerId) return 'You do not own this deed.'
  if (holding.mortgaged) return 'This deed is already mortgaged.'
  if (groupHasBuildings(state, propertyId)) return 'Sell the buildings on this colour set first.'
  return null
}

export function unmortgageError(state: GameState, playerId: string, propertyId: string): string | null {
  const property = getProperty(propertyId)
  const holding = state.holdings[propertyId]
  if (!holding || holding.ownerId !== playerId) return 'You do not own this deed.'
  if (!holding.mortgaged) return 'This deed is not mortgaged.'
  const owner = playerById(state, playerId)
  if (owner.cash < unmortgageCost(property.price)) return 'Not enough cash to pay the mortgage plus 10% interest.'
  return null
}

export function tryBuild(state: GameState, playerId: string, propertyId: string): string | null {
  const error = buildError(state, playerId, propertyId)
  if (error) return error
  const property = getProperty(propertyId)
  if (!isStreet(property)) return 'Only streets can be built on.'
  const holding = state.holdings[propertyId]
  const owner = playerById(state, playerId)
  owner.cash -= property.houseCost
  if (holding.houses === 4) {
    state.hotelsLeft -= 1
    state.housesLeft += 4
    holding.houses = 5
  } else {
    state.housesLeft -= 1
    holding.houses += 1
  }
  return null
}

export function trySell(state: GameState, playerId: string, propertyId: string): string | null {
  const error = sellError(state, playerId, propertyId)
  if (error) return error
  const property = getProperty(propertyId)
  if (!isStreet(property)) return 'There is nothing to sell here.'
  const holding = state.holdings[propertyId]
  const owner = playerById(state, playerId)
  owner.cash += property.houseCost / 2
  if (holding.houses === 5) {
    state.housesLeft -= 4
    state.hotelsLeft += 1
    holding.houses = 4
  } else {
    state.housesLeft += 1
    holding.houses -= 1
  }
  return null
}

export function tryMortgage(state: GameState, playerId: string, propertyId: string): string | null {
  const error = mortgageError(state, playerId, propertyId)
  if (error) return error
  const property = getProperty(propertyId)
  state.holdings[propertyId].mortgaged = true
  playerById(state, playerId).cash += mortgageValue(property.price)
  return null
}

export function tryUnmortgage(state: GameState, playerId: string, propertyId: string): string | null {
  const error = unmortgageError(state, playerId, propertyId)
  if (error) return error
  const property = getProperty(propertyId)
  state.holdings[propertyId].mortgaged = false
  playerById(state, playerId).cash -= unmortgageCost(property.price)
  return null
}

export function bestBuild(state: GameState, playerId: string, reserve: number): string | null {
  let best: { id: string; gain: number } | null = null
  for (const property of PROPERTY_LIST) {
    if (!isStreet(property)) continue
    if (buildError(state, playerId, property.id)) continue
    if (playerById(state, playerId).cash - property.houseCost < reserve) continue
    const holding = state.holdings[property.id]
    const before = property.rent[holding.houses]
    const after = property.rent[holding.houses + 1]
    const gain = after - before
    if (!best || gain > best.gain) best = { id: property.id, gain }
  }
  return best?.id ?? null
}

export function bestSell(state: GameState, playerId: string): string | null {
  let best: { id: string; cash: number } | null = null
  for (const property of PROPERTY_LIST) {
    if (!isStreet(property)) continue
    if (sellError(state, playerId, property.id)) continue
    const cash = property.houseCost / 2
    if (!best || cash > best.cash) best = { id: property.id, cash }
  }
  return best?.id ?? null
}

export function bestMortgage(state: GameState, playerId: string): string | null {
  let best: { id: string; score: number } | null = null
  for (const property of PROPERTY_LIST) {
    if (mortgageError(state, playerId, property.id)) continue
    let score = property.price
    if (isStreet(property) && ownsFullSet(state, playerId, property.group)) score += 10000
    if (!best || score < best.score) best = { id: property.id, score }
  }
  return best?.id ?? null
}

export function bestUnmortgage(state: GameState, playerId: string, reserve: number): string | null {
  let best: { id: string; score: number } | null = null
  for (const property of PROPERTY_LIST) {
    if (unmortgageError(state, playerId, property.id)) continue
    if (playerById(state, playerId).cash - unmortgageCost(property.price) < reserve) continue
    let score = property.price
    if (isStreet(property)) {
      const owned = groupIds(property.group).filter((id) => state.holdings[id].ownerId === playerId).length
      if (owned === groupIds(property.group).length) score += 5000
    }
    if (!best || score > best.score) best = { id: property.id, score }
  }
  return best?.id ?? null
}
