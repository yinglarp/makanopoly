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
    name: 'Tampines Street 11',
    short: 'Tampines St 11',
    group: 'brown',
    price: 60,
    houseCost: 50,
    rent: [2, 10, 30, 90, 160, 250],
    neighborhood: 'Tampines',
    dish: 'soon kueh',
    hawker: 'Tampines Round Market',
    about: 'Tampines Street 11 is home to Tampines Round Market. Soon kueh, a steamed dumpling of bamboo shoot and turnip, is the snack to know.',
  }),
  street({
    id: 'bedok',
    name: 'Bedok North Avenue 3',
    short: 'Bedok N. Ave 3',
    group: 'brown',
    price: 60,
    houseCost: 50,
    rent: [4, 20, 60, 180, 320, 450],
    neighborhood: 'Bedok',
    dish: 'Bedok bak chor mee',
    hawker: 'Bedok 85',
    about: 'Bedok North is a big eastern estate. Bedok 85, the night hawker square nearby, is famous for bak chor mee and barbecue stingray.',
  }),
  street({
    id: 'amk',
    name: 'Ang Mo Kio Avenue 4',
    short: 'AMK Ave 4',
    group: 'lightBlue',
    price: 100,
    houseCost: 50,
    rent: [6, 30, 90, 270, 400, 550],
    neighborhood: 'Ang Mo Kio',
    dish: 'minced meat noodles',
    hawker: '628 Ang Mo Kio Market',
    about: 'Ang Mo Kio is a north-side HDB town. 628 Market is the neighbourhood hawker centre; minced meat noodles and carrot cake are the usual order.',
  }),
  street({
    id: 'bishan',
    name: 'Bishan Street 22',
    short: 'Bishan St 22',
    group: 'lightBlue',
    price: 100,
    houseCost: 50,
    rent: [6, 30, 90, 270, 400, 550],
    neighborhood: 'Bishan',
    dish: 'Bishan bak chor mee',
    hawker: '511 Food Centre',
    about: 'Bishan Street 22 sits in the Bishan estate, built around the park. A few blocks away, 511 Food Centre is the hawker stop for bak chor mee.',
  }),
  street({
    id: 'toapayoh',
    name: 'Lorong 8 Toa Payoh',
    short: 'Lor 8 Toa Payoh',
    group: 'lightBlue',
    price: 120,
    houseCost: 50,
    rent: [8, 40, 100, 300, 450, 600],
    neighborhood: 'Toa Payoh',
    dish: 'lor mee',
    hawker: 'Toa Payoh Lorong 8 Market',
    about: 'Toa Payoh is one of Singapore’s oldest towns. Lorong 8 Market serves lor mee: yellow noodles in a thick, starchy gravy.',
  }),
  street({
    id: 'joochiat',
    name: 'Joo Chiat Road',
    short: 'Joo Chiat Rd',
    group: 'pink',
    price: 140,
    houseCost: 100,
    rent: [10, 50, 150, 450, 625, 750],
    neighborhood: 'Joo Chiat',
    dish: 'nyonya kueh',
    hawker: 'Joo Chiat kueh shops',
    about: 'Joo Chiat Road is a Peranakan shophouse street. Nyonya kueh — colourful steamed cakes — is the snack the area is known for.',
  }),
  street({
    id: 'eastcoast',
    name: 'East Coast Road',
    short: 'East Coast Rd',
    group: 'pink',
    price: 140,
    houseCost: 100,
    rent: [10, 50, 150, 450, 625, 750],
    neighborhood: 'East Coast',
    dish: 'East Coast satay',
    hawker: 'East Coast Lagoon Food Village',
    about: 'East Coast Road runs toward the sea. East Coast Lagoon Food Village grills satay by the park, a few sticks at a time.',
  }),
  street({
    id: 'koonseng',
    name: 'Koon Seng Road',
    short: 'Koon Seng Rd',
    group: 'pink',
    price: 160,
    houseCost: 100,
    rent: [12, 60, 180, 500, 700, 900],
    neighborhood: 'Katong',
    dish: 'Katong laksa',
    hawker: 'Katong laksa stalls',
    about: 'Koon Seng Road is the pastel Peranakan terrace street in Katong. Katong laksa is coconut gravy over thick rice noodles.',
  }),
  street({
    id: 'sengpoh',
    name: 'Seng Poh Road',
    short: 'Seng Poh Rd',
    group: 'orange',
    price: 180,
    houseCost: 100,
    rent: [14, 70, 200, 550, 750, 950],
    neighborhood: 'Tiong Bahru',
    dish: 'chwee kueh',
    hawker: 'Tiong Bahru Market',
    about: 'Seng Poh Road faces Tiong Bahru Market. Chwee kueh are steamed rice cakes topped with preserved radish.',
  }),
  street({
    id: 'keongsaik',
    name: 'Keong Saik Road',
    short: 'Keong Saik Rd',
    group: 'orange',
    price: 180,
    houseCost: 100,
    rent: [14, 70, 200, 550, 750, 950],
    neighborhood: 'Bukit Pasoh',
    dish: 'prawn paste chicken',
    hawker: 'Keong Saik zi char shops',
    about: 'Keong Saik Road is a shophouse street between Outram and Chinatown. Prawn paste chicken is the Cantonese order.',
  }),
  street({
    id: 'smith',
    name: 'Smith Street',
    short: 'Smith St',
    group: 'orange',
    price: 200,
    houseCost: 100,
    rent: [16, 80, 220, 600, 800, 1000],
    neighborhood: 'Chinatown',
    dish: 'claypot rice',
    hawker: 'Chinatown Complex',
    about: 'Smith Street runs through Chinatown to the Complex food centre. Claypot rice, scorched at the bottom, is the dish people queue for.',
  }),
  street({
    id: 'arab',
    name: 'Arab Street',
    short: 'Arab St',
    group: 'red',
    price: 220,
    houseCost: 150,
    rent: [18, 90, 250, 700, 875, 1050],
    neighborhood: 'Kampong Glam',
    dish: 'nasi padang',
    hawker: 'Hjh Maimunah',
    about: 'Arab Street is the heart of Kampong Glam. Nasi padang is rice with many small Malay dishes. Hjh Maimunah is the famous kitchen nearby.',
  }),
  street({
    id: 'serangoon',
    name: 'Serangoon Road',
    short: 'Serangoon Rd',
    group: 'red',
    price: 220,
    houseCost: 150,
    rent: [18, 90, 250, 700, 875, 1050],
    neighborhood: 'Little India',
    dish: 'biryani',
    hawker: 'Tekka Centre',
    about: 'Serangoon Road is the spine of Little India. Tekka Centre, at the start of the road, is the place for biryani and teh tarik.',
  }),
  street({
    id: 'hajilane',
    name: 'Haji Lane',
    short: 'Haji Lane',
    group: 'red',
    price: 240,
    houseCost: 150,
    rent: [20, 100, 300, 750, 925, 1100],
    neighborhood: 'Bugis',
    dish: 'murtabak',
    hawker: 'Zam Zam',
    about: 'Haji Lane is the mural alley in Kampong Glam, beside Bugis. A short walk away, Zam Zam on North Bridge Road is known for murtabak.',
  }),
  street({
    id: 'adam',
    name: 'Adam Road',
    short: 'Adam Rd',
    group: 'yellow',
    price: 260,
    houseCost: 150,
    rent: [22, 110, 330, 800, 975, 1150],
    neighborhood: 'Bukit Timah',
    dish: 'nasi lemak',
    hawker: 'Adam Road Food Centre',
    about: 'Adam Road cuts through Bukit Timah. Adam Road Food Centre is famous for nasi lemak: coconut rice, ikan bilis, peanut, egg, and sambal.',
  }),
  street({
    id: 'orchard',
    name: 'Orchard Road',
    short: 'Orchard Rd',
    group: 'yellow',
    price: 260,
    houseCost: 150,
    rent: [22, 110, 330, 800, 975, 1150],
    neighborhood: 'Orchard',
    dish: 'BBQ stingray',
    hawker: 'Newton Food Centre',
    about: 'Orchard Road is the shopping belt. The hawker lesson is a short walk away at Newton Food Centre: barbecue stingray in a banana leaf.',
  }),
  street({
    id: 'mambong',
    name: 'Lorong Mambong',
    short: 'Lor Mambong',
    group: 'yellow',
    price: 280,
    houseCost: 150,
    rent: [24, 120, 360, 850, 1025, 1200],
    neighborhood: 'Holland Village',
    dish: 'roti prata',
    hawker: 'Holland Village Market',
    about: 'Lorong Mambong is the food street of Holland Village. Roti prata, a flipped flatbread with curry, is the late-night order.',
  }),
  street({
    id: 'maxwell',
    name: 'Maxwell Road',
    short: 'Maxwell Rd',
    group: 'green',
    price: 300,
    houseCost: 200,
    rent: [26, 130, 390, 900, 1100, 1275],
    neighborhood: 'Tanjong Pagar',
    dish: 'Hainanese chicken rice',
    hawker: 'Maxwell Food Centre',
    about: 'Maxwell Road sits between Chinatown and Tanjong Pagar. Maxwell Food Centre is home to Tian Tian Hainanese chicken rice.',
  }),
  street({
    id: 'boontat',
    name: 'Boon Tat Street',
    short: 'Boon Tat St',
    group: 'green',
    price: 300,
    houseCost: 200,
    rent: [26, 130, 390, 900, 1100, 1275],
    neighborhood: 'Downtown Core',
    dish: 'Lau Pa Sat satay',
    hawker: 'Lau Pa Sat',
    about: 'Boon Tat Street is closed to traffic in the evening for Lau Pa Sat’s satay stalls. Smoke, peanut sauce, and the iron market behind you.',
  }),
  street({
    id: 'telokayer',
    name: 'Telok Ayer Street',
    short: 'Telok Ayer St',
    group: 'green',
    price: 320,
    houseCost: 200,
    rent: [28, 150, 450, 1000, 1200, 1400],
    neighborhood: 'Telok Ayer',
    dish: 'fishball noodles',
    hawker: 'Amoy Street Food Centre',
    about: 'Telok Ayer Street keeps the old shophouses and temples. Amoy Street Food Centre, on the corner, is the lunch crowd’s fishball noodle stop.',
  }),
  street({
    id: 'raffles',
    name: 'Raffles Place',
    short: 'Raffles Place',
    group: 'darkBlue',
    price: 350,
    houseCost: 200,
    rent: [35, 175, 500, 1100, 1300, 1500],
    neighborhood: 'Raffles Place',
    dish: 'economy rice',
    hawker: 'Raffles Place food courts',
    about: 'Raffles Place is the financial district, which is why this deed costs so much. Lunch is often economy rice: rice plus a few dishes, priced by the choice.',
  }),
  street({
    id: 'marina',
    name: 'Marina Boulevard',
    short: 'Marina Blvd',
    group: 'darkBlue',
    price: 400,
    houseCost: 200,
    rent: [50, 200, 600, 1400, 1700, 2000],
    neighborhood: 'Marina Bay',
    dish: 'Satay by the Bay',
    hawker: 'Satay by the Bay',
    about: 'Marina Boulevard runs along Marina Bay. Satay by the Bay, in Gardens by the Bay, grills satay with the skyline behind it.',
  }),
  {
    id: 'ew',
    kind: 'mrt',
    name: 'East West Line',
    short: 'East West',
    group: 'mrt',
    price: 200,
    about: 'MRT lines work like a set. One line charges S$25. Two charge S$50, three S$100, and all four S$200.',
  },
  {
    id: 'ns',
    kind: 'mrt',
    name: 'North South Line',
    short: 'North South',
    group: 'mrt',
    price: 200,
    about: 'MRT lines work like a set. One line charges S$25. Two charge S$50, three S$100, and all four S$200.',
  },
  {
    id: 'circle',
    kind: 'mrt',
    name: 'Circle Line',
    short: 'Circle',
    group: 'mrt',
    price: 200,
    about: 'MRT lines work like a set. One line charges S$25. Two charge S$50, three S$100, and all four S$200.',
  },
  {
    id: 'downtown',
    kind: 'mrt',
    name: 'Downtown Line',
    short: 'Downtown',
    group: 'mrt',
    price: 200,
    about: 'MRT lines work like a set. One line charges S$25. Two charge S$50, three S$100, and all four S$200.',
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
