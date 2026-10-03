import { describe, expect, it } from 'vitest'
import { decideAiAction } from './ai'
import { BOARD, getProperty, gridCell, groupIds, isStreet, PROPERTY_LIST, unmortgageCost } from './board'
import { applyAction, createGame, rentAmount } from './rules'
import type { GameState, Seat } from './types'

const seats: Seat[] = [
  { name: 'You', isAi: false, token: 'orchid' },
  { name: 'Auntie May', isAi: true, token: 'toast' },
]

function match(): GameState {
  return createGame(seats, () => 0.25)
}

function wrongChoice(answer: number): number {
  return [0, 1, 2].find((choice) => choice !== answer) ?? 0
}

describe('board', () => {
  it('has 40 squares and the classic corners', () => {
    expect(BOARD).toHaveLength(40)
    expect(BOARD[0].kind).toBe('go')
    expect(BOARD[10].kind).toBe('jail')
    expect(BOARD[20].kind).toBe('free')
    expect(BOARD[30].kind).toBe('goToJail')
    expect(gridCell(0)).toMatchObject({ col: 10, row: 10 })
    expect(gridCell(10)).toMatchObject({ col: 0, row: 10 })
    expect(gridCell(20)).toMatchObject({ col: 0, row: 0 })
    expect(gridCell(30)).toMatchObject({ col: 10, row: 0 })
    expect(groupIds('brown')).toHaveLength(2)
    expect(groupIds('darkBlue')).toHaveLength(2)
    expect(groupIds('mrt')).toHaveLength(4)
    const streets = PROPERTY_LIST.filter(isStreet)
    expect(new Set(streets.map((street) => street.dish)).size).toBe(streets.length)
    expect(new Set(streets.map((street) => street.neighborhood)).size).toBe(streets.length)
  })
})

describe('money', () => {
  it('collects salary when a roll passes GO', () => {
    let state = match()
    state.players[0].position = 38
    state.phase = 'preRoll'
    state = applyAction(state, { type: 'roll', dice: [1, 2] })
    expect(state.players[0].position).toBe(1)
    expect(state.players[0].cash).toBe(1700)
    expect(state.phase).toBe('quiz')
  })

  it('buys a deed and charges doubled rent on a full set', () => {
    let state = match()
    state.phase = 'buy'
    state.buyId = 'bedok'
    state = applyAction(state, { type: 'buy' })
    expect(state.holdings.bedok.ownerId).toBe('p1')
    expect(state.players[0].cash).toBe(1440)

    state.holdings.tampines.ownerId = 'p2'
    state.holdings.bedok.ownerId = 'p2'
    state.players[0].cash = 1500
    state.players[0].position = 0
    state.phase = 'preRoll'
    state.mustRollAgain = false
    state = applyAction(state, { type: 'roll', dice: [1, 2] })
    expect(state.phase).toBe('quiz')
    state = applyAction(state, { type: 'answer', choice: state.quiz?.answer ?? 0 })
    state = applyAction(state, { type: 'ack' })
    expect(state.players[0].cash).toBe(1492)
    expect(state.players[1].rentEarned).toBe(8)
    expect(rentAmount(state, 'bedok', 0)).toBe(8)
  })

  it('charges S$50 for a wrong quiz answer and asks again next time', () => {
    let state = match()
    state.players[0].position = 0
    state.phase = 'preRoll'
    state = applyAction(state, { type: 'roll', dice: [1, 2] })
    const streetId = state.quiz?.streetId
    state = applyAction(state, { type: 'answer', choice: wrongChoice(state.quiz?.answer ?? 0) })
    expect(state.quizResult?.fee).toBe(50)
    state = applyAction(state, { type: 'ack' })
    expect(state.players[0].quizFees).toBe(50)
    expect(state.players[0].mastered).not.toContain(streetId)
    expect(state.phase).toBe('buy')

    state.players[0].position = 0
    state.phase = 'preRoll'
    state.revealedStreet = null
    state = applyAction(state, { type: 'roll', dice: [1, 2] })
    expect(state.phase).toBe('quiz')
  })

  it('skips the quiz after a correct answer', () => {
    let state = match()
    state.players[0].position = 0
    state.phase = 'preRoll'
    state = applyAction(state, { type: 'roll', dice: [1, 2] })
    const streetId = state.quiz?.streetId ?? 'bedok'
    state = applyAction(state, { type: 'answer', choice: state.quiz?.answer ?? 0 })
    state = applyAction(state, { type: 'ack' })
    state = applyAction(state, { type: 'decline' })
    while (state.phase === 'auction') {
      state = applyAction(state, { type: 'pass' })
    }
    state.players[0].position = 0
    state.phase = 'preRoll'
    state.mustRollAgain = false
    state = applyAction(state, { type: 'roll', dice: [1, 2] })
    expect(state.players[0].mastered).toContain(streetId)
    expect(state.phase).not.toBe('quiz')
  })

  it('sends the third double to lock-up without passing GO', () => {
    let state = match()
    state.players[0].position = 39
    state.players[0].cash = 1500
    state.doublesCount = 2
    state.phase = 'preRoll'
    state = applyAction(state, { type: 'roll', dice: [6, 6] })
    expect(state.players[0].inJail).toBe(true)
    expect(state.players[0].position).toBe(10)
    expect(state.players[0].cash).toBe(1500)
    expect(state.phase).toBe('notice')
  })

  it('charges 10% interest to unmortgage', () => {
    let state = match()
    state.holdings.bedok.ownerId = 'p1'
    state.phase = 'postRoll'
    state.mustRollAgain = false
    state = applyAction(state, { type: 'mortgage', propertyId: 'bedok' })
    expect(state.players[0].cash).toBe(1530)
    state = applyAction(state, { type: 'unmortgage', propertyId: 'bedok' })
    expect(state.players[0].cash).toBe(1500 + 30 - 33)
    expect(unmortgageCost(150)).toBe(83)
  })

  it('builds evenly across a colour set', () => {
    let state = match()
    state.holdings.amk.ownerId = 'p1'
    state.holdings.bishan.ownerId = 'p1'
    state.holdings.toapayoh.ownerId = 'p1'
    state.phase = 'postRoll'
    state = applyAction(state, { type: 'build', propertyId: 'amk' })
    expect(state.holdings.amk.houses).toBe(1)
    const blocked = applyAction(state, { type: 'build', propertyId: 'amk' })
    expect(blocked.holdings.amk.houses).toBe(1)
    state = applyAction(state, { type: 'build', propertyId: 'bishan' })
    expect(state.holdings.bishan.houses).toBe(1)
  })

  it('lets the player choose the income-tax bill', () => {
    let state = match()
    state.players[0].position = 0
    state.phase = 'preRoll'
    state = applyAction(state, { type: 'roll', dice: [1, 3] })
    expect(state.phase).toBe('tax')
    expect(BOARD[4].kind).toBe('tax')
    state = applyAction(state, { type: 'payTax', mode: 'flat' })
    expect(state.players[0].cash).toBe(1300)
    expect(getProperty('bedok').price).toBe(60)
  })

  it('gives the creditor your deeds when you go bankrupt', () => {
    let state = match()
    state.holdings.bedok.ownerId = 'p2'
    state.players[0].cash = 0
    state.players[0].position = 0
    state.phase = 'preRoll'
    state = applyAction(state, { type: 'roll', dice: [1, 2] })
    state = applyAction(state, { type: 'answer', choice: state.quiz?.answer ?? 0 })
    state = applyAction(state, { type: 'ack' })
    expect(state.phase).toBe('debt')
    state = applyAction(state, { type: 'bankrupt' })
    expect(state.players[0].bankrupt).toBe(true)
    expect(state.phase).toBe('gameOver')
    expect(state.winnerId).toBe('p2')
  })
})

describe('ai', () => {
  it('buys a cheap street when cash is comfortable', () => {
    const state = match()
    state.phase = 'buy'
    state.buyId = 'bedok'
    state.players[0].isAi = true
    expect(decideAiAction(state, () => 0)).toEqual({ type: 'buy' })
  })

  it('declines a purchase that would empty the cash buffer', () => {
    const state = match()
    state.phase = 'buy'
    state.buyId = 'bedok'
    state.players[0].cash = 60
    state.players[0].isAi = true
    expect(decideAiAction(state, () => 0)).toEqual({ type: 'decline' })
  })

  it('bids a modest opening amount at auction', () => {
    const state = match()
    state.phase = 'auction'
    state.auction = { propertyId: 'bedok', bid: 0, leaderId: null, bidderId: 'p1', active: ['p1', 'p2'] }
    state.players[0].isAi = true
    const action = decideAiAction(state, () => 0)
    expect(action.type).toBe('bid')
    if (action.type === 'bid') expect(action.amount).toBeGreaterThan(0)
  })
})
