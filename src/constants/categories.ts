// 수입 카테고리 (2단계)
export const INCOME_CATEGORIES = {
  급여소득: ['월급', '상여금', '성과급', '야근수당'],
  사업소득: ['프리랜서', '부업', '사업 매출'],
  재산소득: ['이자', '배당', '임대료'],
  기타소득: ['용돈', '선물', '환급', '기타'],
} as const

// 지출 카테고리 (2단계)
export const EXPENSE_CATEGORIES = {
  식비: ['외식', '배달', '장보기', '카페/디저트'],
  교통: ['대중교통', '택시', '주유', '통행료', '주차'],
  '주거/통신': ['월세/관리비', '인터넷', '휴대폰', '공과금'],
  생활: ['생필품', '의류', '미용', '의료'],
  '문화/여가': ['영화/공연', '여행', '취미', '구독 서비스'],
  교육: ['학원', '도서', '강의'],
  경조사: ['결혼', '돌잔치', '장례'],
  기타: ['세금', '보험', '기타'],
} as const

// 결제수단 카테고리 (2단계)
export const PAYMENT_METHODS = {
  현금: ['현금'],
  체크카드: ['신한', '국민', '하나', '우리', '기타'],
  신용카드: ['신한', '국민', '하나', '우리', '삼성', '현대', '롯데', '기타'],
  계좌이체: ['은행 이체'],
  간편결제: ['카카오페이', '네이버페이', '토스', '페이코', '기타'],
} as const

// 자산 카테고리 (2단계)
export const ASSET_CATEGORIES = {
  현금성자산: ['현금', '입출금 계좌', '저축 예금', '청약 저축'],
  투자자산: ['주식', '펀드', '채권', '암호화폐', '부동산'],
  부채: ['신용카드', '대출', '할부', '기타 부채'],
} as const

// 카테고리 헬퍼 함수
export const getIncomeCategory1List = () => Object.keys(INCOME_CATEGORIES)
export const getIncomeCategory2List = (category1: string) =>
  INCOME_CATEGORIES[category1 as keyof typeof INCOME_CATEGORIES] || []

export const getExpenseCategory1List = () => Object.keys(EXPENSE_CATEGORIES)
export const getExpenseCategory2List = (category1: string) =>
  EXPENSE_CATEGORIES[category1 as keyof typeof EXPENSE_CATEGORIES] || []

export const getPaymentMethod1List = () => Object.keys(PAYMENT_METHODS)
export const getPaymentMethod2List = (method1: string) =>
  PAYMENT_METHODS[method1 as keyof typeof PAYMENT_METHODS] || []

export const getAssetCategory1List = () => Object.keys(ASSET_CATEGORIES)
export const getAssetCategory2List = (category1: string) =>
  ASSET_CATEGORIES[category1 as keyof typeof ASSET_CATEGORIES] || []
