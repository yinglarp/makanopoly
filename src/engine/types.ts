export const STARTING_CASH = 1500
export const GO_PAY = 200
export const JAIL_FEE = 50
export const QUIZ_FEE = 50
export const HOUSE_LIMIT = 32
export const HOTEL_LIMIT = 12
export const SAVE_VERSION = 1

export type ColorGroup =
  | 'brown'
  | 'lightBlue'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'darkBlue'

export type GroupId = ColorGroup | 'mrt' | 'utility'

export type TokenId = 'orchid' | 'toast' | 'train' | 'satay'

export type Phase =
  | 'handoff'
  | 'preRoll'
  | 'postRoll'
  | 'quiz'
  | 'quizResult'
  | 'buy'
  | 'auction'
  | 'tax'
  | 'card'
  | 'debt'
  | 'jail'
  | 'notice'
  | 'trade'
  | 'gameOver'

export interface Seat {
  name: string
  isAi: boolean
  token: TokenId
}

export interface StreetProperty {
  id: string
  kind: 'street'
  name: string
  short: string
  group: ColorGroup
  price: number
  houseCost: number
  rent: [number, number, number, number, number, number]
  neighborhood: string
  line: string
  dish: string
  hawker: string
  about: string
}

export interface UtilityProperty {
  id: string
  kind: 'mrt' | 'utility'
  name: string
  short: string
  group: 'mrt' | 'utility'
  price: number
  about: string
}

export type Property = StreetProperty | UtilityProperty

export type Square =
  | { index: number; kind: 'go' | 'community' | 'chance' | 'jail' | 'free' | 'goToJail'; label: string }
  | { index: number; kind: 'tax'; label: string; tax: 'income' | 'luxury' }
  | { index: number; kind: 'property'; propertyId: string }

export type CardEffect =
  | { kind: 'cash'; amount: number }
  | { kind: 'payEach'; per: number }
  | { kind: 'collectEach'; per: number }
  | { kind: 'go' }
  | { kind: 'move'; to: number; collectGo: boolean }
  | { kind: 'nearest'; what: 'mrt' | 'utility'; times: number }
  | { kind: 'back'; spaces: number }
  | { kind: 'jail' }
  | { kind: 'jailCard' }
  | { kind: 'repairs'; perHouse: number; perHotel: number }

export interface Card {
  id: string
  deck: 'chance' | 'community'
  text: string
  effect: CardEffect
}

export interface Player {
  id: string
  name: string
  isAi: boolean
  token: TokenId
  color: string
  cash: number
  position: number
  inJail: boolean
  jailTurns: number
  bankrupt: boolean
  jailCards: Card[]
  mastered: string[]
  rentEarned: number
  quizFees: number
}

export interface Holding {
  ownerId: string | null
  houses: number
  mortgaged: boolean
}

export interface Spotlight {
  title: string
  lines: string[]
  group?: GroupId
}

export interface Quiz {
  streetId: string
  topic: 'dish' | 'line'
  prompt: string
  options: string[]
  answer: number
  reveal: string
}

export interface QuizResult {
  streetId: string
  correct: boolean
  chosen: string
  answer: string
  reveal: string
  fee: number
}

export interface Debt {
  playerId: string
  amount: number
  to: string | 'bank' | 'each'
  per: number
  reason: string
  rent: boolean
  quiz: boolean
  recipients: string[]
}

export type Resume =
  | { type: 'postRoll' }
  | { type: 'property'; propertyId: string }
  | { type: 'jailMove'; steps: number }
  | { type: 'jailRelease' }
  | { type: 'collectEach'; toId: string; per: number; fromIds: string[]; reason: string; then: Resume | null }

export interface Auction {
  propertyId: string
  bid: number
  leaderId: string | null
  bidderId: string
  active: string[]
}

export interface Notice {
  message: string
  endTurn: boolean
}

export interface TradeOffer {
  fromId: string
  toId: string
  offerCash: number
  requestCash: number
  offerIds: string[]
  requestIds: string[]
}

export type RentSpecial =
  | { kind: 'mrtDouble' }
  | { kind: 'utilityDice'; times: number }
  | null

export interface GameState {
  version: number
  serial: number
  players: Player[]
  current: number
  phase: Phase
  holdings: Record<string, Holding>
  dice: [number, number] | null
  doublesCount: number
  mustRollAgain: boolean
  chance: Card[]
  community: Card[]
  chanceDiscard: Card[]
  communityDiscard: Card[]
  housesLeft: number
  hotelsLeft: number
  log: string[]
  tip: string
  spotlight: Spotlight | null
  quiz: Quiz | null
  quizResult: QuizResult | null
  quizSerial: number
  debt: Debt | null
  resume: Resume | null
  auction: Auction | null
  card: Card | null
  notice: Notice | null
  rentSpecial: RentSpecial
  tradeOffered: boolean
  pendingTrade: TradeOffer | null
  pausedPhase: 'preRoll' | 'postRoll' | null
  buyId: string | null
  revealedStreet: string | null
  winnerId: string | null
}

export type Action =
  | { type: 'roll'; dice?: [number, number] }
  | { type: 'buy' }
  | { type: 'decline' }
  | { type: 'bid'; amount: number }
  | { type: 'pass' }
  | { type: 'answer'; choice: number }
  | { type: 'ack' }
  | { type: 'payTax'; mode: 'flat' | 'percent' }
  | { type: 'payJail' }
  | { type: 'useJailCard' }
  | { type: 'build'; propertyId: string }
  | { type: 'sell'; propertyId: string }
  | { type: 'mortgage'; propertyId: string }
  | { type: 'unmortgage'; propertyId: string }
  | { type: 'end' }
  | { type: 'ready' }
  | { type: 'settle' }
  | { type: 'bankrupt' }
  | { type: 'proposeTrade'; trade: TradeOffer }
  | { type: 'acceptTrade' }
  | { type: 'declineTrade' }
