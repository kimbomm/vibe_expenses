/**
 * 마이그레이션 데이터 변환 예시
 */

import XLSX from 'xlsx'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const filePath = path.join(__dirname, '..', 'public', '🍪💛🐻 가계부-2025.xlsx')

// Excel serial number를 Date로 변환
function excelSerialToDate(serial: number): Date {
  // Excel epoch: 1900-01-01 (하지만 Excel은 1900년을 윤년으로 잘못 계산함)
  // 실제로는 1899-12-30부터 시작
  const excelEpoch = new Date(1899, 11, 30) // 1899-12-30
  const days = serial - 1 // Excel은 1부터 시작하므로 1을 빼야 함
  const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000)
  return date
}

// 이모지 제거 (사용하지 않음 - 이모지 유지)
function removeEmoji(text: string): string {
  return text.trim() // 이모지 제거하지 않고 그대로 유지
}

// 결제수단 파싱
// paymentMethod1: 체크카드 포함 → "체크카드", 전통시장 포함 → "전통시장", 이체 포함 → "현금", 나머지 → "신용카드"
// paymentMethod2: 결제수단 원본 (이모지 포함)
function parsePaymentMethod(paymentMethod: string): { method1?: string; method2?: string } {
  const cleaned = paymentMethod.trim()

  if (!cleaned) return {}

  // paymentMethod1 결정
  let method1: string | undefined
  if (cleaned.includes('체크카드')) {
    method1 = '체크카드'
  } else if (cleaned.includes('전통시장')) {
    method1 = '전통시장'
  } else if (cleaned.includes('이체')) {
    method1 = '현금'
  } else if (cleaned) {
    method1 = '신용카드'
  }

  // paymentMethod2는 원본 그대로 (이모지 포함)
  const method2 = cleaned

  return {
    method1,
    method2,
  }
}

// 카테고리 파싱
// category1: 대분류 (이모지 포함)
// category2: 소분류 (이모지 포함)
function parseCategory(
  category1: string,
  category2: string
): {
  category1: string
  category2: string
  type: 'income' | 'expense'
} {
  const cleanedCategory1 = category1.trim()
  const cleanedCategory2 = category2.trim()

  // 수입 카테고리 판단
  const incomeCategories = ['월급', '부수입', '수입']
  const isIncome = incomeCategories.some((cat) => cleanedCategory1.includes(cat))

  return {
    category1: cleanedCategory1,
    category2: cleanedCategory2,
    type: isIncome ? 'income' : 'expense',
  }
}

// 금액 파싱
function parseAmount(amount: string): number {
  // 콤마 제거하고 숫자로 변환
  const cleaned = amount.replace(/,/g, '').trim()
  return parseInt(cleaned, 10) || 0
}

console.log('=== 마이그레이션 데이터 변환 예시 ===\n')

try {
  const workbook = XLSX.readFile(filePath)
  const sheet = workbook.Sheets['11월']

  if (!sheet) {
    console.error('11월 시트를 찾을 수 없습니다.')
    process.exit(1)
  }

  // 첫 번째 거래내역 데이터 읽기 (H62)
  const headerRowIndex = 60 // H61
  const dataRowIndex = 61 // H62
  const startCol = 7 // H
  const endCol = 19 // T

  const headers: string[] = []
  for (let col = startCol; col <= endCol; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col })
    const cell = sheet[cellAddress]
    const value = cell ? (cell.v !== undefined ? String(cell.v) : '') : ''
    headers.push(value)
  }

  // 여러 거래내역 읽기 (비고가 있는 데이터 우선, 최대 5개)
  const transactions: Array<{
    raw: Record<string, string>
    converted: any
  }> = []

  const allTransactions: Array<{
    raw: Record<string, string>
    converted: any
    hasMemo: boolean
  }> = []

  // 먼저 모든 거래내역 수집 (최대 100개)
  for (let rowOffset = 0; rowOffset < 100; rowOffset++) {
    const currentRowIndex = dataRowIndex + rowOffset
    const rawData: Record<string, string> = {}

    for (let col = startCol; col <= endCol; col++) {
      const headerName = headers[col - startCol] || ''
      const cellAddress = XLSX.utils.encode_cell({ r: currentRowIndex, c: col })
      const cell = sheet[cellAddress]
      const value = cell ? (cell.v !== undefined ? String(cell.v) : '') : ''
      if (headerName && value) {
        rawData[headerName] = String(value)
      }
    }

    // 빈 행이면 중단
    if (Object.keys(rawData).length === 0) {
      break
    }

    // 변환
    const dateSerial = parseFloat(rawData['날짜'] || '0')
    if (!dateSerial) continue // 날짜가 없으면 건너뛰기

    const date = excelSerialToDate(dateSerial)
    const amount = parseAmount(rawData['금액'] || '0')
    if (!amount) continue // 금액이 없으면 건너뛰기

    const categoryInfo = parseCategory(rawData['대분류'] || '', rawData['소분류'] || '')
    const paymentInfo = parsePaymentMethod(rawData['결제수단'] || '')
    const description = rawData['세부사항'] || rawData['소분류'] || ''
    const memo = rawData['비고'] || '' // 비고 컬럼 → memo 필드 매핑

    // Vibe 앱 형식으로 변환
    const vibeTransaction = {
      type: categoryInfo.type,
      amount: amount,
      date: date.toISOString().split('T')[0], // YYYY-MM-DD
      category1: categoryInfo.category1,
      category2: categoryInfo.category2,
      paymentMethod1: categoryInfo.type === 'expense' ? paymentInfo.method1 : undefined,
      paymentMethod2: categoryInfo.type === 'expense' ? paymentInfo.method2 : undefined,
      description: description,
      memo: memo || undefined,
    }

    const hasMemo = !!memo

    allTransactions.push({
      raw: rawData,
      converted: vibeTransaction,
      hasMemo,
    })
  }

  // 비고가 있는 데이터를 우선적으로 선택, 없으면 일반 데이터
  const withMemo = allTransactions.filter((t) => t.hasMemo)
  const withoutMemo = allTransactions.filter((t) => !t.hasMemo)

  // 비고가 있는 데이터 최대 3개 + 일반 데이터로 총 5개
  transactions.push(...withMemo.slice(0, 3))
  transactions.push(...withoutMemo.slice(0, 5 - transactions.length))

  // 변환된 데이터만 출력
  console.log('=== 변환된 Vibe 앱 데이터 (5개) ===\n')
  transactions.forEach((transaction, index) => {
    console.log(`[${index + 1}]`)
    console.log(JSON.stringify(transaction.converted, null, 2))
    console.log('')
  })
} catch (error) {
  console.error('오류:', error)
  process.exit(1)
}
