# 날짜 선택 필터 추가 시 영향 분석

## 요청 사항

거래내역 내보내기에 다음 날짜 필터 옵션 추가:

1. **전체** - 모든 거래내역
2. **1달 단위** - 특정 년도/월 선택 (기본값: 현재 월)
3. **1년 단위** - 특정 년도 선택 (기본값: 현재 년도)
4. **날짜 커스텀** - 시작 년도/월 ~ 끝 년도/월 선택

---

## 현재 시스템 구조

### 데이터 저장 구조

- 거래내역은 **월별 서브컬렉션**에 저장됨
- 경로: `ledgers/{ledgerId}/transactions/{YYYY-MM}/items/{autoId}`
- 예: `ledgers/abc123/transactions/2024-12/items/doc1`

### 현재 조회 방식

- `getTransactionsByLedgerAndMonth(ledgerId, year, month)`: 특정 월 조회
- `getTransactionsByLedgerAndMonths(ledgerId, monthKeys)`: 여러 월 조회
- `getTransactionsByLedger(ledgerId)`: 최근 12개월만 조회 (제한적)

---

## 기능 추가 시 필요한 변경사항

### 1. 데이터 범위 조회 기능 추가

**문제점:**

- "전체" 옵션을 위해서는 **모든 월의 목록**을 알아야 함
- 현재는 월별 서브컬렉션 구조라서 모든 월을 직접 조회하기 어려움

**해결 방안:**

#### 옵션 A: Firestore에서 월 목록 조회 (추천)

```typescript
// ledgers/{ledgerId}/transactions 서브컬렉션 목록 조회
async function getTransactionMonthKeys(ledgerId: string): Promise<string[]> {
  const transactionsRef = collection(db, 'ledgers', ledgerId, 'transactions')
  const snapshot = await getDocs(transactionsRef)
  return snapshot.docs.map((doc) => doc.id) // ['2024-01', '2024-02', ...]
}
```

**장점:**

- 정확한 월 목록 조회
- 실제 데이터가 있는 월만 조회

**단점:**

- Firestore 읽기 비용 발생
- 서브컬렉션 목록 조회는 비용이 높을 수 있음

#### 옵션 B: Ledger에 메타데이터 저장

```typescript
// Ledger 문서에 추가
interface Ledger {
  // ... 기존 필드
  firstTransactionDate?: Date // 첫 거래일
  lastTransactionDate?: Date // 마지막 거래일
}
```

**장점:**

- 빠른 조회 (1회 읽기)
- 비용 절감

**단점:**

- 거래 추가/삭제 시 메타데이터 업데이트 필요
- 기존 데이터 마이그레이션 필요

#### 옵션 C: Store에서 이미 로드된 데이터 활용

```typescript
// Store에 이미 로드된 transactions에서 날짜 범위 추출
function getDateRange(transactions: Transaction[]): { start: Date; end: Date } {
  if (transactions.length === 0) return { start: new Date(), end: new Date() }

  const dates = transactions.map((t) => t.date)
  return {
    start: new Date(Math.min(...dates.map((d) => d.getTime()))),
    end: new Date(Math.max(...dates.map((d) => d.getTime()))),
  }
}
```

**장점:**

- 추가 비용 없음
- 빠른 응답

**단점:**

- Store에 로드되지 않은 월은 포함되지 않음
- "전체" 옵션이 정확하지 않을 수 있음

**추천: 옵션 A + 옵션 C 조합**

- Store에 로드된 데이터로 기본 범위 표시
- "전체" 선택 시 Firestore에서 월 목록 조회

---

### 2. 월 키 생성 유틸리티

```typescript
// 날짜 범위를 월 키 배열로 변환
function generateMonthKeys(
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number
): string[] {
  const monthKeys: string[] = []
  const start = new Date(startYear, startMonth - 1, 1)
  const end = new Date(endYear, endMonth - 1, 1)

  let current = new Date(start)
  while (current <= end) {
    const year = current.getFullYear()
    const month = current.getMonth() + 1
    monthKeys.push(`${year}-${String(month).padStart(2, '0')}`)

    // 다음 달로 이동
    current.setMonth(current.getMonth() + 1)
  }

  return monthKeys
}

// 예시
generateMonthKeys(2024, 1, 2024, 12)
// ['2024-01', '2024-02', ..., '2024-12']

generateMonthKeys(2023, 6, 2024, 3)
// ['2023-06', '2023-07', ..., '2024-03']
```

---

### 3. UI 컴포넌트 구조

```typescript
// 날짜 필터 타입
type DateFilterType = 'all' | 'month' | 'year' | 'custom'

interface DateFilterState {
  type: DateFilterType
  // 1달 단위
  selectedYear?: number
  selectedMonth?: number
  // 1년 단위
  selectedYearOnly?: number
  // 커스텀
  startYear?: number
  startMonth?: number
  endYear?: number
  endMonth?: number
}
```

**UI 구성:**

```
○ 전체
○ 1달 단위
  [년도 선택] [월 선택] (기본값: 현재 년도/월)
○ 1년 단위
  [년도 선택] (기본값: 현재 년도)
○ 날짜 커스텀
  시작: [년도 선택] [월 선택]
  종료: [년도 선택] [월 선택]
```

---

### 4. 데이터 조회 로직

```typescript
async function getTransactionsForExport(
  ledgerId: string,
  filter: DateFilterState
): Promise<Transaction[]> {
  let monthKeys: string[] = []

  switch (filter.type) {
    case 'all':
      // 모든 월 조회
      monthKeys = await getTransactionMonthKeys(ledgerId)
      break

    case 'month':
      // 특정 월
      monthKeys = [`${filter.selectedYear}-${String(filter.selectedMonth).padStart(2, '0')}`]
      break

    case 'year':
      // 특정 년도의 모든 월
      monthKeys = generateMonthKeys(filter.selectedYearOnly!, 1, filter.selectedYearOnly!, 12)
      break

    case 'custom':
      // 시작 ~ 종료 범위
      monthKeys = generateMonthKeys(
        filter.startYear!,
        filter.startMonth!,
        filter.endYear!,
        filter.endMonth!
      )
      break
  }

  // 여러 월 조회
  return getTransactionsByLedgerAndMonths(ledgerId, monthKeys)
}
```

---

### 5. 성능 고려사항

**문제점:**

- 많은 월을 조회할 경우 시간이 오래 걸릴 수 있음
- 예: 5년치 데이터 = 60개 월 조회

**해결 방안:**

1. **진행 상황 표시**

   ```typescript
   // 진행 상황 콜백
   onProgress?: (current: number, total: number) => void
   ```

2. **청크 단위 처리**

   ```typescript
   // 10개 월씩 나누어 처리
   const CHUNK_SIZE = 10
   for (let i = 0; i < monthKeys.length; i += CHUNK_SIZE) {
     const chunk = monthKeys.slice(i, i + CHUNK_SIZE)
     const results = await getTransactionsByLedgerAndMonths(ledgerId, chunk)
     // ...
   }
   ```

3. **캐싱**

   ```typescript
   // 이미 조회한 월은 Store에서 재사용
   const cached = transactions.filter((t) => monthKeys.includes(getMonthKey(t.date)))
   ```

4. **제한사항**
   ```typescript
   // 최대 조회 범위 제한 (선택)
   const MAX_MONTHS = 120 // 10년
   if (monthKeys.length > MAX_MONTHS) {
     throw new Error('너무 많은 기간을 선택했습니다. 최대 10년까지 가능합니다.')
   }
   ```

---

### 6. 데이터 범위 UI

**날짜 커스텀 옵션에서:**

- 시작/종료 날짜 선택 시 **데이터가 있는 범위**를 표시
- 예: "데이터 범위: 2023-01 ~ 2024-12"

**구현:**

```typescript
// Store에서 이미 로드된 데이터로 범위 추정
const dateRange = getDateRange(transactions)

// 또는 Firestore에서 조회
const monthKeys = await getTransactionMonthKeys(ledgerId)
const firstMonth = monthKeys[0] // '2023-01'
const lastMonth = monthKeys[monthKeys.length - 1] // '2024-12'
```

---

### 7. 추가 고려사항

#### 7.1 기본값 설정

- **1달 단위**: 현재 년도/월
- **1년 단위**: 현재 년도
- **날짜 커스텀**: 데이터 시작일 ~ 현재 월

#### 7.2 유효성 검사

```typescript
// 시작일이 종료일보다 늦으면 에러
if (startDate > endDate) {
  throw new Error('시작일은 종료일보다 빨라야 합니다.')
}

// 선택한 범위에 데이터가 없으면 경고
if (monthKeys.length === 0) {
  throw new Error('선택한 기간에 데이터가 없습니다.')
}
```

#### 7.3 파일명 생성

```typescript
function generateFilename(filter: DateFilterState): string {
  switch (filter.type) {
    case 'all':
      return '거래내역_전체'
    case 'month':
      return `거래내역_${filter.selectedYear}-${String(filter.selectedMonth).padStart(2, '0')}`
    case 'year':
      return `거래내역_${filter.selectedYearOnly}`
    case 'custom':
      return `거래내역_${filter.startYear}-${String(filter.startMonth).padStart(2, '0')}_${filter.endYear}-${String(filter.endMonth).padStart(2, '0')}`
  }
}
```

---

## 구현 순서

1. ✅ 월 키 생성 유틸리티 함수
2. ✅ Firestore에서 월 목록 조회 함수
3. ✅ 날짜 필터 상태 타입 정의
4. ✅ 날짜 필터 UI 컴포넌트
5. ✅ 필터에 따른 데이터 조회 로직
6. ✅ 진행 상황 표시
7. ✅ 파일명 자동 생성
8. ✅ 테스트

---

## 예상 영향

### 긍정적 영향

- ✅ 사용자가 원하는 기간만 선택하여 내보내기 가능
- ✅ 불필요한 데이터 조회 방지 (비용 절감)
- ✅ 파일 크기 최적화

### 주의사항

- ⚠️ "전체" 옵션은 많은 데이터를 조회하므로 시간이 걸릴 수 있음
- ⚠️ Firestore 읽기 비용 증가 가능
- ⚠️ 대용량 데이터 처리 시 메모리 사용량 고려 필요

---

## 결론

날짜 선택 필터 추가는 **기술적으로 가능**하며, 다음이 필요합니다:

1. **월 목록 조회 기능** (전체 옵션용)
2. **월 키 생성 유틸리티** (범위 계산용)
3. **날짜 필터 UI 컴포넌트** (사용자 선택용)
4. **진행 상황 표시** (사용자 경험 개선)

**추천 구현 방식:**

- Store에 로드된 데이터로 기본 범위 표시
- "전체" 선택 시에만 Firestore에서 월 목록 조회
- 진행 상황 표시로 사용자 경험 개선
