import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from '@/shared/api/firebase/config'
import type { User as AppUser } from '../model/types'

// Firestore에 사용자 정보 저장/업데이트
export async function saveUserToFirestore(user: User): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)

    const userData: Partial<AppUser> = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || null,
      emailVerified: user.emailVerified || false,
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    }

    if (!userSnap.exists()) {
      // 새 사용자 - 회원가입 처리
      console.log('새 사용자 회원가입:', user.uid)
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date(),
      })
    } else {
      // 기존 사용자 - 정보 업데이트
      console.log('기존 사용자 정보 업데이트:', user.uid)
      await setDoc(userRef, userData, { merge: true })
    }
  } catch (error) {
    console.error('Firestore 사용자 정보 저장 실패:', error)
    throw error
  }
}

