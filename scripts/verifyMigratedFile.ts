/**
 * 마이그레이션된 Excel 파일 검증
 */

import XLSX from 'xlsx'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const filePath = path.join(__dirname, '..', 'migrated_transactions_11월.xlsx')

console.log('=== 마이그레이션된 파일 검증 ===\n')

const workbook = XLSX.readFile(filePath)
const sheet = workbook.Sheets['거래내역']

if (!sheet) {
  console.error('시트를 찾을 수 없습니다.')
  process.exit(1)
}

const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][]

console.log(`총 행 수: ${rows.length}\n`)

// 헤더 확인
console.log('헤더:', rows[0])
console.log('')

// 처음 10개 행의 날짜 확인
console.log('=== 처음 10개 행의 날짜 확인 ===\n')
for (let i = 1; i < Math.min(11, rows.length); i++) {
  const row = rows[i]
  const date = row[2] // 날짜 컬럼
  const type = row[0] // 타입
  const amount = row[1] // 금액
  const category1 = row[3] // 대분류
  const category2 = row[4] // 소분류
  const description = row[7] // 내역

  console.log(
    `[${i}] ${date} | ${type} | ${amount}원 | ${category1} > ${category2} | ${description}`
  )
}

// 날짜 범위 확인
console.log('\n=== 날짜 범위 확인 ===\n')
const dates = rows
  .slice(1)
  .map((row) => row[2] as string)
  .filter(Boolean)
const sortedDates = [...dates].sort()
console.log(`최초 날짜: ${sortedDates[0]}`)
console.log(`최종 날짜: ${sortedDates[sortedDates.length - 1]}`)

// 11월 데이터인지 확인
const novemberDates = dates.filter((d) => d.startsWith('2025-11'))
const otherDates = dates.filter((d) => !d.startsWith('2025-11'))
console.log(`\n11월 데이터: ${novemberDates.length}건`)
if (otherDates.length > 0) {
  console.log(`⚠️  다른 월 데이터: ${otherDates.length}건`)
  console.log('다른 월 날짜:', [...new Set(otherDates)].slice(0, 10))
}
