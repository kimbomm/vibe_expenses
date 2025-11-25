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
  createdAt: Date
  updatedAt: Date
}

export interface Invitation {
  id: string
  ledgerId: string
  email: string
  role: MemberRole
  token: string
  status: 'pending' | 'accepted' | 'rejected'
  expiresAt: Date
  createdAt: Date
}
