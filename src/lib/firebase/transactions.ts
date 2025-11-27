import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { Transaction } from '@/types'

// Firestore의 Timestamp를 Date로 변환
function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date()
  if (timestamp instanceof Date) return timestamp
  return timestamp.toDate()
}

// 날짜에서 YYYY-MM 형식의 월 키 생성
function getMonthKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

// transactionId에서 월 키 추출 (형식: {YYYY-MM}_{autoId})
function extractMonthKeyFromId(transactionId: string): string | null {
  const match = transactionId.match(/^(\d{4}-\d{2})_/)
  return match ? match[1] : null
}

// Firestore 문서를 Transaction 타입으로 변환
function convertFirestoreTransaction(docId: string, data: any, ledgerId: string): Transaction {
  return {
    id: docId,
    ledgerId,
    type: data.type,
    amount: data.amount,
    date: timestampToDate(data.date),
    category1: data.category1,
    category2: data.category2,
    paymentMethod1: data.paymentMethod1 || undefined,
    paymentMethod2: data.paymentMethod2 || undefined,
    description: data.description || '',
    memo: data.memo || undefined,
    createdAt: timestampToDate(data.createdAt),
    createdBy: data.createdBy,
    updatedBy: data.updatedBy || undefined,
  }
}

/**
 * 특정 월의 거래내역 조회
 * 경로: ledgers/{ledgerId}/transactions/{YYYY-MM}/items/{autoId}
 */
export async function getTransactionsByLedgerAndMonth(
  ledgerId: string,
  year: number,
  month: number
): Promise<Transaction[]> {
  try {
    const monthKey = `${year}-${String(month).padStart(2, '0')}`
    // 5개 세그먼트: ledgers / {ledgerId} / transactions / {monthKey} / items
    const transactionsRef = collection(db, 'ledgers', ledgerId, 'transactions', monthKey, 'items')
    const q = query(transactionsRef, orderBy('date', 'desc'))

    const querySnapshot = await getDocs(q)
    const transactions: Transaction[] = []
    querySnapshot.forEach((doc) => {
      // transactionId는 {monthKey}_{autoId} 형식
      const fullId = `${monthKey}_${doc.id}`
      transactions.push(convertFirestoreTransaction(fullId, doc.data(), ledgerId))
    })

    return transactions
  } catch (error) {
    console.error('거래내역 조회 실패:', error)
    throw error
  }
}

/**
 * 여러 월의 거래내역 조회
 */
export async function getTransactionsByLedgerAndMonths(
  ledgerId: string,
  monthKeys: string[]
): Promise<Transaction[]> {
  try {
    const promises = monthKeys.map(async (monthKey) => {
      const [year, month] = monthKey.split('-').map(Number)
      return getTransactionsByLedgerAndMonth(ledgerId, year, month)
    })

    const results = await Promise.all(promises)
    // 모든 결과를 합치고 날짜순으로 정렬
    return results.flat().sort((a, b) => b.date.getTime() - a.date.getTime())
  } catch (error) {
    console.error('거래내역 조회 실패:', error)
    throw error
  }
}

/**
 * 가계부별 거래내역 조회 (모든 월)
 * 주의: 이 함수는 모든 월을 조회하므로 비용이 높을 수 있습니다.
 * 가능하면 특정 월만 조회하는 함수를 사용하세요.
 */
export async function getTransactionsByLedger(ledgerId: string): Promise<Transaction[]> {
  try {
    // 모든 월을 조회하기 위해 컬렉션 그룹 쿼리 사용
    // 하지만 서브컬렉션 구조에서는 직접 조회가 어려우므로
    // 최근 12개월만 조회하는 것을 권장
    const now = new Date()
    const monthKeys: string[] = []

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      monthKeys.push(getMonthKey(date))
    }

    return getTransactionsByLedgerAndMonths(ledgerId, monthKeys)
  } catch (error) {
    console.error('거래내역 조회 실패:', error)
    throw error
  }
}

/**
 * 특정 거래내역 조회
 * transactionId 형식: {YYYY-MM}_{autoId}
 * 경로: ledgers/{ledgerId}/transactions/{YYYY-MM}/items/{autoId}
 */
export async function getTransactionById(
  ledgerId: string,
  transactionId: string
): Promise<Transaction | null> {
  try {
    const monthKey = extractMonthKeyFromId(transactionId)
    if (!monthKey) {
      console.error('Invalid transactionId format:', transactionId)
      return null
    }

    // transactionId에서 월 키 제거하여 실제 문서 ID 추출
    const docId = transactionId.replace(`${monthKey}_`, '')
    // 6개 세그먼트: ledgers / {ledgerId} / transactions / {monthKey} / items / {docId}
    const transactionRef = doc(db, 'ledgers', ledgerId, 'transactions', monthKey, 'items', docId)
    const transactionSnap = await getDoc(transactionRef)

    if (!transactionSnap.exists()) {
      return null
    }

    return convertFirestoreTransaction(transactionId, transactionSnap.data(), ledgerId)
  } catch (error) {
    console.error('거래내역 조회 실패:', error)
    throw error
  }
}

/**
 * 거래내역 생성
 * 반환되는 transactionId 형식: {YYYY-MM}_{autoId}
 * 경로: ledgers/{ledgerId}/transactions/{YYYY-MM}/items/{autoId}
 */
export async function createTransaction(
  transaction: Omit<Transaction, 'id' | 'createdAt' | 'createdBy' | 'updatedBy'>,
  userId: string
): Promise<string> {
  try {
    const date =
      transaction.date instanceof Date ? transaction.date : timestampToDate(transaction.date)
    const monthKey = getMonthKey(date)

    // 서브컬렉션 경로: ledgers/{ledgerId}/transactions/{YYYY-MM}/items
    const transactionsRef = collection(
      db,
      'ledgers',
      transaction.ledgerId,
      'transactions',
      monthKey,
      'items'
    )

    const transactionData = {
      type: transaction.type,
      amount: transaction.amount,
      date: date,
      category1: transaction.category1,
      category2: transaction.category2,
      paymentMethod1: transaction.paymentMethod1 || null,
      paymentMethod2: transaction.paymentMethod2 || null,
      description: transaction.description || '',
      memo: transaction.memo || null,
      createdAt: serverTimestamp(),
      createdBy: userId,
    }

    const docRef = await addDoc(transactionsRef, transactionData)
    // transactionId는 {monthKey}_{autoId} 형식
    return `${monthKey}_${docRef.id}`
  } catch (error) {
    console.error('거래내역 생성 실패:', error)
    throw error
  }
}

/**
 * 거래내역 수정
 * transactionId 형식: {YYYY-MM}_{autoId}
 * 날짜가 변경되면 다른 월의 서브컬렉션으로 이동해야 합니다.
 */
export async function updateTransactionById(
  ledgerId: string,
  transactionId: string,
  updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'createdBy'>>,
  userId: string
): Promise<void> {
  try {
    const monthKey = extractMonthKeyFromId(transactionId)
    if (!monthKey) {
      throw new Error('Invalid transactionId format')
    }

    // transactionId에서 월 키 제거하여 실제 문서 ID 추출
    const docId = transactionId.replace(`${monthKey}_`, '')

    // 날짜가 변경되었는지 확인
    const newDate = updates.date
      ? updates.date instanceof Date
        ? updates.date
        : timestampToDate(updates.date)
      : null

    const newMonthKey = newDate ? getMonthKey(newDate) : null

    if (newMonthKey && newMonthKey !== monthKey) {
      // 날짜가 변경되어 다른 월로 이동해야 함
      // 1. 기존 문서 읽기
      const oldRef = doc(db, 'ledgers', ledgerId, 'transactions', monthKey, 'items', docId)
      const oldSnap = await getDoc(oldRef)

      if (!oldSnap.exists()) {
        throw new Error('Transaction not found')
      }

      const oldData = oldSnap.data()

      // 2. 새 위치에 문서 생성
      const newTransactionsRef = collection(
        db,
        'ledgers',
        ledgerId,
        'transactions',
        newMonthKey,
        'items'
      )

      const newTransactionData: any = {
        ...oldData,
        ...updates,
        date: newDate,
        updatedBy: userId,
        updatedAt: serverTimestamp(),
      }

      // null로 변환할 필드들
      if (newTransactionData.paymentMethod1 === undefined) {
        delete newTransactionData.paymentMethod1
      } else if (
        newTransactionData.paymentMethod1 === null ||
        newTransactionData.paymentMethod1 === ''
      ) {
        newTransactionData.paymentMethod1 = null
      }

      if (newTransactionData.paymentMethod2 === undefined) {
        delete newTransactionData.paymentMethod2
      } else if (
        newTransactionData.paymentMethod2 === null ||
        newTransactionData.paymentMethod2 === ''
      ) {
        newTransactionData.paymentMethod2 = null
      }

      if (newTransactionData.memo === undefined) {
        delete newTransactionData.memo
      } else if (newTransactionData.memo === null || newTransactionData.memo === '') {
        newTransactionData.memo = null
      }

      // createdAt, createdBy는 유지 (기존 데이터에서 가져옴)
      // updatedAt은 새로 설정

      const newDocRef = await addDoc(newTransactionsRef, newTransactionData)

      // 3. 기존 문서 삭제
      await deleteDoc(oldRef)

      // 날짜 변경으로 인한 transactionId 변경은 호출자가 처리해야 함
      // 여기서는 void를 반환하므로 별도로 처리 필요
      console.warn(
        `Transaction date changed from ${monthKey} to ${newMonthKey}. New transactionId: ${newMonthKey}_${newDocRef.id}`
      )
    } else {
      // 같은 월 내에서 수정
      const transactionRef = doc(db, 'ledgers', ledgerId, 'transactions', monthKey, 'items', docId)

      const updateData: any = {
        ...updates,
        updatedBy: userId,
      }

      // date가 Date 객체면 그대로 사용, 아니면 변환
      if (updateData.date) {
        updateData.date =
          updateData.date instanceof Date ? updateData.date : timestampToDate(updateData.date)
      }

      // null로 변환할 필드들
      if (updateData.paymentMethod1 === undefined) {
        delete updateData.paymentMethod1
      } else if (updateData.paymentMethod1 === null || updateData.paymentMethod1 === '') {
        updateData.paymentMethod1 = null
      }

      if (updateData.paymentMethod2 === undefined) {
        delete updateData.paymentMethod2
      } else if (updateData.paymentMethod2 === null || updateData.paymentMethod2 === '') {
        updateData.paymentMethod2 = null
      }

      if (updateData.memo === undefined) {
        delete updateData.memo
      } else if (updateData.memo === null || updateData.memo === '') {
        updateData.memo = null
      }

      // createdAt, createdBy는 수정하지 않음
      delete updateData.createdAt
      delete updateData.createdBy

      await updateDoc(transactionRef, updateData)
    }
  } catch (error) {
    console.error('거래내역 수정 실패:', error)
    throw error
  }
}

/**
 * 거래내역 삭제
 * transactionId 형식: {YYYY-MM}_{autoId}
 * 경로: ledgers/{ledgerId}/transactions/{YYYY-MM}/items/{autoId}
 */
export async function deleteTransactionById(
  ledgerId: string,
  transactionId: string
): Promise<void> {
  try {
    const monthKey = extractMonthKeyFromId(transactionId)
    if (!monthKey) {
      throw new Error('Invalid transactionId format')
    }

    // transactionId에서 월 키 제거하여 실제 문서 ID 추출
    const docId = transactionId.replace(`${monthKey}_`, '')
    // 6개 세그먼트: ledgers / {ledgerId} / transactions / {monthKey} / items / {docId}
    const transactionRef = doc(db, 'ledgers', ledgerId, 'transactions', monthKey, 'items', docId)
    await deleteDoc(transactionRef)
  } catch (error) {
    console.error('거래내역 삭제 실패:', error)
    throw error
  }
}
