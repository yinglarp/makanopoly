import type { Card } from './types'

export const CHANCE_CARDS: Card[] = [
  { id: 'c-go', deck: 'chance', text: 'Advance to GO. Collect S$200 salary.', effect: { kind: 'go' } },
  { id: 'c-marina', deck: 'chance', text: 'Advance to Gardens by the Bay. If you pass GO, collect S$200.', effect: { kind: 'move', to: 39, collectGo: true } },
  { id: 'c-maxwell', deck: 'chance', text: 'Chicken rice run. Advance to Maxwell. If you pass GO, collect S$200.', effect: { kind: 'move', to: 31, collectGo: true } },
  { id: 'c-mrt-1', deck: 'chance', text: 'Advance to the nearest MRT line. If it is owned, pay double the fare.', effect: { kind: 'nearest', what: 'mrt', times: 2 } },
  { id: 'c-mrt-2', deck: 'chance', text: 'Take the nearest MRT. If someone owns the line, the fare is doubled.', effect: { kind: 'nearest', what: 'mrt', times: 2 } },
  { id: 'c-util', deck: 'chance', text: 'Advance to the nearest utility. If it is owned, roll and pay 10 times the dice.', effect: { kind: 'nearest', what: 'utility', times: 10 } },
  { id: 'c-dividend', deck: 'chance', text: 'The bank pays you a dividend of S$50.', effect: { kind: 'cash', amount: 50 } },
  { id: 'c-jailcard', deck: 'chance', text: 'Get Out of Lock-up Free. Keep this card until you need it.', effect: { kind: 'jailCard' } },
  { id: 'c-back', deck: 'chance', text: 'Go back 3 spaces.', effect: { kind: 'back', spaces: 3 } },
  { id: 'c-jail', deck: 'chance', text: 'Go to Lock-up. Do not pass GO. Do not collect S$200.', effect: { kind: 'jail' } },
  { id: 'c-repairs', deck: 'chance', text: 'General repairs. Pay S$25 for each house and S$100 for each hotel.', effect: { kind: 'repairs', perHouse: 25, perHotel: 100 } },
  { id: 'c-erp', deck: 'chance', text: 'ERP gantry. Pay S$15.', effect: { kind: 'cash', amount: -15 } },
  { id: 'c-east', deck: 'chance', text: 'Advance to Marine Parade for satay. If you pass GO, collect S$200.', effect: { kind: 'move', to: 13, collectGo: true } },
  { id: 'c-chair', deck: 'chance', text: 'You are elected chair of the residents’ committee. Pay each player S$50.', effect: { kind: 'payEach', per: 50 } },
  { id: 'c-loan', deck: 'chance', text: 'Your building loan matures. Collect S$150.', effect: { kind: 'cash', amount: 150 } },
  { id: 'c-fine', deck: 'chance', text: 'Speeding fine. Pay S$15.', effect: { kind: 'cash', amount: -15 } },
]

export const COMMUNITY_CARDS: Card[] = [
  { id: 'm-go', deck: 'community', text: 'Advance to GO. Collect S$200 salary.', effect: { kind: 'go' } },
  { id: 'm-error', deck: 'community', text: 'Bank error in your favour. Collect S$200.', effect: { kind: 'cash', amount: 200 } },
  { id: 'm-doctor', deck: 'community', text: 'Doctor’s fee. Pay S$50.', effect: { kind: 'cash', amount: -50 } },
  { id: 'm-stock', deck: 'community', text: 'From sale of stock you collect S$45.', effect: { kind: 'cash', amount: 45 } },
  { id: 'm-jailcard', deck: 'community', text: 'Get Out of Lock-up Free. Keep this card until you need it.', effect: { kind: 'jailCard' } },
  { id: 'm-jail', deck: 'community', text: 'Go to Lock-up. Do not pass GO. Do not collect S$200.', effect: { kind: 'jail' } },
  { id: 'm-holiday', deck: 'community', text: 'Holiday fund matures. Collect S$100.', effect: { kind: 'cash', amount: 100 } },
  { id: 'm-refund', deck: 'community', text: 'Income tax refund. Collect S$20.', effect: { kind: 'cash', amount: 20 } },
  { id: 'm-life', deck: 'community', text: 'Life insurance matures. Collect S$100.', effect: { kind: 'cash', amount: 100 } },
  { id: 'm-hospital', deck: 'community', text: 'Hospital fees. Pay S$100.', effect: { kind: 'cash', amount: -100 } },
  { id: 'm-school', deck: 'community', text: 'School fees are due. Pay S$50.', effect: { kind: 'cash', amount: -50 } },
  { id: 'm-cdc', deck: 'community', text: 'A neighbourhood voucher arrives. Collect S$100.', effect: { kind: 'cash', amount: 100 } },
  { id: 'm-birthday', deck: 'community', text: 'Birthday at the hawker centre. Collect S$10 from each player.', effect: { kind: 'collectEach', per: 10 } },
  { id: 'm-repairs', deck: 'community', text: 'You are assessed for street repairs. Pay S$40 per house and S$115 per hotel.', effect: { kind: 'repairs', perHouse: 40, perHotel: 115 } },
  { id: 'm-inherit', deck: 'community', text: 'You inherit S$100.', effect: { kind: 'cash', amount: 100 } },
  { id: 'm-fee', deck: 'community', text: 'Receive S$25 consultancy fee.', effect: { kind: 'cash', amount: 25 } },
]
