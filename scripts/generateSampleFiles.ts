/**
 * 샘플 엑셀 파일 생성 스크립트
 * 실행: pnpm tsx scripts/generateSampleFiles.ts
 */

import * as XLSX from 'xlsx'
import { writeFileSync } from 'fs'
import { join } from 'path'

// 거래내역 샘플 데이터 (한글 컬럼명)
const transactionSampleKo = [
  {
    타입: 'expense',
    금액: 15000,
    날짜: '2024-12-01',
    대분류: '식비',
    소분류: '외식',
    결제수단: '신용카드',
    세부결제수단: '신한',
    내역: '점심 식사',
    메모: '회사 근처 식당',
  },
  {
    타입: 'expense',
    금액: 5000,
    날짜: '2024-12-02',
    대분류: '교통',
    소분류: '대중교통',
    결제수단: '체크카드',
    세부결제수단: '신한',
    내역: '지하철 요금',
    메모: '',
  },
  {
    타입: 'income',
    금액: 3000000,
    날짜: '2024-12-05',
    대분류: '급여소득',
    소분류: '월급',
    내역: '12월 급여',
    메모: '',
  },
  {
    타입: 'expense',
    금액: 120000,
    날짜: '2024-12-10',
    대분류: '주거/통신',
    소분류: '월세/관리비',
    결제수단: '계좌이체',
    세부결제수단: '은행 이체',
    내역: '월세',
    메모: '12월 월세',
  },
  {
    타입: 'expense',
    금액: 35000,
    날짜: '2024-12-15',
    대분류: '문화/여가',
    소분류: '영화/공연',
    결제수단: '간편결제',
    세부결제수단: '카카오페이',
    내역: '영화 관람',
    메모: '주말 영화',
  },
]

// 거래내역 샘플 데이터 (영문 컬럼명)
const transactionSampleEn = [
  {
    type: 'expense',
    amount: 15000,
    date: '2024-12-01',
    category1: '식비',
    category2: '외식',
    paymentMethod1: '신용카드',
    paymentMethod2: '신한',
    description: '점심 식사',
    memo: '회사 근처 식당',
  },
  {
    type: 'expense',
    amount: 5000,
    date: '2024-12-02',
    category1: '교통',
    category2: '대중교통',
    paymentMethod1: '체크카드',
    paymentMethod2: '신한',
    description: '지하철 요금',
    memo: '',
  },
  {
    type: 'income',
    amount: 3000000,
    date: '2024-12-05',
    category1: '급여소득',
    category2: '월급',
    description: '12월 급여',
    memo: '',
  },
  {
    type: 'expense',
    amount: 120000,
    date: '2024-12-10',
    category1: '주거/통신',
    category2: '월세/관리비',
    paymentMethod1: '계좌이체',
    paymentMethod2: '은행 이체',
    description: '월세',
    memo: '12월 월세',
  },
  {
    type: 'expense',
    amount: 35000,
    date: '2024-12-15',
    category1: '문화/여가',
    category2: '영화/공연',
    paymentMethod1: '간편결제',
    paymentMethod2: '카카오페이',
    description: '영화 관람',
    memo: '주말 영화',
  },
]

// 카테고리 샘플 데이터
const categorySample = [
  {
    타입: 'expense',
    대분류: '식비',
    소분류: '외식,배달,장보기,카페/디저트',
  },
  {
    타입: 'expense',
    대분류: '교통',
    소분류: '대중교통,택시,주유,통행료,주차',
  },
  {
    타입: 'expense',
    대분류: '주거/통신',
    소분류: '월세/관리비,인터넷,휴대폰,공과금',
  },
  {
    타입: 'expense',
    대분류: '생활',
    소분류: '생필품,의류,미용,의료',
  },
  {
    타입: 'expense',
    대분류: '문화/여가',
    소분류: '영화/공연,여행,취미,구독 서비스',
  },
  {
    타입: 'income',
    대분류: '급여소득',
    소분류: '월급,상여금,성과급,야근수당',
  },
  {
    타입: 'income',
    대분류: '사업소득',
    소분류: '프리랜서,부업,사업 매출',
  },
  {
    타입: 'payment',
    대분류: '현금',
    소분류: '현금',
  },
  {
    타입: 'payment',
    대분류: '신용카드',
    소분류: '신한,국민,하나,우리,삼성,현대,롯데,기타',
  },
  {
    타입: 'payment',
    대분류: '간편결제',
    소분류: '카카오페이,네이버페이,토스,페이코,기타',
  },
]

function createWorkbook(data: unknown[], sheetName: string) {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  return wb
}

function generateFiles() {
  const outputDir = join(process.cwd(), 'public', 'samples')

  // 거래내역 샘플 (한글 컬럼명)
  const transactionWbKo = createWorkbook(transactionSampleKo, '거래내역')
  XLSX.writeFile(transactionWbKo, join(outputDir, '거래내역_샘플_한글.xlsx'))

  // 거래내역 샘플 (영문 컬럼명)
  const transactionWbEn = createWorkbook(transactionSampleEn, 'Transactions')
  XLSX.writeFile(transactionWbEn, join(outputDir, '거래내역_샘플_영문.xlsx'))

  // 카테고리 샘플
  const categoryWb = createWorkbook(categorySample, '카테고리')
  XLSX.writeFile(categoryWb, join(outputDir, '카테고리_샘플.xlsx'))

  console.log('✅ 샘플 파일 생성 완료!')
  console.log(`📁 위치: ${outputDir}`)
  console.log('  - 거래내역_샘플_한글.xlsx')
  console.log('  - 거래내역_샘플_영문.xlsx')
  console.log('  - 카테고리_샘플.xlsx')
}

generateFiles()
