/**
 * 월별 시트 상세 분석
 */

import XLSX from 'xlsx'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const filePath = path.join(__dirname, '..', 'public', '🍪💛🐻 가계부-2025.xlsx')

console.log('월별 시트 상세 분석 시작...\n')

try {
  const workbook = XLSX.readFile(filePath)

  // 11월 시트만 상세 분석
  const sheetName = '11월'
  const sheet = workbook.Sheets[sheetName]

  if (!sheet) {
    console.error(`시트 "${sheetName}"를 찾을 수 없습니다.`)
    process.exit(1)
  }

  // 원시 데이터로 읽기 (셀 좌표 포함)
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1')
  console.log(`시트 범위: ${sheet['!ref']}`)
  console.log(`총 행: ${range.e.r + 1}, 총 열: ${range.e.c + 1}\n`)

  // 처음 50행의 모든 셀 값 확인 (더 많은 행 확인)
  console.log('=== 처음 50행의 데이터 구조 ===\n')
  for (let row = 0; row < Math.min(50, range.e.r + 1); row++) {
    const rowData: string[] = []
    for (let col = 0; col <= Math.min(20, range.e.c); col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      const cell = sheet[cellAddress]
      const value = cell ? (cell.v !== undefined ? String(cell.v) : '') : ''
      if (value.trim() !== '') {
        rowData.push(`${XLSX.utils.encode_col(col)}: ${value}`)
      }
    }
    if (rowData.length > 0) {
      console.log(`행 ${row + 1}: ${rowData.join(', ')}`)
    }
  }

  // H61부터 T61까지가 헤더, H62부터 T62+n이 실제 거래 데이터
  console.log('\n=== 거래내역 데이터 영역 분석 (H61:T62+n) ===\n')

  // H = 7 (0-based), T = 19 (0-based)
  // 61행 = 60 (0-based), 62행 = 61 (0-based)
  const headerRowIndex = 60 // H61 = 행 61 = 0-based로 60
  const dataStartRowIndex = 61 // H62 = 행 62 = 0-based로 61
  const startCol = 7 // H = 7
  const endCol = 19 // T = 19

  // 헤더 행 읽기 (H61~T61 주변도 확인)
  console.log('=== 헤더 행 확인 (H60~H62) ===\n')
  for (let row = headerRowIndex - 1; row <= headerRowIndex + 1; row++) {
    const rowData: string[] = []
    for (let col = startCol; col <= endCol; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      const cell = sheet[cellAddress]
      const value = cell ? (cell.v !== undefined ? String(cell.v) : '') : ''
      if (value) rowData.push(`${XLSX.utils.encode_col(col)}: ${value}`)
    }
    if (rowData.length > 0) {
      console.log(`행 ${row + 1}: ${rowData.join(', ')}`)
    }
  }

  // 헤더 행 읽기
  console.log('\n=== 헤더 행 (H61:T61) ===\n')
  const headerRow: string[] = []
  for (let col = startCol; col <= endCol; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col })
    const cell = sheet[cellAddress]
    const value = cell ? (cell.v !== undefined ? String(cell.v) : '') : ''
    headerRow.push(value)
    console.log(`  ${XLSX.utils.encode_col(col)}${headerRowIndex + 1}: "${value}"`)
  }

  console.log(`\n헤더 컬럼명: ${headerRow.join(' | ')}\n`)

  // 데이터 행 읽기 (최대 50개 행)
  console.log('=== 거래 데이터 행 (H62:T62+n) ===\n')
  const allRows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: '',
  }) as unknown[][]

  const transactionRows: Array<Record<string, string>> = []
  let emptyRowCount = 0
  const maxRows = 100 // 최대 100개 행 확인

  for (
    let rowIdx = dataStartRowIndex;
    rowIdx < Math.min(dataStartRowIndex + maxRows, allRows.length);
    rowIdx++
  ) {
    const row = allRows[rowIdx]
    const rowData: Record<string, string> = {}
    let hasData = false

    // 직접 셀에서 읽기 (더 정확함)
    for (let colIdx = startCol; colIdx <= endCol; colIdx++) {
      const headerName = headerRow[colIdx - startCol] || `컬럼${colIdx}`
      const cellAddress = XLSX.utils.encode_cell({ r: rowIdx, c: colIdx })
      const cell = sheet[cellAddress]
      const cellValue = cell ? (cell.v !== undefined ? String(cell.v).trim() : '') : ''

      if (cellValue) {
        hasData = true
      }
      rowData[headerName] = cellValue
    }

    if (hasData) {
      transactionRows.push(rowData)
      emptyRowCount = 0
    } else {
      emptyRowCount++
      // 빈 행이 3개 연속이면 중단
      if (emptyRowCount >= 3) {
        console.log(`\n빈 행 3개 연속 발견. 데이터 읽기 중단 (행 ${rowIdx + 1})`)
        break
      }
    }
  }

  console.log(`총 거래 데이터 행: ${transactionRows.length}개\n`)

  // 처음 10개 행 상세 출력
  console.log('=== 거래 데이터 샘플 (최대 10개) ===\n')
  transactionRows.slice(0, 10).forEach((row, idx) => {
    console.log(`[${idx + 1}] 행 ${dataStartRowIndex + idx + 1}:`)
    Object.entries(row).forEach(([key, value]) => {
      if (value) {
        console.log(`  ${key}: "${value}"`)
      }
    })
    console.log('')
  })

  // 전체 데이터 통계
  console.log('\n=== 데이터 통계 ===\n')
  console.log(`총 거래 건수: ${transactionRows.length}개`)

  // 각 컬럼별 데이터 존재 여부 통계
  const columnStats: Record<string, { total: number; filled: number }> = {}
  headerRow.forEach((header) => {
    columnStats[header] = { total: transactionRows.length, filled: 0 }
  })

  transactionRows.forEach((row) => {
    Object.entries(row).forEach(([key, value]) => {
      if (value && columnStats[key]) {
        columnStats[key].filled++
      }
    })
  })

  console.log('\n컬럼별 데이터 채움률:')
  Object.entries(columnStats).forEach(([header, stats]) => {
    const percentage = ((stats.filled / stats.total) * 100).toFixed(1)
    console.log(`  ${header}: ${stats.filled}/${stats.total} (${percentage}%)`)
  })

  // 각 행을 분석하여 거래 데이터 패턴 찾기
  console.log('\n=== 거래 데이터 패턴 분석 ===\n')

  // 날짜 패턴 (다양한 형식 지원)
  const datePatterns = [
    /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/, // YYYY-MM-DD, YYYY/MM/DD
    /\d{1,2}[-\/]\d{1,2}/, // MM-DD, MM/DD
    /^\d{1,2}$/, // 단일 숫자 (일)
  ]

  // 금액 패턴
  const amountPattern = /[\d,]+|₩[\d,]+/

  // 실제 거래 데이터 후보 찾기
  const transactionCandidates: Array<{ row: number; data: unknown[] }> = []

  for (let i = 0; i < allRows.length; i++) {
    const row = allRows[i]
    const rowStr = row.map(String).join('|')
    const nonEmptyCells = row.filter((cell) => String(cell).trim() !== '')

    // 날짜나 금액이 포함된 행 찾기
    const hasDate = datePatterns.some((pattern) => pattern.test(rowStr))
    const hasAmount = amountPattern.test(rowStr)
    const hasDescription = nonEmptyCells.length >= 3 // 최소 3개 이상의 데이터

    if ((hasDate || hasAmount) && hasDescription && nonEmptyCells.length > 0) {
      transactionCandidates.push({ row: i + 1, data: nonEmptyCells })
    }
  }

  console.log(`총 거래 데이터 후보: ${transactionCandidates.length}개 행\n`)

  // 상세 분석: 처음 20개 후보 출력
  console.log('=== 거래 데이터 후보 상세 (최대 20개) ===\n')
  transactionCandidates.slice(0, 20).forEach((candidate, idx) => {
    console.log(`[${idx + 1}] 행 ${candidate.row}:`)
    candidate.data.forEach((cell, cellIdx) => {
      const cellStr = String(cell).trim()
      if (cellStr) {
        // 데이터 타입 추론
        let type = '텍스트'
        if (datePatterns.some((p) => p.test(cellStr))) type = '날짜'
        else if (amountPattern.test(cellStr)) type = '금액'
        else if (/^[🍪🐻]/.test(cellStr)) type = '결제수단/카테고리'

        console.log(`  컬럼 ${cellIdx + 1}: "${cellStr}" (${type})`)
      }
    })
    console.log('')
  })

  // 데이터 구조 패턴 분석
  console.log('\n=== 데이터 구조 패턴 분석 ===\n')
  if (transactionCandidates.length > 0) {
    const firstFew = transactionCandidates.slice(0, 10)
    const patterns = new Map<string, number>()

    firstFew.forEach((candidate) => {
      const pattern = candidate.data
        .map((cell) => {
          const cellStr = String(cell).trim()
          if (datePatterns.some((p) => p.test(cellStr))) return 'DATE'
          if (amountPattern.test(cellStr)) return 'AMOUNT'
          if (/^[🍪🐻]/.test(cellStr)) return 'CATEGORY'
          return 'TEXT'
        })
        .join(' -> ')

      patterns.set(pattern, (patterns.get(pattern) || 0) + 1)
    })

    console.log('발견된 패턴:')
    patterns.forEach((count, pattern) => {
      console.log(`  ${pattern} (${count}회)`)
    })
  }
} catch (error) {
  console.error('분석 실패:', error)
  process.exit(1)
}
