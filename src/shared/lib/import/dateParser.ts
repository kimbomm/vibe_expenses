/**
 * 날짜 파서
 * 여러 형식 지원 → YYYY-MM-DD로 통일
 */

/**
 * 날짜 형식 파싱
 * 지원 형식:
 * - YYYY-MM-DD
 * - YYYY/MM/DD
 * - DD/MM/YYYY
 * - MM/DD/YYYY
 * - YYYY.MM.DD
 * - DD.MM.YYYY
 * - MM.DD.YYYY
 */
export function parseDate(dateStr: string | number | Date): Date | null {
  if (dateStr instanceof Date) {
    return dateStr
  }

  if (typeof dateStr === 'number') {
    // Excel 날짜 숫자 형식 (1900-01-01 기준 일수)
    // 1900-01-01 = 1
    const excelEpoch = new Date(1899, 11, 30) // 1899-12-30
    const days = dateStr
    const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000)
    return isNaN(date.getTime()) ? null : date
  }

  const str = String(dateStr).trim()
  if (!str) return null

  // YYYY-MM-DD 형식
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    if (!isNaN(date.getTime())) return date
  }

  // YYYY/MM/DD 형식
  const slashMatch = str.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/)
  if (slashMatch) {
    const [, year, month, day] = slashMatch
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    if (!isNaN(date.getTime())) return date
  }

  // DD/MM/YYYY 형식
  const ddmmyyyyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    if (!isNaN(date.getTime())) return date
  }

  // MM/DD/YYYY 형식
  const mmddyyyyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (mmddyyyyMatch) {
    const [, month, day, year] = mmddyyyyMatch
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    if (!isNaN(date.getTime())) return date
  }

  // YYYY.MM.DD 형식
  const dotMatch = str.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})$/)
  if (dotMatch) {
    const [, year, month, day] = dotMatch
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    if (!isNaN(date.getTime())) return date
  }

  // DD.MM.YYYY 형식
  const ddmmyyyyDotMatch = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (ddmmyyyyDotMatch) {
    const [, day, month, year] = ddmmyyyyDotMatch
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    if (!isNaN(date.getTime())) return date
  }

  // MM.DD.YYYY 형식
  const mmddyyyyDotMatch = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (mmddyyyyDotMatch) {
    const [, month, day, year] = mmddyyyyDotMatch
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    if (!isNaN(date.getTime())) return date
  }

  // 기본 Date 파싱 시도
  const date = new Date(str)
  if (!isNaN(date.getTime())) return date

  return null
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
