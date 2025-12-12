/**
 * 결제수단과 세부사항 패턴 분석
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

// H62부터 데이터 읽기
const headerRowIndex = 60
const dataStartRowIndex = 61
const startCol = 7 // H
const endCol = 19 // T

const headers: string[] = []
for (let col = startCol; col <= endCol; col++) {
  const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col })
  const cell = sheet[cellAddress]
  const value = cell ? (cell.v !== undefined ? String(cell.v) : '') : ''
  headers.push(value)
}

console.log('=== 결제수단과 세부사항 패턴 분석 ===\n')

const patterns: Array<{
  paymentMethod: string
  detail: string
  foundCard?: string
  shouldUpdate: boolean
  suggestedPaymentMethod?: string
}> = []

// 카드사 패턴
const cardPatterns = [
  '현대카드',
  '국민카드',
  '신한카드',
  '하나카드',
  '기업카드',
  '우리카드',
  '삼성카드',
  '롯데카드',
  '현대',
  '국민',
  '신한',
  '하나',
  '기업',
  '우리',
  '삼성',
  '롯데',
]

for (let row = dataStartRowIndex; row < dataStartRowIndex + 30; row++) {
  const paymentMethodCell = sheet[XLSX.utils.encode_cell({ r: row, c: 11 })] // L열 (결제수단)
  const detailCell = sheet[XLSX.utils.encode_cell({ r: row, c: 13 })] // N열 (세부사항)

  if (paymentMethodCell && detailCell) {
    const pm = String(paymentMethodCell.v || '').trim()
    const dt = String(detailCell.v || '').trim()

    if (pm && dt) {
      // 세부사항에서 카드사 찾기
      const foundCard = cardPatterns.find((card) => dt.includes(card))

      if (foundCard) {
        // 이모지 추출 (🍪 또는 🐻)
        const emoji = pm.match(/^[🍪🐻]/)?.[0] || ''

        // 카드사 이름 정규화
        let normalizedCard = foundCard
        if (foundCard === '현대') normalizedCard = '현대카드'
        if (foundCard === '국민') normalizedCard = '국민카드'
        if (foundCard === '신한') normalizedCard = '신한카드'
        if (foundCard === '하나') normalizedCard = '하나카드'
        if (foundCard === '기업') normalizedCard = '기업카드'
        if (foundCard === '우리') normalizedCard = '우리카드'
        if (foundCard === '삼성') normalizedCard = '삼성카드'
        if (foundCard === '롯데') normalizedCard = '롯데카드'

        const suggestedPaymentMethod = emoji ? `${emoji}${normalizedCard}` : normalizedCard
        const shouldUpdate = !pm.includes(normalizedCard)

        patterns.push({
          paymentMethod: pm,
          detail: dt,
          foundCard: normalizedCard,
          shouldUpdate,
          suggestedPaymentMethod,
        })
      }
    }
  }
}

console.log(`총 ${patterns.length}개 패턴 발견\n`)

// 업데이트 필요한 경우만 표시
const needsUpdate = patterns.filter((p) => p.shouldUpdate)
console.log(`업데이트 필요한 경우: ${needsUpdate.length}개\n`)

needsUpdate.slice(0, 10).forEach((p, i) => {
  console.log(`[${i + 1}]`)
  console.log(`  현재 결제수단: ${p.paymentMethod}`)
  console.log(`  세부사항: ${p.detail}`)
  console.log(`  발견된 카드: ${p.foundCard}`)
  console.log(`  제안된 결제수단: ${p.suggestedPaymentMethod}`)
  console.log('')
})

// 통계
const updateCount = needsUpdate.length
const totalCount = patterns.length
console.log(`\n=== 통계 ===`)
console.log(`전체 패턴: ${totalCount}개`)
console.log(`업데이트 필요: ${updateCount}개 (${((updateCount / totalCount) * 100).toFixed(1)}%)`)
