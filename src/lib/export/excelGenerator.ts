/**
 * Excel 파일 생성 유틸리티
 */

import * as XLSX from 'xlsx'

/**
 * 데이터 배열을 Excel Blob으로 변환
 */
export function generateExcel(
  data: Record<string, unknown>[],
  headers: string[],
  sheetName: string
): Blob {
  // 헤더를 포함한 데이터 생성
  const worksheetData = data.map((row) => {
    const rowData: Record<string, unknown> = {}
    headers.forEach((header) => {
      rowData[header] = row[header] ?? ''
    })
    return rowData
  })

  // 워크시트 생성
  const ws = XLSX.utils.json_to_sheet(worksheetData, { header: headers })

  // 워크북 생성
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // ArrayBuffer로 변환 후 Blob으로 변환
  const arrayBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  return new Blob([arrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

/**
 * Excel 파일 다운로드
 */
export function downloadExcel(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
