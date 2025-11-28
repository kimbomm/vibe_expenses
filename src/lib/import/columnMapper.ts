/**
 * 컬럼명 매핑 (한글 → 영문)
 * 데이터 업로드 시에는 영문 컬럼명만 사용하여 판단
 */

const COLUMN_MAP: Record<string, string> = {
  // 한글 → 영문
  타입: 'type',
  금액: 'amount',
  날짜: 'date',
  대분류: 'category1',
  소분류: 'category2',
  결제수단: 'paymentMethod1',
  세부결제수단: 'paymentMethod2',
  내역: 'description',
  메모: 'memo',
}

/**
 * 컬럼명을 영문으로 매핑
 */
export function mapColumnName(columnName: string): string {
  const trimmed = columnName.trim()
  // 한글 컬럼명이면 매핑, 아니면 소문자로 변환
  return COLUMN_MAP[trimmed] || trimmed.toLowerCase()
}

/**
 * 행 데이터의 컬럼명을 영문으로 매핑
 */
export function mapRowColumns<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  const mapped: Record<string, unknown> = {}
  Object.entries(row).forEach(([key, value]) => {
    const mappedKey = mapColumnName(key)
    mapped[mappedKey] = value
  })
  return mapped
}
