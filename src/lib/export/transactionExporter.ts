/**
 * 거래내역 내보내기 로직
 */

import type { Transaction } from '@/types/transaction'
import {
  generateMonthKeys,
  getDateRangeFromTransactions,
  formatDateToYYYYMMDD,
  getMonthKey,
} from './dateUtils'
import { getTransactionMonthKeys } from '@/lib/firebase/transactions'
import { getTransactionsByLedgerAndMonths } from '@/lib/firebase/transactions'
import { decryptTransactions } from '@/lib/crypto/transactionCrypto'
import { useTransactionStore } from '@/stores/transactionStore'
import { useLedgerStore } from '@/stores/ledgerStore'

export type DateFilterType = 'all' | 'month' | 'year' | 'custom'

export interface DateFilterState {
  type: DateFilterType
  // 1달 단위
  selectedYear?: number
  selectedMonth?: number
  // 1년 단위
  selectedYearOnly?: number
  // 커스텀
  startYear?: number
  startMonth?: number
  endYear?: number
  endMonth?: number
}

/**
 * 필터에 따른 거래내역 조회
 */
export async function getTransactionsForExport(
  ledgerId: string,
  filter: DateFilterState,
  onProgress?: (current: number, total: number) => void
): Promise<Transaction[]> {
  let monthKeys: string[] = []

  switch (filter.type) {
    case 'all': {
      // 모든 월 조회
      // 먼저 Firestore에서 월 목록 조회 시도
      try {
        monthKeys = await getTransactionMonthKeys(ledgerId)
        console.log('전체 필터 - Firestore에서 조회된 월 목록:', monthKeys)
      } catch (error) {
        console.warn('전체 필터 - Firestore 월 목록 조회 실패, Store에서 추출 시도:', error)
      }

      // 만약 빈 배열이면, Store에서 이미 로드된 데이터에서 월 목록 추출
      if (monthKeys.length === 0) {
        const storeTransactions = useTransactionStore.getState().transactions[ledgerId] || []
        if (storeTransactions.length > 0) {
          const monthSet = new Set<string>()
          storeTransactions.forEach((t) => {
            monthSet.add(getMonthKey(t.date))
          })
          monthKeys = Array.from(monthSet).sort()
          console.log('전체 필터 - Store에서 추출된 월 목록:', monthKeys)
        } else {
          console.warn('전체 필터 - 월 목록을 찾을 수 없습니다. Store에 데이터가 없습니다.')
        }
      }
      break
    }

    case 'month': {
      // 특정 월
      if (!filter.selectedYear || !filter.selectedMonth) {
        throw new Error('년도와 월을 선택해주세요.')
      }
      monthKeys = [`${filter.selectedYear}-${String(filter.selectedMonth).padStart(2, '0')}`]
      break
    }

    case 'year': {
      // 특정 년도의 모든 월
      if (!filter.selectedYearOnly) {
        throw new Error('년도를 선택해주세요.')
      }
      monthKeys = generateMonthKeys(filter.selectedYearOnly, 1, filter.selectedYearOnly, 12)
      break
    }

    case 'custom': {
      // 시작 ~ 종료 범위
      if (!filter.startYear || !filter.startMonth || !filter.endYear || !filter.endMonth) {
        throw new Error('시작일과 종료일을 선택해주세요.')
      }

      // 유효성 검사
      const startDate = new Date(filter.startYear, filter.startMonth - 1, 1)
      const endDate = new Date(filter.endYear, filter.endMonth - 1, 1)
      if (startDate > endDate) {
        throw new Error('시작일은 종료일보다 빨라야 합니다.')
      }

      monthKeys = generateMonthKeys(
        filter.startYear,
        filter.startMonth,
        filter.endYear,
        filter.endMonth
      )
      break
    }
  }

  // 진행 상황 표시
  if (monthKeys.length === 0) {
    // 데이터가 없어도 빈 배열 반환 (빈 파일 생성)
    onProgress?.(0, 0)
    return []
  }

  onProgress?.(0, monthKeys.length)

  // 여러 월 조회
  let transactions = await getTransactionsByLedgerAndMonths(ledgerId, monthKeys)
  console.log('조회된 거래내역 개수:', transactions.length)

  // 복호화
  const ledger = useLedgerStore.getState().ledgers.find((l) => l.id === ledgerId)
  if (ledger?.encryptionKey) {
    transactions = await decryptTransactions(transactions, ledger.encryptionKey)
    console.log('복호화 후 거래내역 개수:', transactions.length)
  }

  onProgress?.(monthKeys.length, monthKeys.length)

  return transactions
}

/**
 * 헤더 목록 가져오기
 */
export function getExportHeaders(useEnglishHeaders: boolean = false): string[] {
  return useEnglishHeaders
    ? [
        'date',
        'type',
        'amount',
        'category1',
        'category2',
        'paymentMethod1',
        'paymentMethod2',
        'description',
        'memo',
        'createdAt',
        'updatedAt',
      ]
    : [
        '날짜',
        '타입',
        '금액',
        '대분류',
        '소분류',
        '결제수단',
        '세부결제수단',
        '내역',
        '메모',
        '생성일시',
        '수정일시',
      ]
}

/**
 * 거래내역을 Excel 형식으로 변환
 */
export function formatTransactionForExport(
  transaction: Transaction,
  useEnglishHeaders: boolean = false
): Record<string, unknown> {
  const headers = useEnglishHeaders
    ? {
        date: 'date',
        type: 'type',
        amount: 'amount',
        category1: 'category1',
        category2: 'category2',
        paymentMethod1: 'paymentMethod1',
        paymentMethod2: 'paymentMethod2',
        description: 'description',
        memo: 'memo',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      }
    : {
        date: '날짜',
        type: '타입',
        amount: '금액',
        category1: '대분류',
        category2: '소분류',
        paymentMethod1: '결제수단',
        paymentMethod2: '세부결제수단',
        description: '내역',
        memo: '메모',
        createdAt: '생성일시',
        updatedAt: '수정일시',
      }

  return {
    [headers.date]: formatDateToYYYYMMDD(transaction.date),
    [headers.type]: transaction.type === 'income' ? '수입' : '지출',
    [headers.amount]: transaction.amount,
    [headers.category1]: transaction.category1,
    [headers.category2]: transaction.category2,
    [headers.paymentMethod1]: transaction.paymentMethod1 || '',
    [headers.paymentMethod2]: transaction.paymentMethod2 || '',
    [headers.description]: transaction.description,
    [headers.memo]: transaction.memo || '',
    [headers.createdAt]: transaction.createdAt ? formatDateToYYYYMMDD(transaction.createdAt) : '',
    [headers.updatedAt]: transaction.updatedBy ? formatDateToYYYYMMDD(new Date()) : '',
  }
}

/**
 * 파일명 생성
 */
export function generateExportFilename(filter: DateFilterState, format: 'xlsx' = 'xlsx'): string {
  const extension = 'xlsx'
  const now = new Date()
  const defaultYear = now.getFullYear()
  const defaultMonth = now.getMonth() + 1

  let datePart = ''

  switch (filter.type) {
    case 'all':
      datePart = '전체'
      break
    case 'month':
      datePart = `${filter.selectedYear || defaultYear}-${String(
        filter.selectedMonth || defaultMonth
      ).padStart(2, '0')}`
      break
    case 'year':
      datePart = `${filter.selectedYearOnly || defaultYear}`
      break
    case 'custom':
      if (filter.startYear && filter.startMonth && filter.endYear && filter.endMonth) {
        datePart = `${filter.startYear}-${String(filter.startMonth).padStart(
          2,
          '0'
        )}_${filter.endYear}-${String(filter.endMonth).padStart(2, '0')}`
      } else {
        datePart = '커스텀'
      }
      break
  }

  return `거래내역_${datePart}.${extension}`
}
