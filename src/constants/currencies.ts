export const CURRENCIES = [
  { code: 'KRW', symbol: '₩', name: '원 (KRW)' },
  { code: 'USD', symbol: '$', name: '달러 (USD)' },
  { code: 'EUR', symbol: '€', name: '유로 (EUR)' },
  { code: 'JPY', symbol: '¥', name: '엔 (JPY)' },
  { code: 'CNY', symbol: '¥', name: '위안 (CNY)' },
] as const

export const DEFAULT_CURRENCY = 'KRW'

export const getCurrencySymbol = (code: string) => {
  return CURRENCIES.find((c) => c.code === code)?.symbol || '₩'
}
