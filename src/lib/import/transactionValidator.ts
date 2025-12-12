/**
 * 거래내역 검증 로직
 */

import { parseDate } from './dateParser'
import type { TransactionType } from '@/types/transaction'
import type { LedgerCategories } from '@/types/category'

export interface ImportRow {
  type?: unknown
  amount?: unknown
  date?: unknown
  category1?: unknown
  category2?: unknown
  paymentMethod1?: unknown
  paymentMethod2?: unknown
  description?: unknown
  memo?: unknown
}

export interface ValidationError {
  row: number // 0-based index (Excel 행 번호는 +2, 헤더 제외)
  field: string
  message: string
}

export interface ValidatedTransaction {
  type: TransactionType
  amount: number
  date: Date
  category1: string
  category2: string
  paymentMethod1?: string
  paymentMethod2?: string
  description: string
  memo?: string
}

/**
 * 타입 문자열을 TransactionType으로 변환
 */
function normalizeType(type: unknown): TransactionType | null {
  if (typeof type !== 'string') return null

  const normalized = type.trim().toLowerCase()
  if (normalized === 'income' || normalized === '수입') return 'income'
  if (normalized === 'expense' || normalized === '지출') return 'expense'
  return null
}

/**
 * 카테고리가 존재하는지 확인
 */
function validateCategory(
  category1: string,
  category2: string,
  type: TransactionType,
  categories: LedgerCategories
): boolean {
  const categoryMap = type === 'income' ? categories.income : categories.expense
  const category1List = categoryMap[category1]
  return category1List ? category1List.includes(category2) : false
}

/**
 * 결제수단이 존재하는지 확인
 */
function validatePaymentMethod(
  paymentMethod1: string,
  paymentMethod2: string,
  categories: LedgerCategories
): boolean {
  const paymentMap = categories.payment
  const paymentMethod1List = paymentMap[paymentMethod1]
  return paymentMethod1List ? paymentMethod1List.includes(paymentMethod2) : false
}

/**
 * 거래내역 행 검증
 */
export function validateTransactionRow(
  row: ImportRow,
  rowIndex: number,
  categories: LedgerCategories,
  options?: { skipCategoryValidation?: boolean }
): {
  valid: boolean
  errors: ValidationError[]
  transaction?: ValidatedTransaction
} {
  const skipCategoryValidation = options?.skipCategoryValidation ?? false
  const errors: ValidationError[] = []

  // 디버깅: 마이그레이션 모드 확인
  if (skipCategoryValidation) {
    console.log('[Migration Mode] 카테고리/결제수단 검증 건너뛰기')
  }

  // 타입 검증
  const type = normalizeType(row.type)
  if (!type) {
    errors.push({
      row: rowIndex,
      field: 'type',
      message: '타입은 "income"/"expense" 또는 "수입"/"지출"이어야 합니다.',
    })
  }

  // 금액 검증
  let amount: number | null = null
  if (row.amount === undefined || row.amount === null || row.amount === '') {
    errors.push({
      row: rowIndex,
      field: 'amount',
      message: '금액은 필수입니다.',
    })
  } else {
    const amountNum = typeof row.amount === 'number' ? row.amount : Number(row.amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      errors.push({
        row: rowIndex,
        field: 'amount',
        message: '금액은 양수여야 합니다.',
      })
    } else {
      amount = amountNum
    }
  }

  // 날짜 검증
  let date: Date | null = null
  if (row.date === undefined || row.date === null || row.date === '') {
    errors.push({
      row: rowIndex,
      field: 'date',
      message: '날짜는 필수입니다.',
    })
  } else {
    const parsedDate = parseDate(row.date)
    if (!parsedDate) {
      errors.push({
        row: rowIndex,
        field: 'date',
        message: '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD, YYYY/MM/DD 등)',
      })
    } else {
      date = parsedDate
    }
  }

  // 대분류 검증
  const category1 = typeof row.category1 === 'string' ? row.category1.trim() : ''
  if (!category1) {
    errors.push({
      row: rowIndex,
      field: 'category1',
      message: '대분류는 필수입니다.',
    })
  }

  // 소분류 검증
  const category2 = typeof row.category2 === 'string' ? row.category2.trim() : ''
  if (!category2) {
    errors.push({
      row: rowIndex,
      field: 'category2',
      message: '소분류는 필수입니다.',
    })
  }

  // 카테고리 존재 여부 확인 (마이그레이션 모드에서는 건너뛰기)
  if (!skipCategoryValidation && type && category1 && category2) {
    if (!validateCategory(category1, category2, type, categories)) {
      errors.push({
        row: rowIndex,
        field: 'category',
        message: `"${category1} > ${category2}" 카테고리가 존재하지 않습니다.`,
      })
    }
  }

  // 내역 검증
  const description = typeof row.description === 'string' ? row.description.trim() : ''
  if (!description) {
    errors.push({
      row: rowIndex,
      field: 'description',
      message: '내역은 필수입니다.',
    })
  }

  // 결제수단 검증 (지출일 때만, 마이그레이션 모드에서는 건너뛰기)
  let paymentMethod1: string | undefined
  let paymentMethod2: string | undefined
  if (type === 'expense') {
    if (row.paymentMethod1) {
      paymentMethod1 = typeof row.paymentMethod1 === 'string' ? row.paymentMethod1.trim() : ''
      if (paymentMethod1) {
        if (row.paymentMethod2) {
          paymentMethod2 = typeof row.paymentMethod2 === 'string' ? row.paymentMethod2.trim() : ''
          if (paymentMethod2) {
            if (
              !skipCategoryValidation &&
              !validatePaymentMethod(paymentMethod1, paymentMethod2, categories)
            ) {
              errors.push({
                row: rowIndex,
                field: 'paymentMethod',
                message: `"${paymentMethod1} > ${paymentMethod2}" 결제수단이 존재하지 않습니다.`,
              })
            }
          }
        }
      }
    }
  }

  // 메모 (선택)
  const memo = typeof row.memo === 'string' ? row.memo.trim() : undefined

  // 에러가 있으면 실패
  if (errors.length > 0 || !type || !amount || !date || !category1 || !category2 || !description) {
    return { valid: false, errors }
  }

  // 검증 통과
  return {
    valid: true,
    errors: [],
    transaction: {
      type,
      amount,
      date,
      category1,
      category2,
      paymentMethod1,
      paymentMethod2,
      description,
      memo,
    },
  }
}

/**
 * 여러 행 검증
 */
export function validateTransactionRows(
  rows: ImportRow[],
  categories: LedgerCategories,
  options?: { skipCategoryValidation?: boolean }
): {
  valid: ValidatedTransaction[]
  invalid: Array<{ row: number; errors: ValidationError[] }>
} {
  const valid: ValidatedTransaction[] = []
  const invalid: Array<{ row: number; errors: ValidationError[] }> = []

  rows.forEach((row, index) => {
    const result = validateTransactionRow(row, index, categories, options)
    if (result.valid && result.transaction) {
      valid.push(result.transaction)
    } else {
      invalid.push({
        row: index + 2, // Excel 행 번호 (헤더 제외, 1-based)
        errors: result.errors,
      })
    }
  })

  return { valid, invalid }
}
