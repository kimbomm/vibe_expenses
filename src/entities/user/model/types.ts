export interface User {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
  emailVerified: boolean
  createdAt?: Date
  updatedAt?: Date
  lastLoginAt?: Date
}

