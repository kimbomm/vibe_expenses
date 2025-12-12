/**
 * Excel 데이터 마이그레이션 스크립트
 * 11월 시트 테스트용
 */

import XLSX from 'xlsx'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import * as fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Excel serial number를 YYYY-MM-DD 문자열로 변환
function excelSerialToDateString(serial: number): string {
  // XLSX 라이브러리의 날짜 변환 함수 사용 (가장 정확함)
  try {
    const dateCode = XLSX.SSF.parse_date_code(serial)
    if (dateCode && dateCode.y && dateCode.m && dateCode.d) {
      // dateCode의 y, m, d를 직접 사용하여 문자열 생성 (시간대 문제 없음)
      const year = dateCode.y
      const month = String(dateCode.m).padStart(2, '0')
      const day = String(dateCode.d).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  } catch (e) {
    console.warn('XLSX 날짜 변환 실패, fallback 사용:', e)
  }

  // Fallback: Excel epoch는 1899-12-30 (serial 0)
  const excelEpoch = new Date(1899, 11, 30) // 1899-12-30
  const date = new Date(excelEpoch.getTime() + (serial - 1) * 24 * 60 * 60 * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// description에서 카드사 정보 추출
function extractCardFromDescription(description: string): string | null {
  const cardPatterns = [
    { pattern: '현대카드', card: '현대카드' },
    { pattern: '국민카드', card: '국민카드' },
    { pattern: '신한카드', card: '신한카드' },
    { pattern: '하나카드', card: '하나카드' },
    { pattern: '기업카드', card: '기업카드' },
    { pattern: '우리카드', card: '우리카드' },
    { pattern: '삼성카드', card: '삼성카드' },
    { pattern: '롯데카드', card: '롯데카드' },
    { pattern: /현대(?!카드)/, card: '현대카드' }, // "현대" 단독 (카드 제외)
    { pattern: /국민(?!카드)/, card: '국민카드' },
    { pattern: /신한(?!카드)/, card: '신한카드' },
    { pattern: /하나(?!카드)/, card: '하나카드' },
    { pattern: /기업(?!카드)/, card: '기업카드' },
    { pattern: /우리(?!카드)/, card: '우리카드' },
    { pattern: /삼성(?!카드)/, card: '삼성카드' },
    { pattern: /롯데(?!카드)/, card: '롯데카드' },
  ]

  for (const { pattern, card } of cardPatterns) {
    if (typeof pattern === 'string') {
      if (description.includes(pattern)) {
        return card
      }
    } else {
      // 정규식
      if (pattern.test(description)) {
        return card
      }
    }
  }

  return null
}

// 결제수단 파싱
function parsePaymentMethod(
  paymentMethod: string,
  description?: string
): { method1?: string; method2?: string } {
  const cleaned = paymentMethod.trim()

  if (!cleaned) return {}

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

  // description에서 카드사 정보 추출하여 paymentMethod2 업데이트
  let method2 = cleaned
  if (description) {
    const extractedCard = extractCardFromDescription(description)
    if (extractedCard) {
      // 이모지 추출 (🍪 또는 🐻) - 더 정확한 방법
      let emoji = ''
      if (cleaned.startsWith('🍪')) {
        emoji = '🍪'
      } else if (cleaned.startsWith('🐻')) {
        emoji = '🐻'
      }

      // paymentMethod2에 카드사가 포함되어 있지 않으면 업데이트
      if (!cleaned.includes(extractedCard)) {
        method2 = emoji ? `${emoji}${extractedCard}` : extractedCard
      } else {
        // 이미 카드사가 포함되어 있으면 이모지만 확인하여 유지
        method2 = cleaned
      }
    }
  }

  return {
    method1,
    method2,
  }
}

// 카테고리 파싱
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
  const cleaned = amount.replace(/,/g, '').trim()
  return parseInt(cleaned, 10) || 0
}

// 시트에서 거래내역 추출
function extractTransactions(sheet: XLSX.WorkSheet, sheetName: string) {
  const headerRowIndex = 60 // H61
  const dataStartRowIndex = 61 // H62
  const startCol = 7 // H
  const endCol = 19 // T

  // 헤더 읽기
  const headers: string[] = []
  for (let col = startCol; col <= endCol; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col })
    const cell = sheet[cellAddress]
    const value = cell ? (cell.v !== undefined ? String(cell.v) : '') : ''
    headers.push(value)
  }

  // 데이터 읽기
  const transactions: Array<{
    type: 'income' | 'expense'
    amount: number
    date: string
    category1: string
    category2: string
    paymentMethod1?: string
    paymentMethod2?: string
    description: string
    memo?: string
  }> = []

  let emptyRowCount = 0
  const maxRows = 200

  for (let rowIdx = dataStartRowIndex; rowIdx < dataStartRowIndex + maxRows; rowIdx++) {
    const rawData: Record<string, string> = {}

    for (let col = startCol; col <= endCol; col++) {
      const headerName = headers[col - startCol] || ''
      const cellAddress = XLSX.utils.encode_cell({ r: rowIdx, c: col })
      const cell = sheet[cellAddress]
      const value = cell ? (cell.v !== undefined ? String(cell.v) : '') : ''
      if (headerName && value) {
        rawData[headerName] = String(value)
      }
    }

    // 빈 행 체크
    if (Object.keys(rawData).length === 0) {
      emptyRowCount++
      if (emptyRowCount >= 3) {
        break
      }
      continue
    }

    emptyRowCount = 0

    // 필수 필드 확인
    const dateSerial = parseFloat(rawData['날짜'] || '0')
    const amount = parseAmount(rawData['금액'] || '0')

    if (!dateSerial || !amount) {
      continue
    }

    // 변환
    const dateStr = excelSerialToDateString(dateSerial)
    const categoryInfo = parseCategory(rawData['대분류'] || '', rawData['소분류'] || '')
    const description = rawData['세부사항'] || rawData['소분류'] || ''
    const memo = rawData['비고'] || ''
    // description을 전달하여 paymentMethod2 업데이트
    const paymentInfo = parsePaymentMethod(rawData['결제수단'] || '', description)

    transactions.push({
      type: categoryInfo.type,
      amount: amount,
      date: dateStr,
      category1: categoryInfo.category1,
      category2: categoryInfo.category2,
      paymentMethod1: categoryInfo.type === 'expense' ? paymentInfo.method1 : undefined,
      paymentMethod2: categoryInfo.type === 'expense' ? paymentInfo.method2 : undefined,
      description: description,
      memo: memo || undefined,
    })
  }

  return transactions
}

// Excel 파일 생성
function createExcelFile(transactions: Array<any>, outputPath: string) {
  // 헤더 정의 (한글)
  const headers = [
    '타입',
    '금액',
    '날짜',
    '대분류',
    '소분류',
    '결제수단',
    '세부결제수단',
    '내역',
    '메모',
  ]

  // 데이터 변환
  const rows = transactions.map((t) => [
    t.type === 'income' ? '수입' : '지출',
    t.amount,
    t.date,
    t.category1,
    t.category2,
    t.paymentMethod1 || '',
    t.paymentMethod2 || '',
    t.description,
    t.memo || '',
  ])

  // 워크북 생성
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])

  // 컬럼 너비 설정
  worksheet['!cols'] = [
    { wch: 10 }, // 타입
    { wch: 15 }, // 금액
    { wch: 12 }, // 날짜
    { wch: 15 }, // 대분류
    { wch: 15 }, // 소분류
    { wch: 15 }, // 결제수단
    { wch: 20 }, // 세부결제수단
    { wch: 30 }, // 내역
    { wch: 20 }, // 메모
  ]

  XLSX.utils.book_append_sheet(workbook, worksheet, '거래내역')
  XLSX.writeFile(workbook, outputPath)
}

// 메인 실행
async function main() {
  // 명령줄 인자로 파일명과 월 목록 받기
  const args = process.argv.slice(2)
  const fileName = args[0] || '🍪💛🐻 가계부-2025.xlsx'
  const monthsArg = args[1] || ''

  const filePath = path.join(__dirname, '..', 'public', fileName)

  // 월 목록 결정
  let months: string[] = []
  if (monthsArg) {
    // 명령줄에서 월 목록 지정
    months = monthsArg.split(',').map((m) => m.trim())
  } else if (fileName.includes('2024')) {
    // 2024년 파일이면 5월~12월
    months = ['5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  } else {
    // 기본값: 1월~10월 (2025년)
    months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월']
  }

  console.log('=== Excel 데이터 마이그레이션 시작 ===\n')
  console.log(`원본 파일: ${filePath}`)
  console.log(`처리할 월: ${months.join(', ')}\n`)

  try {
    // Excel 파일 읽기
    const workbook = XLSX.readFile(filePath)

    // 연도 추출
    const year = fileName.includes('2024') ? '2024' : '2025'

    let totalTransactions = 0
    const results: Array<{
      month: string
      count: number
      income: number
      expense: number
      file: string
    }> = []

    // 각 월별로 처리
    for (const month of months) {
      const sheet = workbook.Sheets[month]

      if (!sheet) {
        console.warn(`⚠️  시트 "${month}"를 찾을 수 없습니다. 건너뜁니다.\n`)
        continue
      }

      console.log(`시트 "${month}" 처리 중...`)

      // 거래내역 추출
      const transactions = extractTransactions(sheet, month)

      if (transactions.length === 0) {
        console.log(`  데이터 없음, 건너뜁니다.\n`)
        continue
      }

      // 통계
      const incomeCount = transactions.filter((t) => t.type === 'income').length
      const expenseCount = transactions.filter((t) => t.type === 'expense').length
      const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      const totalExpense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      console.log(`  추출된 거래내역: ${transactions.length}건`)
      console.log(`  수입: ${incomeCount}건, 총 ${totalIncome.toLocaleString()}원`)
      console.log(`  지출: ${expenseCount}건, 총 ${totalExpense.toLocaleString()}원`)
      console.log(`  순 수입: ${(totalIncome - totalExpense).toLocaleString()}원`)

      // Excel 파일 생성 (연도 포함)
      const outputPath = path.join(__dirname, '..', `migrated_transactions_${year}_${month}.xlsx`)
      createExcelFile(transactions, outputPath)

      console.log(`  ✅ 파일 생성: migrated_transactions_${year}_${month}.xlsx\n`)

      totalTransactions += transactions.length
      results.push({
        month,
        count: transactions.length,
        income: totalIncome,
        expense: totalExpense,
        file: `migrated_transactions_${year}_${month}.xlsx`,
      })
    }

    // 전체 요약
    console.log('=== 마이그레이션 완료 ===\n')
    console.log(`총 처리된 시트: ${results.length}개`)
    console.log(`총 거래내역: ${totalTransactions}건\n`)

    console.log('생성된 파일:')
    results.forEach((r) => {
      console.log(`  - ${r.file} (${r.count}건)`)
    })

    console.log(`\n다음 단계:`)
    console.log(`1. 생성된 Excel 파일들을 확인하세요`)
    console.log(`2. Vibe 앱의 거래내역 Import 기능으로 각 파일을 업로드하세요`)
    console.log(`3. 카테고리가 일치하는지 확인하세요`)
  } catch (error) {
    console.error('오류 발생:', error)
    process.exit(1)
  }
}

main()
