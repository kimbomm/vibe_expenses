import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from '@/shared/api/firebase/config'

const googleProvider = new GoogleAuthProvider()
// 추가 설정 (선택사항)
googleProvider.addScope('profile')
googleProvider.addScope('email')
// 계정 선택 프롬프트 표시
googleProvider.setCustomParameters({
  prompt: 'select_account',
})

// Google 로그인 (Popup 방식)
export async function signInWithGoogle(): Promise<User> {
  try {
    console.log('signInWithGoogle - 시작 (Popup 방식)')
    console.log('signInWithGoogle - authDomain:', auth.app.options.authDomain)
    console.log('signInWithGoogle - signInWithPopup 호출 전')

    const result = await signInWithPopup(auth, googleProvider)
    console.log('signInWithPopup 호출 완료')
    console.log('signInWithGoogle - result.user:', result.user)

    return result.user
  } catch (error) {
    console.error('Google 로그인 실패:', error)
    console.error('에러 상세:', error instanceof Error ? error.message : error)
    if (error instanceof Error) {
      console.error('에러 스택:', error.stack)
    }
    throw error
  }
}

// 로그아웃
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('로그아웃 실패:', error)
    throw error
  }
}

