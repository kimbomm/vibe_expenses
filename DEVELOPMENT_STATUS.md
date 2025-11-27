# 개발 현황 문서

## 프로젝트 개요

- **프로젝트명**: Vibe - 스마트 가계부
- **기술 스택**: Vite + React 19 + TypeScript + Tailwind CSS
- **상태 관리**: Zustand (Firestore 연동)
- **폼 관리**: React Hook Form + Zod
- **백엔드**: Firebase (Auth, Firestore)
- **현재 단계**: Firestore 연동 완료, 더미 데이터 제거 완료

---

## 완료된 기능

### 1. 프로젝트 셋업 ✅

- Vite + React + TypeScript 프로젝트 초기화
- Tailwind CSS 설정 (v3.4.18)
- pnpm 패키지 매니저 사용
- Path alias 설정 (`@/`)

### 2. Firebase 연동 ✅

- **Firebase Auth**: Google OAuth (Popup 방식)
- **Firestore 데이터 저장**:
  - 사용자 정보 (users)
  - 가계부 (ledgers)
  - 거래 내역 (ledgers/{ledgerId}/transactions/{YYYY-MM}/items)
  - 자산 현황 (ledgers/{ledgerId}/assets)
  - 자산 로그 (ledgers/{ledgerId}/assetLogs)
  - 카테고리 (categories/{ledgerId})
- **보안 규칙**: 사용자/가계부 멤버 기반 권한 관리
- **세션 관리**: `onAuthStateChanged`로 자동 로그인 유지

### 3. UI 컴포넌트 ✅

- 기본 UI 컴포넌트: Button, Card, Input, Label, Dialog, Select
- 레이아웃 컴포넌트: Header, Sidebar, Layout
- 반응형 디자인 (모바일/태블릿/데스크톱)

### 4. 페이지 구현 ✅

- **로그인 페이지**: Google OAuth (Firebase 연동)
- **대시보드**: 월별 수입/지출 요약, 차트
- **가계부 목록**: 가계부 카드 뷰
- **거래 내역**: 캘린더 뷰 (월/주) + 리스트 뷰 (일)
- **자산 현황**: 자산 목록 + 변경 이력 로그
- **통계**: 카테고리별 지출 분석
- **설정**: 프로필 및 앱 설정

### 5. 상태 관리 (Zustand + Firestore) ✅

- `ledgerStore.ts`: 가계부 CRUD
- `transactionStore.ts`: 거래 CRUD (월별 조회)
- `assetStore.ts`: 자산 CRUD + 자동 로그 기록
- `categoryStore.ts`: 카테고리 CRUD
- `authStore.ts`: 인증 상태 관리

### 6. CRUD 기능 (Firestore 연동) ✅

- **가계부**: 추가, 수정, 삭제 (기본 카테고리 자동 생성)
- **거래**: 추가, 수정, 삭제 (월별 서브컬렉션)
- **자산**: 추가, 수정, 삭제 (자동 로그 기록)
- **카테고리**: 1단계/2단계 추가, 수정, 삭제

### 7. 특수 기능 ✅

- **캘린더 뷰**: 월별 캘린더, 주 단위 필터 시 해당 주 강조
- **날짜 필터**: 이번 달/이번 주/오늘
- **자산 변경 이력**: 자산 추가/수정/삭제 자동 로그
- **년도/월 필터링**: 데이터 범위 제한
- **모바일/PC 분기**: 폼 모달(PC) vs 전체 페이지(모바일)

---

## 프로젝트 구조

```
src/
├── components/
│   ├── ui/              # 기본 UI 컴포넌트
│   ├── layout/          # 레이아웃 (Header, Sidebar)
│   ├── transaction/     # 거래 관련 (CalendarView, TransactionForm)
│   ├── asset/           # 자산 관련 (AssetForm)
│   ├── ledger/          # 가계부 관련 (LedgerForm)
│   └── settings/        # 설정 관련 (CategoryManager)
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
├── stores/              # Zustand stores (Firestore 연동)
│   ├── authStore.ts
│   ├── ledgerStore.ts
│   ├── transactionStore.ts
│   ├── assetStore.ts
│   └── categoryStore.ts
│
├── lib/
│   ├── firebase/        # Firebase 서비스
│   │   ├── config.ts
│   │   ├── auth.ts
│   │   ├── ledgers.ts
│   │   ├── transactions.ts
│   │   ├── assets.ts
│   │   └── categories.ts
│   └── utils/           # 유틸 함수
│
├── types/               # TypeScript 타입 정의
├── constants/           # 카테고리, 통화, 라우트
└── hooks/               # 커스텀 훅
```

---

## Firestore 데이터 구조

```
users/{userId}
  - uid, email, displayName, photoURL, createdAt, lastLoginAt

ledgers/{ledgerId}
  - name, description, currency, ownerId, members[], memberIds[]

  /transactions/{YYYY-MM}/items/{transactionId}
    - type, amount, date, category1, category2, description, ...

  /assets/{assetId}
    - name, category1, category2, balance, currency, isActive, ...

  /assetLogs/{logId}
    - assetId, type, previousBalance, newBalance, description, ...

categories/{ledgerId}
  - income, expense, payment, asset (각각 Record<string, string[]>)

invitations/{invitationId}
  - ledgerId, email, status, ...
```

---

## 다음 단계

### 현재 상태

- ✅ UI 구현 완료
- ✅ Firebase Auth 연동 완료
- ✅ Firestore 데이터 연동 완료 (가계부, 거래, 자산, 카테고리)
- ✅ 더미 데이터 제거 완료
- ✅ 반응형 디자인 완료

### 다음 작업 예정

1. **멤버 초대 기능** - 가계부에 멤버 추가 및 권한 관리
2. **민감 정보 암호화** (선택) - 필요 시 필드 암호화

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

# Firebase 배포
pnpm exec firebase deploy --only firestore:rules
pnpm exec firebase deploy --only firestore:indexes
```

---

## 마지막 업데이트

- 날짜: 2024-11-27
- 상태: Firestore 전체 연동 완료, 더미 데이터 제거 완료
- 다음: 멤버 초대 기능 구현

## 최근 주요 변경사항

### Firestore 전체 연동 (2024-11-27)

- ✅ **거래(Transactions) 서브컬렉션 구조**
  - `ledgers/{ledgerId}/transactions/{YYYY-MM}/items/{transactionId}`
  - 월별 파티셔닝으로 비용 최적화
  - 월별 조회 함수 (`fetchTransactionsByMonth`)

- ✅ **자산(Assets) 서브컬렉션 구조**
  - `ledgers/{ledgerId}/assets/{assetId}`
  - `ledgers/{ledgerId}/assetLogs/{logId}`
  - 자동 로그 기록 (생성, 수정, 잔액 변경, 비활성화)

- ✅ **더미 데이터 완전 제거**
  - `mockDataStore.ts` 삭제
  - `src/lib/mocks/` 폴더 삭제
  - 모든 페이지가 Firestore 기반으로 동작

- ✅ **설정 페이지 업데이트**
  - 실제 Firebase Auth 사용자 정보 표시

### 이전 변경사항

- Firebase Auth 연동 (Google OAuth)
- 가계부 CRUD + 기본 카테고리 자동 생성
- 카테고리 CRUD
- 모바일/PC 분기 처리 (모달 vs 전체 페이지)
- 대시보드 통계 및 차트 통합
