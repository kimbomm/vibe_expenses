import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '@/shared/api/firebase/config'
import type { Ledger, Member } from '../model/types'
import { ensureDefaultCategories } from '@/entities/category/api/categoryApi'
import { generateEncryptionKey } from '@/shared/lib/crypto/encryption'

// Firestore의 Timestamp를 Date로 변환
function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date()
  if (timestamp instanceof Date) return timestamp
  return timestamp.toDate()
}

// Firestore의 Member 배열을 변환
function convertMembers(members: any[]): Member[] {
  return members.map((m) => ({
    userId: m.userId,
    email: m.email,
    name: m.name,
    role: m.role,
    joinedAt: timestampToDate(m.joinedAt),
  }))
}

// Firestore 문서를 Ledger 타입으로 변환
function convertFirestoreLedger(docId: string, data: any): Ledger {
  return {
    id: docId,
    name: data.name,
    description: data.description || '',
    currency: data.currency,
    ownerId: data.ownerId,
    members: convertMembers(data.members || []),
    encryptionKey: data.encryptionKey || undefined,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  }
}

/**
 * 사용자가 소유하거나 멤버인 모든 가계부 조회
 */
export async function getLedgersByUser(userId: string): Promise<Ledger[]> {
  try {
    const ledgersRef = collection(db, 'ledgers')
    const ledgerMap = new Map<string, Ledger>()

    // 1. 소유한 가계부 조회
    const ownerQuery = query(ledgersRef, where('ownerId', '==', userId))
    const ownerSnapshot = await getDocs(ownerQuery)
    ownerSnapshot.forEach((doc) => {
      ledgerMap.set(doc.id, convertFirestoreLedger(doc.id, doc.data()))
    })

    // 2. 멤버로 포함된 가계부 조회 (array-contains 사용)
    const memberQuery = query(ledgersRef, where('memberIds', 'array-contains', userId))
    const memberSnapshot = await getDocs(memberQuery)
    memberSnapshot.forEach((doc) => {
      // 중복 방지 (이미 owner로 조회된 경우)
      if (!ledgerMap.has(doc.id)) {
        ledgerMap.set(doc.id, convertFirestoreLedger(doc.id, doc.data()))
      }
    })

    return Array.from(ledgerMap.values())
  } catch (error) {
    console.error('가계부 조회 실패:', error)
    throw error
  }
}

/**
 * 특정 가계부 조회
 */
export async function getLedgerById(ledgerId: string): Promise<Ledger | null> {
  try {
    const ledgerRef = doc(db, 'ledgers', ledgerId)
    const ledgerSnap = await getDoc(ledgerRef)

    if (!ledgerSnap.exists()) {
      return null
    }

    return convertFirestoreLedger(ledgerSnap.id, ledgerSnap.data())
  } catch (error) {
    console.error('가계부 조회 실패:', error)
    throw error
  }
}

/**
 * 가계부 생성
 */
export async function createLedger(
  ledger: Omit<Ledger, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'members'>,
  ownerId: string,
  ownerEmail: string,
  ownerName: string
): Promise<string> {
  try {
    const ledgersRef = collection(db, 'ledgers')

    const member: Member = {
      userId: ownerId,
      email: ownerEmail,
      name: ownerName,
      role: 'owner',
      joinedAt: new Date(),
    }

    // 가계부별 암호화 키 생성
    const encryptionKey = await generateEncryptionKey()

    const ledgerData = {
      name: ledger.name,
      description: ledger.description || '',
      currency: ledger.currency,
      ownerId,
      memberIds: [ownerId],
      members: [member],
      encryptionKey, // 암호화 키 저장
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(ledgersRef, ledgerData)

    await ensureDefaultCategories(docRef.id)

    return docRef.id
  } catch (error) {
    console.error('가계부 생성 실패:', error)
    throw error
  }
}

/**
 * 가계부 수정
 */
export async function updateLedgerById(
  ledgerId: string,
  updates: Partial<Omit<Ledger, 'id' | 'createdAt' | 'ownerId' | 'members'>>
): Promise<void> {
  try {
    const ledgerRef = doc(db, 'ledgers', ledgerId)

    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    }

    // members는 별도로 관리하므로 업데이트에서 제외
    delete updateData.members
    delete updateData.ownerId
    delete updateData.createdAt

    await updateDoc(ledgerRef, updateData)
  } catch (error) {
    console.error('가계부 수정 실패:', error)
    throw error
  }
}

/**
 * 가계부 삭제
 */
export async function deleteLedgerById(ledgerId: string): Promise<void> {
  try {
    const ledgerRef = doc(db, 'ledgers', ledgerId)
    await deleteDoc(ledgerRef)
  } catch (error) {
    console.error('가계부 삭제 실패:', error)
    throw error
  }
}

