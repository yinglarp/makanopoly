export function money(amount: number): string {
  const sign = amount < 0 ? '-' : ''
  return `${sign}S$${Math.abs(amount)}`
}
