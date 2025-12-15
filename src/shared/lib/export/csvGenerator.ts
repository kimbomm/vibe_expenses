/**
 * CSV 파일 생성 유틸리티
 */

/**
 * CSV 이스케이프 처리
 */
function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return ''

  const str = String(value)

  // 쉼표, 따옴표, 줄바꿈이 포함된 경우 따옴표로 감싸기
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * 데이터 배열을 CSV 문자열로 변환
 */
export function generateCSV(data: Record<string, unknown>[], headers: string[]): string {
  if (data.length === 0) {
    return headers.join(',')
  }

  // 헤더 행
  const headerRow = headers.map(escapeCSV).join(',')

  // 데이터 행
  const dataRows = data.map((row) => headers.map((header) => escapeCSV(row[header])).join(','))

  return [headerRow, ...dataRows].join('\n')
}

/**
 * CSV 파일 다운로드
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }) // BOM 추가 (Excel 한글 깨짐 방지)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
