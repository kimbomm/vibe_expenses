/**
 * 날짜 관련 유틸리티 함수
 */

/**
 * 날짜를 YYYY-MM 형식의 월 키로 변환
 */
export function getMonthKey(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return `${year}-${String(month).padStart(2, '0')}`
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 날짜 범위를 월 키 배열로 변환
 */
export function generateMonthKeys(
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number
): string[] {
  const monthKeys: string[] = []
  const start = new Date(startYear, startMonth - 1, 1)
  const end = new Date(endYear, endMonth - 1, 1)

  let current = new Date(start)
  while (current <= end) {
    const year = current.getFullYear()
    const month = current.getMonth() + 1
    monthKeys.push(`${year}-${String(month).padStart(2, '0')}`)

    // 다음 달로 이동
    current.setMonth(current.getMonth() + 1)
  }

  return monthKeys
}

/**
 * Transaction 배열에서 날짜 범위 추출
 */
export function getDateRangeFromTransactions(
  transactions: Array<{ date: Date }>
): { start: Date; end: Date } | null {
  if (transactions.length === 0) return null

  const dates = transactions.map((t) => t.date)
  return {
    start: new Date(Math.min(...dates.map((d) => d.getTime()))),
    end: new Date(Math.max(...dates.map((d) => d.getTime()))),
  }
}
