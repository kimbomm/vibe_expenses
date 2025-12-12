/**
 * 날짜 변환 테스트
 */

import XLSX from 'xlsx'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const filePath = path.join(__dirname, '..', 'public', '🍪💛🐻 가계부-2025.xlsx')

function excelSerialToDate(serial: number): Date {
  // XLSX 라이브러리의 날짜 변환 함수 사용
  try {
    const dateCode = XLSX.SSF.parse_date_code(serial)
    if (dateCode && dateCode.y && dateCode.m && dateCode.d) {
      const date = new Date(dateCode.y, dateCode.m - 1, dateCode.d)
      return date
    }
  } catch (e) {
    // fallback
  }

  // Fallback
  const excelEpoch = new Date(1899, 11, 30)
  const date = new Date(excelEpoch.getTime() + (serial - 1) * 24 * 60 * 60 * 1000)
  return date
}

const workbook = XLSX.readFile(filePath)
const sheet = workbook.Sheets['11월']

console.log('=== 날짜 변환 테스트 ===\n')

// H62 행 확인
const cellH62 = sheet['H62']
if (cellH62 && typeof cellH62.v === 'number') {
  const serial = cellH62.v
  console.log(`Excel serial: ${serial}`)
  console.log(`포맷된 값: ${cellH62.w}`)

  const dateCode = XLSX.SSF.parse_date_code(serial)
  console.log(`XLSX parse_date_code:`, dateCode)

  const converted = excelSerialToDate(serial)
  console.log(`변환된 날짜: ${converted.toISOString().split('T')[0]}`)
  console.log(`예상 날짜: 2025-11-01`)
  console.log(`일치 여부: ${converted.toISOString().split('T')[0] === '2025-11-01'}`)
}
