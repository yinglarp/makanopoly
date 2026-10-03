import { BOARD, getProperty, indexesInGroup, isStreet, PROPERTY_LIST } from './board'
import { CHANCE_CARDS, COMMUNITY_CARDS } from './cards'
import { bestBuild, bestMortgage, bestSell, bestUnmortgage, playerById, tryBuild, tryMortgage, trySell, tryUnmortgage, monopolyReady } from './develop'
import { money } from './format'
import { foodVisible, makeQuiz, shuffle } from './quiz'
import { aiAccepts, executeTrade, suggestTrade, tradeError } from './trade'
import {
  GO_PAY,
  HOUSE_LIMIT,
  HOTEL_LIMIT,
  JAIL_FEE,
  QUIZ_FEE,
  SAVE_VERSION,
  STARTING_CASH,
  type Action,
  type GameState,
  type Player,
  type Resume,
  type Seat,
  type Spotlight,
} from './types'

const SEAT_COLORS = ['#c23b22', '#0f6e6e', '#b8860b', '#2c4c8c']

export function rollDice(rng: () => number): [number, number] {
  const die = () => 1 + Math.floor(rng() * 6)
  return [die(), die()]
}

export function createGame(seats: Seat[], rng: () => number = Math.random): GameState {
  if (seats.length < 2 || seats.length > 4) throw new Error('Makanopoly seats 2 to 4 players.')
  const holdings = Object.fromEntries(PROPERTY_LIST.map((property) => [property.id, { ownerId: null, houses: 0, mortgaged: false }]))
  const players: Player[] = seats.map((seat, index) => ({
    id: `p${index + 1}`,
    name: seat.name.trim() || `Player ${index + 1}`,
    isAi: seat.isAi,
    token: seat.token,
    color: SEAT_COLORS[index],
    cash: STARTING_CASH,
    position: 0,
    inJail: false,
    jailTurns: 0,
    bankrupt: false,
    jailCards: [],
    mastered: [],
    rentEarned: 0,
    quizFees: 0,
  }))
  const state: GameState = {
    version: SAVE_VERSION,
    serial: 1,
    players,
    current: 0,
    phase: 'preRoll',
    holdings,
    dice: null,
    doublesCount: 0,
    mustRollAgain: false,
    chance: shuffle(CHANCE_CARDS, rng),
    community: shuffle(COMMUNITY_CARDS, rng),
    chanceDiscard: [],
    communityDiscard: [],
    housesLeft: HOUSE_LIMIT,
    hotelsLeft: HOTEL_LIMIT,
    log: ['Match started. Payday is S$200 every time you pass GO.'],
    tip: 'Roll the dice. Buy streets, learn the food, and keep enough cash for rent.',
    spotlight: { title: 'GO', lines: ['Pass GO and collect S$200. That salary is what keeps you moving.'] },
    quiz: null,
    quizResult: null,
    quizSerial: 0,
    debt: null,
    resume: null,
    auction: null,
    card: null,
    notice: null,
    rentSpecial: null,
    tradeOffered: false,
    pendingTrade: null,
    pausedPhase: null,
    buyId: null,
    revealedStreet: null,
    winnerId: null,
  }
  enterPlayer(state)
  return state
}

export function applyAction(state: GameState, action: Action, rng: () => number = Math.random): GameState {
  if (state.phase === 'gameOver' && action.type !== 'ack') return state
  const next = structuredClone(state)
  if (!reduce(next, action, rng)) return state
  next.serial += 1
  return next
}

export function actingPlayerId(state: GameState): string | null {
  if (state.phase === 'gameOver' || state.phase === 'handoff') return null
  if (state.phase === 'debt' && state.debt) return state.debt.playerId
  if (state.phase === 'auction' && state.auction) return state.auction.bidderId
  if (state.phase === 'trade' && state.pendingTrade) return state.pendingTrade.toId
  return state.players[state.current]?.id ?? null
}

export function currentPlayer(state: GameState): Player {
  return state.players[state.current]
}

function reduce(state: GameState, action: Action, rng: () => number): boolean {
  switch (action.type) {
    case 'ready':
      return ready(state)
    case 'roll':
      return roll(state, action.dice, rng)
    case 'answer':
      return answerQuiz(state, action.choice)
    case 'ack':
      return acknowledge(state, rng)
    case 'buy':
      return buy(state)
    case 'decline':
      return declineBuy(state)
    case 'bid':
      return bid(state, action.amount)
    case 'pass':
      return passBid(state)
    case 'payTax':
      return payTax(state, action.mode)
    case 'payJail':
      return payJail(state)
    case 'useJailCard':
      return useJailCard(state)
    case 'build':
      return develop(state, 'build', action.propertyId)
    case 'sell':
      return develop(state, 'sell', action.propertyId)
    case 'mortgage':
      return develop(state, 'mortgage', action.propertyId)
    case 'unmortgage':
      return develop(state, 'unmortgage', action.propertyId)
    case 'end':
      return endTurn(state)
    case 'settle':
      return settle(state)
    case 'bankrupt':
      return goBankrupt(state)
    case 'proposeTrade':
      return proposeTrade(state, action.trade)
    case 'acceptTrade':
      return resolveTrade(state, true)
    case 'declineTrade':
      return resolveTrade(state, false)
    default:
      return false
  }
}

function alive(state: GameState): Player[] {
  return state.players.filter((player) => !player.bankrupt)
}

function pushLog(state: GameState, message: string) {
  state.log = [...state.log, message].slice(-70)
}

function ready(state: GameState): boolean {
  if (state.phase !== 'handoff') return false
  const player = currentPlayer(state)
  state.phase = player.inJail ? 'jail' : 'preRoll'
  state.tip = player.inJail
    ? 'You are in lock-up. Pay S$50, use a card, or try to roll doubles.'
    : 'Roll the dice. You can build or mortgage before you move.'
  return true
}

function enterPlayer(state: GameState) {
  const player = currentPlayer(state)
  state.mustRollAgain = false
  state.doublesCount = 0
  state.tradeOffered = false
  state.rentSpecial = null
  state.revealedStreet = null
  state.buyId = null
  const humans = alive(state).filter((candidate) => !candidate.isAi)
  if (!player.isAi && humans.length >= 2) {
    state.phase = 'handoff'
    state.tip = `Pass the device to ${player.name}.`
    return
  }
  state.phase = player.inJail ? 'jail' : 'preRoll'
  state.tip = player.inJail
    ? `${player.name} is in lock-up.`
    : `${player.name}, roll the dice.`
}

function advanceTurn(state: GameState) {
  if (maybeEnd(state)) return
  const count = state.players.length
  for (let step = 1; step <= count; step += 1) {
    const index = (state.current + step) % count
    if (!state.players[index].bankrupt) {
      state.current = index
      enterPlayer(state)
      return
    }
  }
}

function maybeEnd(state: GameState): boolean {
  const left = alive(state)
  if (left.length > 1) return false
  state.phase = 'gameOver'
  state.winnerId = left[0]?.id ?? null
  state.tip = left[0] ? `${left[0].name} is the last player with cash and deeds.` : 'Everyone is bankrupt.'
  if (left[0]) pushLog(state, `${left[0].name} wins.`)
  return true
}

function roll(state: GameState, forced: [number, number] | undefined, rng: () => number): boolean {
  if (state.phase === 'jail') return rollForJail(state, forced, rng)
  const canRoll = state.phase === 'preRoll' || (state.phase === 'postRoll' && state.mustRollAgain)
  if (!canRoll) return false
  state.revealedStreet = null
  const dice = forced ?? rollDice(rng)
  state.dice = dice
  const player = currentPlayer(state)
  const doubles = dice[0] === dice[1]
  state.doublesCount = doubles ? state.doublesCount + 1 : 0
  pushLog(state, `${player.name} rolls ${dice[0]} and ${dice[1]}.`)
  if (doubles && state.doublesCount >= 3) {
    sendToJail(state, player.id, `${player.name} rolled a third double and goes to lock-up.`)
    return true
  }
  state.mustRollAgain = doubles
  moveForward(state, player.id, dice[0] + dice[1])
  return true
}

function rollForJail(state: GameState, forced: [number, number] | undefined, rng: () => number): boolean {
  const player = currentPlayer(state)
  if (!player.inJail) return false
  const dice = forced ?? rollDice(rng)
  state.dice = dice
  const doubles = dice[0] === dice[1]
  pushLog(state, `${player.name} rolls ${dice[0]} and ${dice[1]} in lock-up.`)
  if (doubles || player.jailTurns >= 2) {
    if (!doubles) {
      state.resume = { type: 'jailMove', steps: dice[0] + dice[1] }
      charge(state, {
        fromId: player.id,
        amount: JAIL_FEE,
        to: 'bank',
        reason: 'third lock-up turn',
        rent: false,
        quiz: false,
        resume: state.resume,
      })
      return true
    }
    releaseAndMove(state, dice[0] + dice[1])
    return true
  }
  player.jailTurns += 1
  const left = 3 - player.jailTurns
  state.phase = 'notice'
  state.notice = {
    message: `No doubles. ${left === 1 ? 'One try left, then you must pay S$50.' : `${left} tries left.`}`,
    endTurn: true,
  }
  state.tip = 'Lock-up skips the board. Doubles, S$50, or a card will get you out.'
  return true
}

function releaseAndMove(state: GameState, steps: number) {
  const player = currentPlayer(state)
  player.inJail = false
  player.jailTurns = 0
  state.mustRollAgain = false
  state.doublesCount = 0
  pushLog(state, `${player.name} leaves lock-up and moves ${steps}.`)
  moveForward(state, player.id, steps)
}

function payJail(state: GameState): boolean {
  if (state.phase !== 'jail') return false
  const player = currentPlayer(state)
  state.resume = { type: 'jailRelease' }
  charge(state, {
    fromId: player.id,
    amount: JAIL_FEE,
    to: 'bank',
    reason: 'leaving lock-up',
    rent: false,
    quiz: false,
    resume: state.resume,
  })
  return true
}

function useJailCard(state: GameState): boolean {
  if (state.phase !== 'jail') return false
  const player = currentPlayer(state)
  const card = player.jailCards.pop()
  if (!card) return false
  const discard = card.deck === 'chance' ? state.chanceDiscard : state.communityDiscard
  discard.push(card)
  player.inJail = false
  player.jailTurns = 0
  state.phase = 'preRoll'
  state.tip = 'The card got you out. Roll and move. Doubles still earn another roll.'
  pushLog(state, `${player.name} uses a Get Out of Lock-up card.`)
  return true
}

function moveForward(state: GameState, playerId: string, steps: number) {
  const player = playerById(state, playerId)
  for (let step = 0; step < steps; step += 1) {
    player.position = (player.position + 1) % 40
    if (player.position === 0) {
      player.cash += GO_PAY
      pushLog(state, `${player.name} passes GO and collects ${money(GO_PAY)}.`)
      state.tip = 'Passing GO is payday. The S$200 is your salary for another loop of the board.'
    }
  }
  resolveLanding(state, playerId)
}

function sendToJail(state: GameState, playerId: string, message: string) {
  const player = playerById(state, playerId)
  player.position = 10
  player.inJail = true
  player.jailTurns = 0
  state.mustRollAgain = false
  state.doublesCount = 0
  state.rentSpecial = null
  state.phase = 'notice'
  state.notice = { message, endTurn: true }
  state.spotlight = { title: 'Lock-up', lines: [message, 'You miss movement until you pay S$50, roll doubles, or use a card. After three failed turns you must pay.'] }
  state.tip = 'Lock-up is the bad-luck square. You can buy your way out for S$50.'
  pushLog(state, message)
}

function resolveLanding(state: GameState, playerId: string) {
  const player = playerById(state, playerId)
  const square = BOARD[player.position]
  if (square.kind === 'go') {
    state.spotlight = { title: 'GO', lines: ['You landed on GO and already collected your salary.'] }
    pushLog(state, `${player.name} lands on GO.`)
    enterPostRoll(state)
    return
  }
  if (square.kind === 'free') {
    state.spotlight = { title: 'Void Deck', lines: ['Nothing happens. Fines do not pile up here.'] }
    pushLog(state, `${player.name} rests at the void deck.`)
    enterPostRoll(state)
    return
  }
  if (square.kind === 'jail') {
    state.spotlight = { title: 'Just visiting', lines: ['You are only visiting lock-up. Your turn continues.'] }
    pushLog(state, `${player.name} landed on Just Visiting.`)
    enterPostRoll(state)
    return
  }
  if (square.kind === 'goToJail') {
    sendToJail(state, playerId, `${player.name} lands on Go to Lock-up.`)
    return
  }
  if (square.kind === 'tax') {
    state.spotlight = {
      title: square.label,
      lines: square.tax === 'income'
        ? ['Choose 10% of your cash, or a flat S$200. Pick the smaller bill.']
        : ['Luxury tax is a flat S$100.'],
    }
    if (square.tax === 'luxury') {
      charge(state, { fromId: playerId, amount: 100, to: 'bank', reason: 'luxury tax', rent: false, quiz: false, resume: { type: 'postRoll' } })
    } else {
      state.phase = 'tax'
      state.resume = { type: 'postRoll' }
      state.tip = 'Income tax is a real choice: 10% of what you hold, or S$200.'
    }
    pushLog(state, `${player.name} lands on ${square.label}.`)
    return
  }
  if (square.kind === 'chance' || square.kind === 'community') {
    drawCard(state, square.kind, Math.random)
    return
  }
  if (square.kind !== 'property') return
  const property = getProperty(square.propertyId)
  if (isStreet(property) && !player.mastered.includes(property.id)) {
    state.spotlight = { title: property.name, lines: ['Answer the station question. The dish and rail line stay hidden until you do.'], group: property.group }
    state.quizSerial += 1
    state.quiz = makeQuiz(property.id, state.quizSerial % 2 === 0 ? 'dish' : 'line', Math.random)
    state.phase = 'quiz'
    state.tip = `A wrong answer costs ${money(QUIZ_FEE)}. Getting it right masters the street.`
    return
  }
  state.spotlight = { title: property.name, lines: [property.about], group: property.group }
  if (isStreet(property)) state.revealedStreet = property.id
  resolveProperty(state, property.id)
}

function answerQuiz(state: GameState, choice: number): boolean {
  if (state.phase !== 'quiz' || !state.quiz) return false
  if (choice < 0 || choice >= state.quiz.options.length) return false
  const quiz = state.quiz
  const player = currentPlayer(state)
  const correct = choice === quiz.answer
  if (correct && !player.mastered.includes(quiz.streetId)) player.mastered.push(quiz.streetId)
  state.revealedStreet = quiz.streetId
  state.quizResult = {
    streetId: quiz.streetId,
    correct,
    chosen: quiz.options[choice],
    answer: quiz.options[quiz.answer],
    reveal: quiz.reveal,
    fee: correct ? 0 : QUIZ_FEE,
  }
  state.quiz = null
  state.phase = 'quizResult'
  state.tip = correct
    ? 'Correct. This street is mastered, so it will not quiz you again.'
    : `Not quite. The answer is shown, and you pay ${money(QUIZ_FEE)}.`
  return true
}

function acknowledge(state: GameState, rng: () => number): boolean {
  if (state.phase === 'card') {
    applyCard(state, rng)
    return true
  }
  if (state.phase === 'quizResult' && state.quizResult) {
    const result = state.quizResult
    state.quizResult = null
    if (result.fee > 0) {
      charge(state, {
        fromId: currentPlayer(state).id,
        amount: result.fee,
        to: 'bank',
        reason: 'a wrong street answer',
        rent: false,
        quiz: true,
        resume: { type: 'property', propertyId: result.streetId },
      })
    } else {
      resolveProperty(state, result.streetId)
    }
    return true
  }
  if (state.phase === 'notice' && state.notice) {
    const end = state.notice.endTurn
    state.notice = null
    if (end) advanceTurn(state)
    else enterPostRoll(state)
    return true
  }
  return false
}

function resolveProperty(state: GameState, propertyId: string) {
  const property = getProperty(propertyId)
  const holding = state.holdings[propertyId]
  const player = currentPlayer(state)
  const special = state.rentSpecial
  state.rentSpecial = null
  if (!holding.ownerId) {
    state.buyId = propertyId
    state.phase = 'buy'
    state.tip = 'Buying turns cash into an asset that can earn rent. If you decline, the deed goes to auction.'
    pushLog(state, `${player.name} can buy ${property.name} for ${money(property.price)}.`)
    return
  }
  if (holding.ownerId === player.id) {
    pushLog(state, `${player.name} lands on their own ${property.name}.`)
    state.tip = isStreet(property) && foodVisible(state, propertyId) ? property.about : 'You already own this deed.'
    enterPostRoll(state)
    return
  }
  if (holding.mortgaged) {
    pushLog(state, `${property.name} is mortgaged, so no rent is due.`)
    state.tip = 'A mortgaged deed collects nothing. The owner borrowed half its price and paused the income.'
    enterPostRoll(state)
    return
  }
  const diceSum = state.dice ? state.dice[0] + state.dice[1] : 0
  let rent = rentAmount(state, propertyId, diceSum)
  if (special?.kind === 'mrtDouble') rent *= 2
  if (special?.kind === 'utilityDice') rent = special.times * diceSum
  const owner = playerById(state, holding.ownerId)
  pushLog(state, `${player.name} owes ${money(rent)} rent to ${owner.name}.`)
  state.tip = 'Rent is the return on a deed. A full colour set, houses, and hotels push that bill up fast.'
  charge(state, {
    fromId: player.id,
    amount: rent,
    to: owner.id,
    reason: `rent on ${property.name}`,
    rent: true,
    quiz: false,
    resume: { type: 'postRoll' },
  })
}

export function rentAmount(state: GameState, propertyId: string, diceSum: number): number {
  const property = getProperty(propertyId)
  const holding = state.holdings[propertyId]
  if (!holding.ownerId || holding.mortgaged) return 0
  if (property.kind === 'mrt') {
    const owned = PROPERTY_LIST.filter((item) => item.group === 'mrt' && state.holdings[item.id].ownerId === holding.ownerId).length
    return [0, 25, 50, 100, 200][owned] ?? 0
  }
  if (property.kind === 'utility') {
    const owned = PROPERTY_LIST.filter((item) => item.group === 'utility' && state.holdings[item.id].ownerId === holding.ownerId).length
    return (owned >= 2 ? 10 : 4) * diceSum
  }
  if (!isStreet(property)) return 0
  const rent = property.rent[holding.houses] ?? 0
  if (holding.houses === 0 && monopolyReady(state, holding.ownerId, property.group)) return rent * 2
  return rent
}

function buy(state: GameState): boolean {
  if (state.phase !== 'buy' || !state.buyId) return false
  const property = getProperty(state.buyId)
  const player = currentPlayer(state)
  if (player.cash < property.price) return false
  player.cash -= property.price
  state.holdings[state.buyId].ownerId = player.id
  pushLog(state, `${player.name} buys ${property.name} for ${money(property.price)}.`)
  state.tip = 'Cash is now a deed. If other players land here, they pay you rent.'
  if (isStreet(property) && monopolyReady(state, player.id, property.group)) {
    state.tip = 'You own the whole colour set. Base rent is doubled until you start building.'
  }
  state.buyId = null
  enterPostRoll(state)
  return true
}

function declineBuy(state: GameState): boolean {
  if (state.phase !== 'buy' || !state.buyId) return false
  const propertyId = state.buyId
  state.buyId = null
  const order: string[] = []
  for (let step = 1; step <= state.players.length; step += 1) {
    const player = state.players[(state.current + step) % state.players.length]
    if (!player.bankrupt) order.push(player.id)
  }
  state.auction = { propertyId, bid: 0, leaderId: null, bidderId: order[0], active: order }
  state.phase = 'auction'
  state.tip = 'Auction: bid only what the deed is worth to you. The last bid pays that price.'
  pushLog(state, `${getProperty(propertyId).name} goes to auction.`)
  return true
}

function bid(state: GameState, amount: number): boolean {
  const auction = state.auction
  if (state.phase !== 'auction' || !auction) return false
  const bidder = playerById(state, auction.bidderId)
  if (!Number.isInteger(amount) || amount <= auction.bid || bidder.cash < amount) return false
  auction.bid = amount
  auction.leaderId = bidder.id
  pushLog(state, `${bidder.name} bids ${money(amount)}.`)
  if (auction.active.length === 1) {
    awardAuction(state)
    return true
  }
  const index = auction.active.indexOf(bidder.id)
  auction.bidderId = auction.active[(index + 1) % auction.active.length]
  return true
}

function passBid(state: GameState): boolean {
  const auction = state.auction
  if (state.phase !== 'auction' || !auction) return false
  const bidderId = auction.bidderId
  const index = auction.active.indexOf(bidderId)
  auction.active = auction.active.filter((id) => id !== bidderId)
  pushLog(state, `${playerById(state, bidderId).name} passes.`)
  if (auction.active.length === 0 || (auction.active.length === 1 && auction.leaderId === null)) {
    pushLog(state, `${getProperty(auction.propertyId).name} stays with the bank.`)
    state.auction = null
    enterPostRoll(state)
    return true
  }
  if (auction.active.length === 1 && auction.leaderId === auction.active[0]) {
    awardAuction(state)
    return true
  }
  auction.bidderId = auction.active[Math.min(index, auction.active.length - 1)] ?? auction.active[0]
  return true
}

function awardAuction(state: GameState) {
  const auction = state.auction
  if (!auction || !auction.leaderId) return
  const winner = playerById(state, auction.leaderId)
  winner.cash -= auction.bid
  state.holdings[auction.propertyId].ownerId = winner.id
  pushLog(state, `${winner.name} wins ${getProperty(auction.propertyId).name} for ${money(auction.bid)}.`)
  state.tip = 'An auction sets the price by what players will actually pay, not the printed number.'
  state.auction = null
  enterPostRoll(state)
}

function payTax(state: GameState, mode: 'flat' | 'percent'): boolean {
  if (state.phase !== 'tax') return false
  const player = currentPlayer(state)
  const amount = mode === 'flat' ? 200 : Math.floor(player.cash * 0.1)
  state.phase = 'postRoll'
  charge(state, {
    fromId: player.id,
    amount,
    to: 'bank',
    reason: mode === 'flat' ? 'income tax of S$200' : 'income tax of 10%',
    rent: false,
    quiz: false,
    resume: state.resume ?? { type: 'postRoll' },
  })
  return true
}

function drawCard(state: GameState, deck: 'chance' | 'community', rng: () => number) {
  const pile = deck === 'chance' ? state.chance : state.community
  const discard = deck === 'chance' ? state.chanceDiscard : state.communityDiscard
  if (pile.length === 0) {
    pile.push(...shuffle(discard, rng))
    discard.length = 0
  }
  const card = pile.pop()
  if (!card) {
    enterPostRoll(state)
    return
  }
  state.card = card
  state.phase = 'card'
  state.spotlight = { title: deck === 'chance' ? 'Chance' : 'Community Chest', lines: [card.text] }
  pushLog(state, `${currentPlayer(state).name} draws: ${card.text}`)
}

function applyCard(state: GameState, rng: () => number) {
  const card = state.card
  if (!card) return
  state.card = null
  if (card.effect.kind !== 'jailCard') {
    const discard = card.deck === 'chance' ? state.chanceDiscard : state.communityDiscard
    discard.push(card)
  }
  const player = currentPlayer(state)
  const effect = card.effect
  switch (effect.kind) {
    case 'jailCard':
      player.jailCards.push(card)
      pushLog(state, `${player.name} keeps a Get Out of Lock-up card.`)
      enterPostRoll(state)
      break
    case 'cash':
      if (effect.amount >= 0) {
        player.cash += effect.amount
        pushLog(state, `${player.name} collects ${money(effect.amount)}.`)
        enterPostRoll(state)
      } else {
        charge(state, { fromId: player.id, amount: -effect.amount, to: 'bank', reason: 'a card', rent: false, quiz: false, resume: { type: 'postRoll' } })
      }
      break
    case 'go':
      if (player.position !== 0) {
        player.cash += GO_PAY
        pushLog(state, `${player.name} advances to GO and collects ${money(GO_PAY)}.`)
      }
      player.position = 0
      state.spotlight = { title: 'GO', lines: ['Salary collected.'] }
      enterPostRoll(state)
      break
    case 'move':
      advanceTo(state, player.id, effect.to, effect.collectGo)
      break
    case 'nearest': {
      const target = nearestIndex(player.position, indexesInGroup(effect.what))
      if (effect.what === 'mrt') state.rentSpecial = { kind: 'mrtDouble' }
      else {
        state.dice = rollDice(rng)
        state.rentSpecial = { kind: 'utilityDice', times: effect.times }
      }
      advanceTo(state, player.id, target, true)
      break
    }
    case 'back': {
      player.position = (player.position - effect.spaces + 40) % 40
      resolveLanding(state, player.id)
      break
    }
    case 'jail':
      sendToJail(state, player.id, `${player.name} is sent to lock-up.`)
      break
    case 'payEach':
      payEach(state, player.id, effect.per, 'the residents’ committee', { type: 'postRoll' })
      break
    case 'collectEach':
      collectEach(state, player.id, effect.per, alive(state).filter((other) => other.id !== player.id).map((other) => other.id), 'your hawker-centre birthday', { type: 'postRoll' })
      break
    case 'repairs': {
      let amount = 0
      for (const property of PROPERTY_LIST) {
        if (!isStreet(property)) continue
        const holding = state.holdings[property.id]
        if (holding.ownerId !== player.id) continue
        amount += holding.houses === 5 ? effect.perHotel : holding.houses * effect.perHouse
      }
      charge(state, { fromId: player.id, amount, to: 'bank', reason: 'repairs', rent: false, quiz: false, resume: { type: 'postRoll' } })
      break
    }
    default:
      enterPostRoll(state)
  }
}

function nearestIndex(from: number, indexes: number[]): number {
  for (let step = 1; step <= 40; step += 1) {
    const index = (from + step) % 40
    if (indexes.includes(index)) return index
  }
  return indexes[0] ?? from
}

function advanceTo(state: GameState, playerId: string, target: number, collectGo: boolean) {
  const player = playerById(state, playerId)
  if (target === 0) {
    if (player.position !== 0 && collectGo) {
      player.cash += GO_PAY
      pushLog(state, `${player.name} passes GO and collects ${money(GO_PAY)}.`)
    }
    player.position = 0
    state.spotlight = { title: 'GO', lines: ['Salary collected.'] }
    enterPostRoll(state)
    return
  }
  if (collectGo && target < player.position) {
    player.cash += GO_PAY
    pushLog(state, `${player.name} passes GO and collects ${money(GO_PAY)}.`)
  }
  player.position = target
  resolveLanding(state, playerId)
}

function payEach(state: GameState, fromId: string, per: number, reason: string, resume: Resume) {
  const recipients = alive(state).filter((player) => player.id !== fromId).map((player) => player.id)
  const total = per * recipients.length
  const player = playerById(state, fromId)
  if (player.cash >= total) {
    player.cash -= total
    for (const id of recipients) playerById(state, id).cash += per
    pushLog(state, `${player.name} pays ${money(per)} to each player.`)
    state.resume = resume
    finishResume(state)
    return
  }
  state.debt = { playerId: fromId, amount: total, to: 'each', per, reason, rent: false, quiz: false, recipients }
  state.resume = resume
  state.phase = 'debt'
  state.tip = `${player.name} owes ${money(total)}. Raise cash, then pay. If you cannot, you go bankrupt.`
}

function collectEach(state: GameState, toId: string, per: number, fromIds: string[], reason: string, then: Resume | null) {
  const [next, ...rest] = fromIds
  if (!next) {
    state.resume = then
    finishResume(state)
    return
  }
  const from = playerById(state, next)
  if (from.bankrupt) {
    collectEach(state, toId, per, rest, reason, then)
    return
  }
  if (from.cash >= per) {
    from.cash -= per
    playerById(state, toId).cash += per
    pushLog(state, `${from.name} pays ${money(per)} for ${reason}.`)
    collectEach(state, toId, per, rest, reason, then)
    return
  }
  state.debt = { playerId: from.id, amount: per, to: toId, per, reason, rent: false, quiz: false, recipients: [] }
  state.resume = { type: 'collectEach', toId, per, fromIds: rest, reason, then }
  state.phase = 'debt'
  state.tip = `${from.name} owes ${money(per)}. Mortgage or sell buildings, then pay.`
}

function charge(state: GameState, bill: { fromId: string; amount: number; to: string | 'bank'; reason: string; rent: boolean; quiz: boolean; resume: Resume }) {
  if (bill.amount <= 0) {
    state.resume = bill.resume
    finishResume(state)
    return
  }
  const from = playerById(state, bill.fromId)
  if (from.cash >= bill.amount) {
    from.cash -= bill.amount
    if (bill.quiz) from.quizFees += bill.amount
    if (bill.to !== 'bank' && bill.to !== 'each') {
      const creditor = playerById(state, bill.to)
      creditor.cash += bill.amount
      if (bill.rent) creditor.rentEarned += bill.amount
    }
    pushLog(state, `${from.name} pays ${money(bill.amount)} for ${bill.reason}.`)
    state.resume = bill.resume
    finishResume(state)
    return
  }
  state.debt = {
    playerId: bill.fromId,
    amount: bill.amount,
    to: bill.to,
    per: 0,
    reason: bill.reason,
    rent: bill.rent,
    quiz: bill.quiz,
    recipients: [],
  }
  state.resume = bill.resume
  state.phase = 'debt'
  state.tip = `${from.name} owes ${money(bill.amount)} for ${bill.reason}. Sell buildings or mortgage, then pay. If you still cannot, you go bankrupt.`
}

function settle(state: GameState): boolean {
  const debt = state.debt
  if (state.phase !== 'debt' || !debt) return false
  const from = playerById(state, debt.playerId)
  if (from.cash < debt.amount) return false
  from.cash -= debt.amount
  if (debt.quiz) from.quizFees += debt.amount
  if (debt.to === 'each') {
    for (const id of debt.recipients) {
      const recipient = playerById(state, id)
      if (!recipient.bankrupt) recipient.cash += debt.per
    }
  } else if (debt.to !== 'bank') {
    const creditor = playerById(state, debt.to)
    creditor.cash += debt.amount
    if (debt.rent) creditor.rentEarned += debt.amount
  }
  pushLog(state, `${from.name} pays ${money(debt.amount)} for ${debt.reason}.`)
  state.debt = null
  finishResume(state)
  return true
}

function finishResume(state: GameState) {
  const resume = state.resume
  state.resume = null
  if (!resume) {
    enterPostRoll(state)
    return
  }
  switch (resume.type) {
    case 'postRoll':
      enterPostRoll(state)
      break
    case 'property':
      resolveProperty(state, resume.propertyId)
      break
    case 'jailMove':
      releaseAndMove(state, resume.steps)
      break
    case 'jailRelease': {
      const player = currentPlayer(state)
      player.inJail = false
      player.jailTurns = 0
      state.phase = 'preRoll'
      state.tip = 'You paid your way out. Roll and move.'
      pushLog(state, `${player.name} leaves lock-up and must roll.`)
      break
    }
    case 'collectEach':
      collectEach(state, resume.toId, resume.per, resume.fromIds, resume.reason, resume.then)
      break
    default:
      enterPostRoll(state)
  }
}

function enterPostRoll(state: GameState) {
  if (maybeEnd(state)) return
  state.phase = 'postRoll'
  state.quiz = null
  state.card = null
  state.notice = null
  state.auction = null
  state.debt = null
  state.buyId = null
  state.tip = state.mustRollAgain
    ? 'Doubles — roll again. You may build before you do.'
    : 'Build, mortgage, or trade, then end your turn.'
}

function develop(state: GameState, kind: 'build' | 'sell' | 'mortgage' | 'unmortgage', propertyId: string): boolean {
  const debtTurn = state.phase === 'debt' && state.debt
  const actorId = debtTurn && state.debt ? state.debt.playerId : currentPlayer(state).id
  const phaseOk = state.phase === 'preRoll' || state.phase === 'postRoll' || (debtTurn && (kind === 'sell' || kind === 'mortgage'))
  if (!phaseOk) return false
  if ((kind === 'build' || kind === 'unmortgage') && state.phase === 'debt') return false
  const error = kind === 'build'
    ? tryBuild(state, actorId, propertyId)
    : kind === 'sell'
      ? trySell(state, actorId, propertyId)
      : kind === 'mortgage'
        ? tryMortgage(state, actorId, propertyId)
        : tryUnmortgage(state, actorId, propertyId)
  if (error) return false
  const property = getProperty(propertyId)
  const actor = playerById(state, actorId)
  if (kind === 'build') {
    const houses = state.holdings[propertyId].houses
    pushLog(state, `${actor.name} builds on ${property.name} (${houses === 5 ? 'hotel' : `${houses} house${houses === 1 ? '' : 's'}`}).`)
    state.tip = 'Improvements raise rent sharply, and the cash is tied up until you sell them back at half price.'
  } else if (kind === 'sell') {
    pushLog(state, `${actor.name} sells a building on ${property.name} for half price.`)
  } else if (kind === 'mortgage') {
    pushLog(state, `${actor.name} mortgages ${property.name}.`)
    state.tip = 'The bank lends half the printed price. Paying the mortgage off costs that amount plus 10% interest.'
  } else {
    pushLog(state, `${actor.name} pays off the mortgage on ${property.name}, including 10% interest.`)
  }
  return true
}

function endTurn(state: GameState): boolean {
  if (state.phase !== 'postRoll' || state.mustRollAgain) return false
  advanceTurn(state)
  return true
}

function goBankrupt(state: GameState): boolean {
  const debt = state.debt
  if (state.phase !== 'debt' || !debt) return false
  const debtor = playerById(state, debt.playerId)
  if (debtor.cash >= debt.amount) return false
  if (bestSell(state, debt.playerId) || bestMortgage(state, debt.playerId)) return false
  const resume = state.resume
  const bankruptId = debt.playerId
  const wasCurrent = currentPlayer(state).id === bankruptId
  transferEstate(state, bankruptId, debt.to === 'each' ? 'bank' : debt.to)
  state.debt = null
  pushLog(state, `${playerById(state, bankruptId).name} goes bankrupt.`)
  state.tip = 'If you cannot pay, your deeds go to the creditor. Buildings are sold back to the bank at half price first.'
  if (maybeEnd(state)) return true
  if (wasCurrent) {
    advanceTurn(state)
    return true
  }
  state.resume = resume
  finishResume(state)
  return true
}

function transferEstate(state: GameState, playerId: string, to: string | 'bank') {
  const debtor = playerById(state, playerId)
  for (const property of PROPERTY_LIST) {
    const holding = state.holdings[property.id]
    if (holding.ownerId !== playerId || !isStreet(property) || holding.houses <= 0) continue
    debtor.cash += (property.houseCost / 2) * holding.houses
    if (holding.houses === 5) state.hotelsLeft += 1
    else state.housesLeft += holding.houses
    holding.houses = 0
  }
  if (to === 'bank') {
    debtor.cash = 0
    for (const property of PROPERTY_LIST) {
      const holding = state.holdings[property.id]
      if (holding.ownerId !== playerId) continue
      holding.ownerId = null
      holding.mortgaged = false
    }
    for (const card of debtor.jailCards) {
      const discard = card.deck === 'chance' ? state.chanceDiscard : state.communityDiscard
      discard.push(card)
    }
  } else {
    const creditor = playerById(state, to)
    creditor.cash += debtor.cash
    debtor.cash = 0
    for (const property of PROPERTY_LIST) {
      if (state.holdings[property.id].ownerId === playerId) state.holdings[property.id].ownerId = to
    }
    creditor.jailCards.push(...debtor.jailCards)
  }
  debtor.jailCards = []
  debtor.bankrupt = true
  debtor.inJail = false
}

function proposeTrade(state: GameState, trade: GameState['pendingTrade']): boolean {
  if (!trade) return false
  if (state.phase !== 'preRoll' && state.phase !== 'postRoll') return false
  if (trade.fromId !== currentPlayer(state).id) return false
  if (tradeError(state, trade)) return false
  state.tradeOffered = true
  const target = playerById(state, trade.toId)
  if (target.isAi) {
    if (aiAccepts(state, trade)) {
      executeTrade(state, trade)
      pushLog(state, `${target.name} accepts the trade.`)
      state.tip = 'A trade swaps cash and deeds. Count whether it finishes a colour set before you agree.'
    } else {
      pushLog(state, `${target.name} declines the trade.`)
    }
    return true
  }
  state.pendingTrade = trade
  state.pausedPhase = state.phase
  state.phase = 'trade'
  state.tip = `${target.name}, look at the offer. You can refuse.`
  return true
}

function resolveTrade(state: GameState, accept: boolean): boolean {
  const trade = state.pendingTrade
  if (state.phase !== 'trade' || !trade) return false
  if (accept) {
    if (tradeError(state, trade)) return false
    executeTrade(state, trade)
    pushLog(state, `${playerById(state, trade.toId).name} accepts the trade.`)
  } else {
    pushLog(state, `${playerById(state, trade.toId).name} declines the trade.`)
  }
  state.phase = state.pausedPhase ?? 'preRoll'
  state.pausedPhase = null
  state.pendingTrade = null
  return true
}

export function spotlightFood(state: GameState): Spotlight | null {
  if (!state.revealedStreet) return state.spotlight
  const property = getProperty(state.revealedStreet)
  if (!isStreet(property)) return state.spotlight
  return {
    title: property.name,
    group: property.group,
    lines: [`${property.neighborhood} · ${property.dish}`, property.hawker, property.about],
  }
}

export { bestBuild, bestMortgage, bestSell, bestUnmortgage, suggestTrade }
