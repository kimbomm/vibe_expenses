/**
 * 기존 가계부 암호화 마이그레이션 유틸리티
 *
 * 사용법:
 * 1. 브라우저 콘솔에서 실행하거나
 * 2. 설정 페이지에서 마이그레이션 버튼 추가
 */

import { doc, updateDoc, getDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { generateEncryptionKey, encrypt, encryptNumber } from './encryption'
import type { Ledger } from '@/types'

/**
 * 단일 가계부에 암호화 키 추가 (키가 없는 경우만)
 */
export async function addEncryptionKeyToLedger(ledgerId: string): Promise<string | null> {
  try {
    const ledgerRef = doc(db, 'ledgers', ledgerId)
    const ledgerSnap = await getDoc(ledgerRef)

    if (!ledgerSnap.exists()) {
      console.error('가계부를 찾을 수 없습니다:', ledgerId)
      return null
    }

    const data = ledgerSnap.data()

    // 이미 키가 있으면 스킵
    if (data.encryptionKey) {
      console.log('이미 암호화 키가 있습니다:', ledgerId)
      return data.encryptionKey
    }

    // 새 키 생성 및 저장
    const encryptionKey = await generateEncryptionKey()
    await updateDoc(ledgerRef, {
      encryptionKey,
      updatedAt: serverTimestamp(),
    })

    console.log('암호화 키 추가 완료:', ledgerId)
    return encryptionKey
  } catch (error) {
    console.error('암호화 키 추가 실패:', error)
    throw error
  }
}

/**
 * 사용자의 모든 가계부에 암호화 키 추가
 */
export async function addEncryptionKeyToAllLedgers(userId: string): Promise<void> {
  try {
    const ledgersRef = collection(db, 'ledgers')
    const snapshot = await getDocs(ledgersRef)

    let processed = 0
    let skipped = 0
    let added = 0

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data()

      // 소유자이거나 멤버인 가계부만 처리
      const isMember =
        data.ownerId === userId || (data.memberIds && data.memberIds.includes(userId))

      if (!isMember) continue
      processed++

      if (data.encryptionKey) {
        skipped++
        continue
      }

      await addEncryptionKeyToLedger(docSnap.id)
      added++
    }

    console.log(
      `마이그레이션 완료: 총 ${processed}개 가계부, ${added}개 키 추가, ${skipped}개 스킵`
    )
  } catch (error) {
    console.error('마이그레이션 실패:', error)
    throw error
  }
}

/**
 * 기존 거래 데이터 암호화 (주의: 이미 암호화된 데이터는 건너뜀)
 * 이 함수는 매우 주의해서 사용해야 함
 */
export async function encryptExistingTransactions(
  ledgerId: string,
  encryptionKey: string
): Promise<{ encrypted: number; skipped: number }> {
  // 이 기능은 복잡하고 위험하므로 현재는 구현하지 않음
  // 새로 생성되는 데이터만 암호화하고, 기존 데이터는 점진적으로 수정 시 암호화됨
  console.warn('기존 데이터 암호화는 현재 지원하지 않습니다.')
  console.warn('새로 생성/수정되는 데이터부터 자동으로 암호화됩니다.')
  return { encrypted: 0, skipped: 0 }
}

/**
 * 암호화 상태 확인
 */
export async function checkEncryptionStatus(ledgerId: string): Promise<{
  hasKey: boolean
  keyLength: number | null
}> {
  try {
    const ledgerRef = doc(db, 'ledgers', ledgerId)
    const ledgerSnap = await getDoc(ledgerRef)

    if (!ledgerSnap.exists()) {
      return { hasKey: false, keyLength: null }
    }

    const data = ledgerSnap.data()
    return {
      hasKey: !!data.encryptionKey,
      keyLength: data.encryptionKey ? data.encryptionKey.length : null,
    }
  } catch (error) {
    console.error('암호화 상태 확인 실패:', error)
    return { hasKey: false, keyLength: null }
  }
}
