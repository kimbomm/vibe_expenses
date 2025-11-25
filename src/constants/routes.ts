export const ROUTES = {
  // Auth
  LOGIN: '/login',
  SIGNUP: '/signup',

  // Main
  HOME: '/',
  DASHBOARD: '/dashboard',

  // Ledgers
  LEDGERS: '/ledgers',
  LEDGER_NEW: '/ledgers/new',
  LEDGER_DETAIL: (id: string) => `/ledgers/${id}`,
  LEDGER_SETTINGS: (id: string) => `/ledgers/${id}/settings`,

  // Transactions
  TRANSACTIONS: (ledgerId: string) => `/ledgers/${ledgerId}/transactions`,
  TRANSACTION_NEW: (ledgerId: string) => `/ledgers/${ledgerId}/transactions/new`,
  TRANSACTION_DETAIL: (ledgerId: string, transactionId: string) =>
    `/ledgers/${ledgerId}/transactions/${transactionId}`,

  // Assets
  ASSETS: (ledgerId: string) => `/ledgers/${ledgerId}/assets`,

  // Statistics
  STATISTICS: (ledgerId: string) => `/ledgers/${ledgerId}/statistics`,

  // Settings
  SETTINGS: '/settings',
} as const
