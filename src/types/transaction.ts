export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  ledgerId: string
  type: TransactionType
  amount: number
  date: Date
  category1: string
  category2: string
  paymentMethod1?: string // 지출일 때만
  paymentMethod2?: string // 지출일 때만
  description: string
  memo?: string
  createdAt: Date
  createdBy: string
  updatedBy?: string
}
