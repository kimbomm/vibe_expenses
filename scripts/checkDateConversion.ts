/**
 * Excel 날짜 변환 확인 스크립트
 */

import XLSX from 'xlsx'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const filePath = path.join(__dirname, '..', 'public', '🍪💛🐻 가계부-2025.xlsx')

const workbook = XLSX.readFile(filePath)
const sheet = workbook.Sheets['11월']

console.log('=== 11월 시트 날짜 변환 확인 ===\n')

// H62부터 몇 개 행의 날짜 확인
for (let row = 61; row < 66; row++) {
  const cellAddress = XLSX.utils.encode_cell({ r: row, c: 7 }) // H열
  const cell = sheet[cellAddress]
  if (cell) {
    const value = cell.v
    const w = cell.w // Excel의 포맷된 값
    console.log(`행 ${row + 1} (H${row + 1}):`)
    console.log(`  원본 값: ${value}`)
    console.log(`  포맷된 값: ${w}`)

    // Excel 날짜로 변환 시도
    if (typeof value === 'number') {
      // 방법 1: 1899-12-30 기준 (현재 사용 중)
      const excelEpoch1 = new Date(1899, 11, 30) // 1899-12-30
      const date1 = new Date(excelEpoch1.getTime() + (value - 1) * 24 * 60 * 60 * 1000)
      console.log(`  변환1 (1899-12-30 기준, -1): ${date1.toISOString().split('T')[0]}`)

      // 방법 2: 1900-01-01 기준, -2 (Excel의 1900년 윤년 버그 보정)
      const excelEpoch2 = new Date(1900, 0, 1)
      const date2 = new Date(excelEpoch2.getTime() + (value - 2) * 24 * 60 * 60 * 1000)
      console.log(`  변환2 (1900-01-01 기준, -2): ${date2.toISOString().split('T')[0]}`)

      // 방법 3: XLSX 라이브러리의 날짜 변환
      try {
        const dateCode = XLSX.SSF.parse_date_code(value)
        if (dateCode) {
          console.log(
            `  XLSX 변환: ${dateCode.y}-${String(dateCode.m).padStart(2, '0')}-${String(dateCode.d).padStart(2, '0')}`
          )
        }
      } catch (e) {
        // ignore
      }

      // 방법 4: Excel의 실제 계산 (1900년을 윤년으로 잘못 계산)
      // Excel은 1900-01-01을 serial 1로 시작하지만, 1900년을 윤년으로 잘못 계산함
      // 따라서 실제로는 1899-12-30이 serial 0
      const excelEpoch3 = new Date(1899, 11, 30) // 1899-12-30
      const date3 = new Date(excelEpoch3.getTime() + value * 24 * 60 * 60 * 1000)
      console.log(`  변환3 (1899-12-30 기준, -0): ${date3.toISOString().split('T')[0]}`)
    }
    console.log('')
  }
}

// 11월 1일이어야 하는 날짜 확인
console.log('\n=== 11월 1일 변환 테스트 ===\n')
const nov1 = new Date(2025, 10, 1) // 2025-11-01
const excelEpoch = new Date(1899, 11, 30)
const daysDiff = Math.floor((nov1.getTime() - excelEpoch.getTime()) / (24 * 60 * 60 * 1000))
console.log(`2025-11-01의 Excel serial number: ${daysDiff}`)
console.log(`Excel serial ${daysDiff}를 변환하면:`)

const testDate1 = new Date(excelEpoch.getTime() + (daysDiff - 1) * 24 * 60 * 60 * 1000)
console.log(`  방법1 (-1): ${testDate1.toISOString().split('T')[0]}`)

const testDate2 = new Date(excelEpoch.getTime() + daysDiff * 24 * 60 * 60 * 1000)
console.log(`  방법2 (-0): ${testDate2.toISOString().split('T')[0]}`)
