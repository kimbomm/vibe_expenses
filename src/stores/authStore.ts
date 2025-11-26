import { create } from 'zustand'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth, db } from '@/lib/firebase/config'
import { signInWithGoogle, signOutUser } from '@/lib/firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'

interface AuthState {
  user: User | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

// Firestore에 사용자 정보 저장/업데이트
async function saveUserToFirestore(user: User) {
  try {
    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)

    const userData = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || null,
      emailVerified: user.emailVerified || false,
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    if (!userSnap.exists()) {
      // 새 사용자 - 회원가입 처리
      console.log('새 사용자 회원가입:', user.uid)
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
      })
    } else {
      // 기존 사용자 - 정보 업데이트
      console.log('기존 사용자 정보 업데이트:', user.uid)
      await setDoc(userRef, userData, { merge: true })
    }
  } catch (error) {
    console.error('Firestore 사용자 정보 저장 실패:', error)
  }
}

export const useAuthStore = create<AuthState>((set) => {
  // 인증 상태 변경 감지
  onAuthStateChanged(auth, async (user) => {
    console.log('onAuthStateChanged - user:', user)

    // 사용자가 로그인한 경우 Firestore에 정보 저장/업데이트
    if (user) {
      await saveUserToFirestore(user)
    }

    set({ user, loading: false })
  })

  return {
    user: null,
    loading: true,
    signIn: async () => {
      try {
        set({ loading: true })
        const user = await signInWithGoogle()
        console.log('signIn - 로그인 성공:', user)

        // Firestore에 사용자 정보 저장/업데이트
        await saveUserToFirestore(user)

        // onAuthStateChanged가 자동으로 user를 설정하지만, 즉시 업데이트
        set({ user, loading: false })
      } catch (error) {
        console.error('로그인 실패:', error)
        set({ loading: false })
        throw error
      }
    },
    signOut: async () => {
      try {
        await signOutUser()
        set({ user: null })
      } catch (error) {
        console.error('로그아웃 실패:', error)
        throw error
      }
    },
  }
})
