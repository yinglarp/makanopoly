import type { ColorGroup, GroupId, Property, Square, StreetProperty } from './types'

export const GROUP_COLOR: Record<GroupId, string> = {
  brown: '#8d5a34',
  lightBlue: '#9fd4ea',
  pink: '#e7a0b8',
  orange: '#f0a35e',
  red: '#d64545',
  yellow: '#f2d15c',
  green: '#3f9d6a',
  darkBlue: '#234e78',
  mrt: '#1c1c1c',
  utility: '#efe8da',
}

export const COLOR_GROUPS: ColorGroup[] = [
  'brown',
  'lightBlue',
  'pink',
  'orange',
  'red',
  'yellow',
  'green',
  'darkBlue',
]

export function inkFor(group: GroupId): string {
  if (group === 'yellow' || group === 'lightBlue' || group === 'utility') return '#241c16'
  return '#fffaf3'
}

export function mortgageValue(price: number): number {
  return price / 2
}

export function unmortgageCost(price: number): number {
  const principal = price / 2
  return principal + Math.ceil(principal * 0.1)
}

function street(partial: Omit<StreetProperty, 'kind'>): StreetProperty {
  return { kind: 'street', ...partial }
}

export const PROPERTY_LIST: Property[] = [
  street({
    id: 'tampines',
    name: 'Tampines',
    short: 'Tampines',
    group: 'brown',
    price: 60,
    houseCost: 50,
    rent: [2, 10, 30, 90, 160, 250],
    neighborhood: 'Tampines',
    line: 'East-West Line',
    dish: 'soon kueh',
    hawker: 'Tampines Round Market',
    about: 'Tampines is an East-West Line station, and also a Downtown Line interchange. Tampines Round Market is the hawker stop for soon kueh, a steamed dumpling of bamboo shoot and turnip.',
  }),
  street({
    id: 'bedok',
    name: 'Bedok',
    short: 'Bedok',
    group: 'brown',
    price: 60,
    houseCost: 50,
    rent: [4, 20, 60, 180, 320, 450],
    neighborhood: 'Bedok',
    line: 'East-West Line',
    dish: 'Bedok bak chor mee',
    hawker: 'Bedok 85',
    about: 'Bedok is an East-West Line station in the east. Bedok 85, the night hawker square nearby, is famous for bak chor mee.',
  }),
  street({
    id: 'amk',
    name: 'Ang Mo Kio',
    short: 'Ang Mo Kio',
    group: 'lightBlue',
    price: 100,
    houseCost: 50,
    rent: [6, 30, 90, 270, 400, 550],
    neighborhood: 'Ang Mo Kio',
    line: 'North-South Line',
    dish: 'minced meat noodles',
    hawker: '628 Ang Mo Kio Market',
    about: 'Ang Mo Kio is a North-South Line station. 628 Market is the neighbourhood hawker centre; minced meat noodles are the usual order.',
  }),
  street({
    id: 'bishan',
    name: 'Bishan',
    short: 'Bishan',
    group: 'lightBlue',
    price: 100,
    houseCost: 50,
    rent: [6, 30, 90, 270, 400, 550],
    neighborhood: 'Bishan',
    line: 'North-South Line',
    dish: 'Bishan bak chor mee',
    hawker: '511 Food Centre',
    about: 'Bishan is a North-South Line station and a Circle Line interchange. 511 Food Centre is the hawker stop for bak chor mee.',
  }),
  street({
    id: 'toapayoh',
    name: 'Toa Payoh',
    short: 'Toa Payoh',
    group: 'lightBlue',
    price: 120,
    houseCost: 50,
    rent: [8, 40, 100, 300, 450, 600],
    neighborhood: 'Toa Payoh',
    line: 'North-South Line',
    dish: 'lor mee',
    hawker: 'Toa Payoh Lorong 8 Market',
    about: 'Toa Payoh is a North-South Line station in one of Singapore’s oldest towns. Lorong 8 Market serves lor mee: yellow noodles in a thick, starchy gravy.',
  }),
  street({
    id: 'joochiat',
    name: 'Katong Park',
    short: 'Katong Park',
    group: 'pink',
    price: 140,
    houseCost: 100,
    rent: [10, 50, 150, 450, 625, 750],
    neighborhood: 'Joo Chiat',
    line: 'Thomson-East Coast Line',
    dish: 'nyonya kueh',
    hawker: 'Joo Chiat kueh shops',
    about: 'Katong Park is a Thomson-East Coast Line station beside Joo Chiat. Nyonya kueh — colourful steamed cakes — is the snack the shophouses are known for.',
  }),
  street({
    id: 'eastcoast',
    name: 'Marine Parade',
    short: 'Marine Pde',
    group: 'pink',
    price: 140,
    houseCost: 100,
    rent: [10, 50, 150, 450, 625, 750],
    neighborhood: 'East Coast',
    line: 'Thomson-East Coast Line',
    dish: 'East Coast satay',
    hawker: 'East Coast Lagoon Food Village',
    about: 'Marine Parade is a Thomson-East Coast Line station. East Coast Lagoon Food Village, toward the sea, grills satay a few sticks at a time.',
  }),
  street({
    id: 'koonseng',
    name: 'Tanjong Katong',
    short: 'Tg Katong',
    group: 'pink',
    price: 160,
    houseCost: 100,
    rent: [12, 60, 180, 500, 700, 900],
    neighborhood: 'Katong',
    line: 'Thomson-East Coast Line',
    dish: 'Katong laksa',
    hawker: 'Katong laksa stalls',
    about: 'Tanjong Katong is a Thomson-East Coast Line station in Katong. Katong laksa is coconut gravy over thick rice noodles.',
  }),
  street({
    id: 'sengpoh',
    name: 'Tiong Bahru',
    short: 'Tiong Bahru',
    group: 'orange',
    price: 180,
    houseCost: 100,
    rent: [14, 70, 200, 550, 750, 950],
    neighborhood: 'Tiong Bahru',
    line: 'East-West Line',
    dish: 'chwee kueh',
    hawker: 'Tiong Bahru Market',
    about: 'Tiong Bahru is an East-West Line station. The market on Seng Poh Road serves chwee kueh: steamed rice cakes topped with preserved radish.',
  }),
  street({
    id: 'keongsaik',
    name: 'Outram Park',
    short: 'Outram Park',
    group: 'orange',
    price: 180,
    houseCost: 100,
    rent: [14, 70, 200, 550, 750, 950],
    neighborhood: 'Bukit Pasoh',
    line: 'East-West Line',
    dish: 'prawn paste chicken',
    hawker: 'Keong Saik zi char shops',
    about: 'Outram Park is an East-West Line station, and also a North East Line and Thomson-East Coast Line interchange. Keong Saik’s shophouses nearby serve prawn paste chicken.',
  }),
  street({
    id: 'smith',
    name: 'Chinatown',
    short: 'Chinatown',
    group: 'orange',
    price: 200,
    houseCost: 100,
    rent: [16, 80, 220, 600, 800, 1000],
    neighborhood: 'Chinatown',
    line: 'North East Line',
    dish: 'claypot rice',
    hawker: 'Chinatown Complex',
    about: 'Chinatown is a North East Line station and a Downtown Line interchange. Smith Street leads to Chinatown Complex, where people queue for claypot rice.',
  }),
  street({
    id: 'arab',
    name: 'Bugis',
    short: 'Bugis',
    group: 'red',
    price: 220,
    houseCost: 150,
    rent: [18, 90, 250, 700, 875, 1050],
    neighborhood: 'Kampong Glam',
    line: 'East-West Line',
    dish: 'nasi padang',
    hawker: 'Hjh Maimunah',
    about: 'Bugis is an East-West Line station and a Downtown Line interchange, beside Kampong Glam. Nasi padang is rice with many small Malay dishes. Hjh Maimunah is the famous kitchen nearby.',
  }),
  street({
    id: 'serangoon',
    name: 'Little India',
    short: 'Little India',
    group: 'red',
    price: 220,
    houseCost: 150,
    rent: [18, 90, 250, 700, 875, 1050],
    neighborhood: 'Little India',
    line: 'North East Line',
    dish: 'biryani',
    hawker: 'Tekka Centre',
    about: 'Little India is a North East Line station and a Downtown Line interchange. Tekka Centre, at the start of Serangoon Road, is the place for biryani.',
  }),
  street({
    id: 'hajilane',
    name: 'Rochor',
    short: 'Rochor',
    group: 'red',
    price: 240,
    houseCost: 150,
    rent: [20, 100, 300, 750, 925, 1100],
    neighborhood: 'Rochor',
    line: 'Downtown Line',
    dish: 'murtabak',
    hawker: 'Zam Zam',
    about: 'Rochor is a Downtown Line station between Bugis and Little India. A short walk away, Zam Zam on North Bridge Road is known for murtabak.',
  }),
  street({
    id: 'adam',
    name: 'Botanic Gardens',
    short: 'Botanic Gdns',
    group: 'yellow',
    price: 260,
    houseCost: 150,
    rent: [22, 110, 330, 800, 975, 1150],
    neighborhood: 'Bukit Timah',
    line: 'Circle Line',
    dish: 'nasi lemak',
    hawker: 'Adam Road Food Centre',
    about: 'Botanic Gardens is a Circle Line station and a Downtown Line interchange. Adam Road Food Centre, in Bukit Timah, is famous for nasi lemak.',
  }),
  street({
    id: 'orchard',
    name: 'Newton',
    short: 'Newton',
    group: 'yellow',
    price: 260,
    houseCost: 150,
    rent: [22, 110, 330, 800, 975, 1150],
    neighborhood: 'Newton',
    line: 'North-South Line',
    dish: 'BBQ stingray',
    hawker: 'Newton Food Centre',
    about: 'Newton is a North-South Line station and a Downtown Line interchange. Newton Food Centre serves barbecue stingray in a banana leaf.',
  }),
  street({
    id: 'mambong',
    name: 'Holland Village',
    short: 'Holland V.',
    group: 'yellow',
    price: 280,
    houseCost: 150,
    rent: [24, 120, 360, 850, 1025, 1200],
    neighborhood: 'Holland Village',
    line: 'Circle Line',
    dish: 'roti prata',
    hawker: 'Holland Village Market',
    about: 'Holland Village is a Circle Line station. Lorong Mambong is the food street; roti prata, a flipped flatbread with curry, is the late-night order.',
  }),
  street({
    id: 'maxwell',
    name: 'Maxwell',
    short: 'Maxwell',
    group: 'green',
    price: 300,
    houseCost: 200,
    rent: [26, 130, 390, 900, 1100, 1275],
    neighborhood: 'Tanjong Pagar',
    line: 'Thomson-East Coast Line',
    dish: 'Hainanese chicken rice',
    hawker: 'Maxwell Food Centre',
    about: 'Maxwell is a Thomson-East Coast Line station between Chinatown and Tanjong Pagar. Maxwell Food Centre is home to Tian Tian Hainanese chicken rice.',
  }),
  street({
    id: 'boontat',
    name: 'Tanjong Pagar',
    short: 'Tg Pagar',
    group: 'green',
    price: 300,
    houseCost: 200,
    rent: [26, 130, 390, 900, 1100, 1275],
    neighborhood: 'Downtown Core',
    line: 'East-West Line',
    dish: 'Lau Pa Sat satay',
    hawker: 'Lau Pa Sat',
    about: 'Tanjong Pagar is an East-West Line station. Boon Tat Street beside it fills with Lau Pa Sat’s satay stalls in the evening.',
  }),
  street({
    id: 'telokayer',
    name: 'Telok Ayer',
    short: 'Telok Ayer',
    group: 'green',
    price: 320,
    houseCost: 200,
    rent: [28, 150, 450, 1000, 1200, 1400],
    neighborhood: 'Telok Ayer',
    line: 'Downtown Line',
    dish: 'fishball noodles',
    hawker: 'Amoy Street Food Centre',
    about: 'Telok Ayer is a Downtown Line station among the old shophouses and temples. Amoy Street Food Centre is the lunch crowd’s fishball noodle stop.',
  }),
  street({
    id: 'raffles',
    name: 'Raffles Place',
    short: 'Raffles Pl',
    group: 'darkBlue',
    price: 350,
    houseCost: 200,
    rent: [35, 175, 500, 1100, 1300, 1500],
    neighborhood: 'Raffles Place',
    line: 'North-South Line',
    dish: 'economy rice',
    hawker: 'Raffles Place food courts',
    about: 'Raffles Place is a North-South Line station and an East-West Line interchange in the financial district. Lunch is often economy rice: rice plus a few dishes, priced by the choice.',
  }),
  street({
    id: 'marina',
    name: 'Gardens by the Bay',
    short: 'Gardens Bay',
    group: 'darkBlue',
    price: 400,
    houseCost: 200,
    rent: [50, 200, 600, 1400, 1700, 2000],
    neighborhood: 'Marina Bay',
    line: 'Thomson-East Coast Line',
    dish: 'Satay by the Bay',
    hawker: 'Satay by the Bay',
    about: 'Gardens by the Bay is a Thomson-East Coast Line station. Satay by the Bay grills satay with the Marina Bay skyline behind it.',
  }),
  {
    id: 'ew',
    kind: 'mrt',
    name: 'East-West Line',
    short: 'East-West',
    group: 'mrt',
    price: 200,
    about: 'The East-West Line is one of the six MRT lines on the LTA rail network. Owning lines works like a set: one charges S$25, two S$50, three S$100, and all four S$200.',
  },
  {
    id: 'ns',
    kind: 'mrt',
    name: 'North-South Line',
    short: 'North-South',
    group: 'mrt',
    price: 200,
    about: 'The North-South Line is one of the six MRT lines on the LTA rail network. Owning lines works like a set: one charges S$25, two S$50, three S$100, and all four S$200.',
  },
  {
    id: 'circle',
    kind: 'mrt',
    name: 'Circle Line',
    short: 'Circle',
    group: 'mrt',
    price: 200,
    about: 'The Circle Line is one of the six MRT lines on the LTA rail network. Owning lines works like a set: one charges S$25, two S$50, three S$100, and all four S$200.',
  },
  {
    id: 'downtown',
    kind: 'mrt',
    name: 'Downtown Line',
    short: 'Downtown',
    group: 'mrt',
    price: 200,
    about: 'The Downtown Line is one of the six MRT lines on the LTA rail network. Owning lines works like a set: one charges S$25, two S$50, three S$100, and all four S$200.',
  },
  {
    id: 'pub',
    kind: 'utility',
    name: 'PUB Water',
    short: 'PUB Water',
    group: 'utility',
    price: 150,
    about: 'Utilities bill from the dice. One utility costs 4× the roll. Own both water and power and the bill is 10× the roll.',
  },
  {
    id: 'sp',
    kind: 'utility',
    name: 'SP Group Power',
    short: 'SP Power',
    group: 'utility',
    price: 150,
    about: 'Utilities bill from the dice. One utility costs 4× the roll. Own both water and power and the bill is 10× the roll.',
  },
]

export const PROPERTIES: Record<string, Property> = Object.fromEntries(PROPERTY_LIST.map((property) => [property.id, property]))

type SquareDraft =
  | { kind: 'go' | 'community' | 'chance' | 'jail' | 'free' | 'goToJail'; label: string }
  | { kind: 'tax'; label: string; tax: 'income' | 'luxury' }
  | { kind: 'property'; propertyId: string }

const RAW: SquareDraft[] = [
  { kind: 'go', label: 'GO' },
  { kind: 'property', propertyId: 'tampines' },
  { kind: 'community', label: 'Community Chest' },
  { kind: 'property', propertyId: 'bedok' },
  { kind: 'tax', label: 'Income Tax', tax: 'income' },
  { kind: 'property', propertyId: 'ew' },
  { kind: 'property', propertyId: 'amk' },
  { kind: 'chance', label: 'Chance' },
  { kind: 'property', propertyId: 'bishan' },
  { kind: 'property', propertyId: 'toapayoh' },
  { kind: 'jail', label: 'Lock-up' },
  { kind: 'property', propertyId: 'joochiat' },
  { kind: 'property', propertyId: 'pub' },
  { kind: 'property', propertyId: 'eastcoast' },
  { kind: 'property', propertyId: 'koonseng' },
  { kind: 'property', propertyId: 'ns' },
  { kind: 'property', propertyId: 'sengpoh' },
  { kind: 'community', label: 'Community Chest' },
  { kind: 'property', propertyId: 'keongsaik' },
  { kind: 'property', propertyId: 'smith' },
  { kind: 'free', label: 'Void Deck' },
  { kind: 'property', propertyId: 'arab' },
  { kind: 'chance', label: 'Chance' },
  { kind: 'property', propertyId: 'serangoon' },
  { kind: 'property', propertyId: 'hajilane' },
  { kind: 'property', propertyId: 'circle' },
  { kind: 'property', propertyId: 'adam' },
  { kind: 'property', propertyId: 'orchard' },
  { kind: 'property', propertyId: 'sp' },
  { kind: 'property', propertyId: 'mambong' },
  { kind: 'goToJail', label: 'Go to Lock-up' },
  { kind: 'property', propertyId: 'maxwell' },
  { kind: 'property', propertyId: 'boontat' },
  { kind: 'community', label: 'Community Chest' },
  { kind: 'property', propertyId: 'telokayer' },
  { kind: 'property', propertyId: 'downtown' },
  { kind: 'chance', label: 'Chance' },
  { kind: 'property', propertyId: 'raffles' },
  { kind: 'tax', label: 'Luxury Tax', tax: 'luxury' },
  { kind: 'property', propertyId: 'marina' },
]

export const BOARD: Square[] = RAW.map((square, index) => ({ ...square, index }))

export function getProperty(id: string): Property {
  const property = PROPERTIES[id]
  if (!property) throw new Error(`Unknown property ${id}`)
  return property
}

export function isStreet(property: Property): property is StreetProperty {
  return property.kind === 'street'
}

export function groupIds(group: GroupId): string[] {
  return PROPERTY_LIST.filter((property) => property.group === group).map((property) => property.id)
}

export function propertyIndex(id: string): number {
  const index = BOARD.findIndex((square) => square.kind === 'property' && square.propertyId === id)
  if (index < 0) throw new Error(`Property ${id} is not on the board`)
  return index
}

export function indexesInGroup(group: 'mrt' | 'utility'): number[] {
  return groupIds(group).map(propertyIndex)
}

export function gridCell(index: number): { col: number; row: number; side: 'bottom' | 'left' | 'top' | 'right' } {
  if (index <= 10) return { col: 10 - index, row: 10, side: 'bottom' }
  if (index < 20) return { col: 0, row: 10 - (index - 10), side: 'left' }
  if (index <= 30) return { col: index - 20, row: 0, side: 'top' }
  return { col: 10, row: index - 30, side: 'right' }
}

export function squareLabel(square: Square): string {
  if (square.kind === 'property') return getProperty(square.propertyId).short
  return square.label
}
