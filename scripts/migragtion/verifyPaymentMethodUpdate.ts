/**
 * paymentMethod2 업데이트 검증
 */

import XLSX from 'xlsx'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const filePath = path.join(__dirname, '..', 'migrated_transactions_11월.xlsx')

const workbook = XLSX.readFile(filePath)
const sheet = workbook.Sheets['거래내역']

const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][]

console.log('=== paymentMethod2 업데이트 검증 ===\n')

// 세부사항에 카드사가 포함된 경우 확인
const cardPatterns = [
  '현대카드',
  '국민카드',
  '신한카드',
  '하나카드',
  '기업카드',
  '우리카드',
  '삼성카드',
  '롯데카드',
]

let updatedCount = 0
const examples: Array<{
  paymentMethod2: string
  description: string
  hasCard: boolean
}> = []

for (let i = 1; i < rows.length; i++) {
  const row = rows[i]
  const paymentMethod2 = String(row[6] || '') // 세부결제수단
  const description = String(row[7] || '') // 내역

  if (paymentMethod2 && description) {
    const hasCard = cardPatterns.some((card) => description.includes(card))
    if (hasCard) {
      const cardInPaymentMethod = cardPatterns.some((card) => paymentMethod2.includes(card))
      if (cardInPaymentMethod) {
        updatedCount++
        if (examples.length < 10) {
          examples.push({
            paymentMethod2,
            description,
            hasCard: cardInPaymentMethod,
          })
        }
      }
    }
  }
}

console.log(`업데이트된 결제수단: ${updatedCount}건\n`)

console.log('=== 업데이트 예시 (최대 10개) ===\n')
examples.forEach((ex, i) => {
  console.log(`[${i + 1}]`)
  console.log(`  결제수단: ${ex.paymentMethod2}`)
  console.log(`  내역: ${ex.description}`)
  console.log('')
})
