/**
 * 카테고리 검증 로직
 */

import type { CategoryType } from '@/types/category'

export interface ImportCategoryRow {
  type?: unknown
  category1?: unknown
  category2?: unknown
}

export interface ValidationError {
  row: number
  field: string
  message: string
}

export interface ValidatedCategory {
  type: CategoryType
  category1: string
  category2: string[]
}

const VALID_TYPES: CategoryType[] = ['income', 'expense', 'payment', 'asset']

/**
 * 타입 문자열을 CategoryType으로 변환
 */
function normalizeType(type: unknown): CategoryType | null {
  if (typeof type !== 'string') return null

  const normalized = type.trim().toLowerCase()
  if (VALID_TYPES.includes(normalized as CategoryType)) {
    return normalized as CategoryType
  }

  // 한글 타입 지원
  const typeMap: Record<string, CategoryType> = {
    수입: 'income',
    지출: 'expense',
    결제수단: 'payment',
    자산: 'asset',
  }

  return typeMap[normalized] || null
}

/**
 * 카테고리 행 검증
 */
export function validateCategoryRow(
  row: ImportCategoryRow,
  rowIndex: number
): {
  valid: boolean
  errors: ValidationError[]
  category?: ValidatedCategory
} {
  const errors: ValidationError[] = []

  // 타입 검증
  const type = normalizeType(row.type)
  if (!type) {
    errors.push({
      row: rowIndex,
      field: 'type',
      message:
        '타입은 "income", "expense", "payment", "asset" 또는 한글(수입, 지출, 결제수단, 자산)이어야 합니다.',
    })
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
  const category2Str = typeof row.category2 === 'string' ? row.category2.trim() : ''
  if (!category2Str) {
    errors.push({
      row: rowIndex,
      field: 'category2',
      message: '소분류는 필수입니다.',
    })
  }

  // 소분류를 배열로 변환 (쉼표로 구분)
  const category2 = category2Str
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  if (category2.length === 0 && category2Str) {
    errors.push({
      row: rowIndex,
      field: 'category2',
      message: '소분류가 올바르지 않습니다.',
    })
  }

  // 에러가 있으면 실패
  if (errors.length > 0 || !type || !category1 || category2.length === 0) {
    return { valid: false, errors }
  }

  // 검증 통과
  return {
    valid: true,
    errors: [],
    category: {
      type,
      category1,
      category2,
    },
  }
}

/**
 * 여러 행 검증
 */
export function validateCategoryRows(rows: ImportCategoryRow[]): {
  valid: ValidatedCategory[]
  invalid: Array<{ row: number; errors: ValidationError[] }>
} {
  const valid: ValidatedCategory[] = []
  const invalid: Array<{ row: number; errors: ValidationError[] }> = []

  rows.forEach((row, index) => {
    const result = validateCategoryRow(row, index)
    if (result.valid && result.category) {
      valid.push(result.category)
    } else {
      invalid.push({
        row: index + 2, // Excel 행 번호 (헤더 제외, 1-based)
        errors: result.errors,
      })
    }
  })

  return { valid, invalid }
}

/**
 * 검증된 카테고리를 CategoryMap으로 변환
 */
export function convertToCategoryMap(
  categories: ValidatedCategory[],
  type: CategoryType
): Record<string, string[]> {
  const map: Record<string, string[]> = {}

  categories
    .filter((c) => c.type === type)
    .forEach((category) => {
      map[category.category1] = category.category2
    })

  return map
}
