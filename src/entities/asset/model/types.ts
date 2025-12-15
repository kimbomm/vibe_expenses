export interface Asset {
  id: string
  ledgerId: string
  name: string
  category1: string
  category2: string
  balance: number
  currency: string
  memo?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export type AssetLogType = 'created' | 'updated' | 'deactivated' | 'reactivated' | 'balance_changed'

export interface AssetLog {
  id: string
  assetId: string
  ledgerId: string
  type: AssetLogType
  previousBalance?: number
  newBalance?: number
  description: string
  createdAt: Date
  createdBy: string
}

