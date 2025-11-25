import { format as formatDate } from 'date-fns'
import { ko } from 'date-fns/locale'

// 숫자 포맷팅 (천단위 구분)
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value)
}

// 통화 포맷팅
export function formatCurrency(value: number, currency: string = 'KRW'): string {
  if (currency === 'KRW') {
    return `₩${formatNumber(value)}`
  }
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
  }).format(value)
}

// 날짜 포맷팅
export function formatDateString(date: Date, formatStr: string = 'yyyy-MM-dd'): string {
  return formatDate(date, formatStr, { locale: ko })
}

// 상대 시간 (예: "3일 전")
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return '방금 전'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}개월 전`
  return `${Math.floor(diffInSeconds / 31536000)}년 전`
}

// 퍼센트 포맷팅
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}
