# 개발 현황 문서

## 프로젝트 개요

- **프로젝트명**: Vibe - 스마트 가계부
- **기술 스택**: Vite + React 19 + TypeScript + Tailwind CSS
- **상태 관리**: Zustand
- **폼 관리**: React Hook Form + Zod
- **현재 단계**: UI 구현 완료, 더미 데이터로 CRUD 기능 구현 완료

---

## 완료된 기능

### 1. 프로젝트 셋업 ✅

- Vite + React + TypeScript 프로젝트 초기화
- Tailwind CSS 설정 (v3.4.18)
- pnpm 패키지 매니저 사용
- Path alias 설정 (`@/`)

### 2. UI 컴포넌트 ✅

- 기본 UI 컴포넌트: Button, Card, Input, Label, Dialog, Select
- 레이아웃 컴포넌트: Header, Sidebar, Layout
- 반응형 디자인 (모바일/태블릿/데스크톱)

### 3. 페이지 구현 ✅

- **로그인 페이지**: Google OAuth UI (더미)
- **대시보드**: 월별 수입/지출 요약, 가계부 목록
- **가계부 목록**: 가계부 카드 뷰
- **거래 내역**: 캘린더 뷰 (월/주) + 리스트 뷰 (일)
- **자산 현황**: 자산 목록 + 변경 이력 로그
- **통계**: 카테고리별 지출 분석
- **설정**: 프로필 및 앱 설정

### 4. 상태 관리 (Zustand) ✅

- `mockDataStore.ts`: 거래, 자산, 가계부 상태 관리
- 추가/수정/삭제 액션 구현

### 5. CRUD 기능 ✅

- **거래**: 추가, 수정, 삭제 (TransactionForm)
- **자산**: 추가, 수정, 삭제 (AssetForm)
- **가계부**: 추가, 수정, 삭제 (LedgerForm)

### 6. 특수 기능 ✅

- **캘린더 뷰**: 월별 캘린더, 주 단위 필터 시 해당 주 강조
- **날짜 필터**: 전체/이번 달/이번 주/오늘
- **자산 변경 이력**: 자산 추가/수정/삭제 로그 표시

---

## 프로젝트 구조

```
src/
├── components/
│   ├── ui/              # 기본 UI 컴포넌트
│   ├── layout/          # 레이아웃 (Header, Sidebar)
│   ├── transaction/     # 거래 관련 (CalendarView, TransactionForm)
│   ├── asset/           # 자산 관련 (AssetForm)
│   └── ledger/          # 가계부 관련 (LedgerForm)
│
├── pages/
│   ├── auth/            # 로그인
│   ├── dashboard/       # 대시보드
│   ├── ledgers/         # 가계부 목록
│   ├── transactions/    # 거래 내역
│   ├── assets/          # 자산 현황
│   ├── statistics/      # 통계
│   └── settings/        # 설정
│
├── stores/
│   └── mockDataStore.ts # Zustand 상태 관리
│
├── types/               # TypeScript 타입 정의
├── constants/           # 카테고리, 통화, 라우트
└── lib/
    ├── utils/           # 유틸 함수
    └── mocks/           # 더미 데이터
```

---

## 주요 파일 위치

### 상태 관리

- `src/stores/mockDataStore.ts` - Zustand store (거래/자산/가계부 CRUD)

### 폼 컴포넌트

- `src/components/transaction/TransactionForm.tsx` - 거래 추가/수정 폼 (PC 모달)
- `src/components/transaction/TransactionFormContent.tsx` - 거래 폼 컨텐츠 (공통)
- `src/components/asset/AssetForm.tsx` - 자산 추가/수정 폼 (PC 모달)
- `src/components/asset/AssetFormContent.tsx` - 자산 폼 컨텐츠 (공통)
- `src/components/ledger/LedgerForm.tsx` - 가계부 추가/수정 폼 (PC 모달)
- `src/components/ledger/LedgerFormContent.tsx` - 가계부 폼 컨텐츠 (공통)

### 주요 페이지

- `src/pages/transactions/TransactionsPage.tsx` - 거래 내역 (캘린더 + 리스트)
- `src/pages/transactions/TransactionFormPage.tsx` - 거래 추가/수정 페이지 (모바일)
- `src/pages/assets/AssetsPage.tsx` - 자산 현황
- `src/pages/assets/AssetFormPage.tsx` - 자산 추가/수정 페이지 (모바일)
- `src/pages/ledgers/LedgersPage.tsx` - 가계부 목록
- `src/pages/ledgers/LedgerFormPage.tsx` - 가계부 추가/수정 페이지 (모바일)

### 타입 정의

- `src/types/transaction.ts` - 거래 타입
- `src/types/asset.ts` - 자산 타입 (AssetLog 포함)
- `src/types/ledger.ts` - 가계부 타입

### 상수

- `src/constants/categories.ts` - 카테고리 정의 (2단계 구조)

---

## 다음 단계 (Firebase 연동 전)

### 현재 상태

- ✅ UI 구현 완료
- ✅ 더미 데이터로 CRUD 기능 동작
- ✅ 반응형 디자인 완료

### 다음 작업 예정

1. Firebase 프로젝트 설정
2. Firebase Auth (Google OAuth) 연동
3. Firestore 데이터베이스 연동
4. Security Rules 설정
5. 실시간 동기화 구현

---

## 개발 명령어

```bash
# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 린트
pnpm lint

# 타입 체크
pnpm type-check

# 포맷팅
pnpm format
```

---

## 주의사항

1. **더미 데이터**: 현재는 `mockDataStore.ts`에서 더미 데이터를 관리합니다.
2. **Firebase 미연동**: 아직 Firebase는 연결되지 않았습니다.
3. **인증**: 로그인은 더미로 동작하며, 실제 인증은 구현되지 않았습니다.

---

## 마지막 업데이트

- 날짜: 2024-12-19
- 상태: UI 및 더미 데이터 CRUD 완료, 모바일/PC 분기 처리 완료
- 다음: Firebase 연동 준비 완료

## 최근 주요 변경사항

### 모바일/PC 분기 처리 (2024-12-19)

- ✅ 거래 추가/수정: PC는 모달, 모바일은 전체 페이지로 이동
  - 모바일 페이지: 하단 고정 버튼, 뒤로가기 버튼
  - 라우트: `/ledgers/:ledgerId/transactions/new`, `/ledgers/:ledgerId/transactions/:id/edit`
- ✅ 자산 추가/수정: PC는 모달, 모바일은 전체 페이지로 이동
  - 모바일 페이지: 하단 고정 버튼, 뒤로가기 버튼
  - 라우트: `/ledgers/:ledgerId/assets/new`, `/ledgers/:ledgerId/assets/:id/edit`
- ✅ 가계부 추가/수정: PC는 모달, 모바일은 전체 페이지로 이동
  - 모바일 페이지: 하단 고정 버튼, 뒤로가기 버튼
  - 라우트: `/ledgers/new`, `/ledgers/:id/edit`
- ✅ 폼 컨텐츠 컴포넌트 분리: 모달/페이지 공통 사용
  - `TransactionFormContent`, `AssetFormContent`, `LedgerFormContent`

### UI 개선 (2024-12-19)

- ✅ 카테고리 설정 페이지 반응형 레이아웃
  - 모바일: 수정/삭제 버튼 우상단, 2단계 추가 버튼 하단 full 너비
  - PC: 타이틀, 수정/삭제, 2단계 추가 모두 같은 라인
- ✅ 자산 페이지 레이아웃 개선
  - 자산 카드: 모바일에서 금액과 버튼 양쪽 끝 배치
  - 총 자산/부채/순자산 카드: 금액 우측 정렬
- ✅ Sidebar 상태 유지
  - localStorage를 사용한 마지막 선택 가계부 기억
  - `/settings` 페이지에서도 가계부 메뉴 유지

### 아키텍처 개선

- ✅ 가계부 = Room 개념으로 변경 (각 가계부별 독립 데이터 관리)
- ✅ 카테고리 관리 가계부별로 분리
- ✅ 대시보드 가계부별로 분리 (`/ledgers/:id/dashboard`)

### 기능 추가

- ✅ 대시보드에 통계 및 차트 통합 (Recharts)
- ✅ 년도/월 필터링 (데이터 범위 제한)
- ✅ 커스텀 MonthPicker 컴포넌트
- ✅ Sidebar 동적 메뉴 (가계부 선택 시 하위 메뉴 표시)

### 이전 UI 개선

- ✅ 카테고리 설정 진입점 명확화 (가계부 하위 메뉴)
- ✅ 대시보드 레이아웃 개선 (통계 섹션 추가)
