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
import { db } from './config'
import type { Ledger, Member } from '@/types'

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
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  }
}

// Note: convertLedgerToFirestore 함수는 현재 사용하지 않지만,
// 나중에 필요할 수 있으므로 주석 처리합니다.
// function convertLedgerToFirestore(ledger: Partial<Ledger>): any {
//   const data: any = {
//     name: ledger.name,
//     description: ledger.description || '',
//     currency: ledger.currency,
//     ownerId: ledger.ownerId,
//     members: ledger.members?.map((m) => ({
//       userId: m.userId,
//       email: m.email,
//       name: m.name,
//       role: m.role,
//       joinedAt: m.joinedAt instanceof Date ? m.joinedAt : timestampToDate(m.joinedAt),
//     })) || [],
//     updatedAt: serverTimestamp(),
//   }
//
//   // createdAt은 새 문서 생성 시에만 설정
//   if (ledger.createdAt) {
//     data.createdAt = ledger.createdAt instanceof Date ? ledger.createdAt : timestampToDate(ledger.createdAt)
//   }
//
//   return data
// }

/**
 * 사용자가 소유하거나 멤버인 모든 가계부 조회
 */
export async function getLedgersByUser(userId: string): Promise<Ledger[]> {
  try {
    const ledgersRef = collection(db, 'ledgers')
    const q = query(ledgersRef, where('ownerId', '==', userId))
    const querySnapshot = await getDocs(q)

    const ledgers: Ledger[] = []
    querySnapshot.forEach((doc) => {
      ledgers.push(convertFirestoreLedger(doc.id, doc.data()))
    })

    // 멤버로 포함된 가계부도 조회 (ownerId가 아닌 경우)
    // Note: Firestore는 배열 필드에 대한 쿼리가 제한적이므로,
    // 클라이언트에서 필터링하거나 Cloud Functions를 사용하는 것이 좋습니다.
    // 현재는 ownerId로만 조회하고, 멤버로 포함된 가계부는 실시간 리스너에서 처리합니다.

    return ledgers
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

    const ledgerData = {
      name: ledger.name,
      description: ledger.description || '',
      currency: ledger.currency,
      ownerId,
      memberIds: [ownerId],
      members: [member],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(ledgersRef, ledgerData)
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
