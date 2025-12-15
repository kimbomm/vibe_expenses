export type MemberRole = 'owner' | 'editor' | 'viewer'

export interface Member {
  userId: string
  email: string
  name: string
  role: MemberRole
  joinedAt: Date
}

export interface Ledger {
  id: string
  name: string
  description?: string
  currency: string
  ownerId: string
  members: Member[]
  encryptionKey?: string // 가계부별 암호화 키 (Base64)
  createdAt: Date
  updatedAt: Date
}

export interface Invitation {
  id: string
  ledgerId: string
  ledgerName: string
  email: string
  role: MemberRole
  status: 'pending' | 'accepted' | 'rejected'
  invitedBy: string
  invitedByName: string
  createdAt: Date
  respondedAt?: Date
}

