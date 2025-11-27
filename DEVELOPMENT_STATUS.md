# 개발 현황 문서

## 프로젝트 개요

- **프로젝트명**: Vibe - 스마트 가계부
- **기술 스택**: Vite + React 19 + TypeScript + Tailwind CSS
- **상태 관리**: Zustand (Firestore 연동)
- **폼 관리**: React Hook Form + Zod
- **백엔드**: Firebase (Auth, Firestore)
- **현재 단계**: 멤버 초대 기능 완료, 권한 관리 완료

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
  - 초대 (invitations)
- **보안 규칙**: 사용자/가계부 멤버 기반 권한 관리
- **세션 관리**: `onAuthStateChanged`로 자동 로그인 유지

### 3. UI 컴포넌트 ✅

- 기본 UI 컴포넌트: Button, Card, Input, Label, Dialog, Select
- 레이아웃 컴포넌트: Header, Sidebar, Layout
- 반응형 디자인 (모바일/태블릿/데스크톱)

### 4. 페이지 구현 ✅

- **로그인 페이지**: Google OAuth (Firebase 연동)
- **대시보드**: 월별 수입/지출 요약, 차트
- **가계부 목록**: 가계부 카드 뷰 (내 가계부 / 공유받은 가계부 구분)
- **거래 내역**: 캘린더 뷰 (월/주) + 리스트 뷰 (일)
- **자산 현황**: 자산 목록 + 변경 이력 로그
- **통계**: 카테고리별 지출 분석
- **멤버 관리**: 멤버 목록, 권한 변경, 초대
- **받은 초대**: 초대 수락/거절
- **설정**: 프로필 및 앱 설정

### 5. 상태 관리 (Zustand + Firestore) ✅

- `authStore.ts`: 인증 상태 관리
- `ledgerStore.ts`: 가계부 CRUD
- `transactionStore.ts`: 거래 CRUD (월별 조회)
- `assetStore.ts`: 자산 CRUD + 자동 로그 기록
- `categoryStore.ts`: 카테고리 CRUD
- `invitationStore.ts`: 초대 CRUD + 멤버 관리

### 6. CRUD 기능 (Firestore 연동) ✅

- **가계부**: 추가, 수정, 삭제 (기본 카테고리 자동 생성)
- **거래**: 추가, 수정, 삭제 (월별 서브컬렉션)
- **자산**: 추가, 수정, 삭제 (자동 로그 기록)
- **카테고리**: 1단계/2단계 추가, 수정, 삭제
- **초대**: 생성, 수락, 거절, 취소
- **멤버**: 권한 변경, 제거

### 7. 멤버 초대 기능 ✅

- **초대 생성**: 이메일 기반 초대 (Owner만 가능)
- **초대 수락/거절**: 받은 초대 페이지에서 처리
- **초대 취소**: 대기 중인 초대 취소 (Owner만 가능)
- **멤버 권한 변경**: Editor/Viewer 변경 (Owner만 가능)
- **멤버 제거**: 가계부에서 제외 (Owner만 가능)
- **초대 알림**: 헤더 아이콘 + 배지

### 8. 권한 관리 ✅

- **useLedgerPermission 훅**: 가계부별 사용자 권한 체크
- **권한별 UI 분기**:
  - Owner: 모든 기능 접근
  - Editor: 거래/자산 CRUD
  - Viewer: 조회만 가능 (추가/수정/삭제 버튼 숨김)
- **공유 가계부 표시**: 파란색 테마 + "공유됨" 태그

### 9. 특수 기능 ✅

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
│   ├── member/          # 멤버 관련 (InviteMemberModal)
│   ├── settings/        # 설정 관련 (CategoryManager)
│   └── auth/            # 인증 관련 (ProtectedRoute)
│
├── pages/
│   ├── auth/            # 로그인
│   ├── dashboard/       # 대시보드
│   ├── ledgers/         # 가계부 목록
│   ├── transactions/    # 거래 내역
│   ├── assets/          # 자산 현황
│   ├── statistics/      # 통계
│   ├── members/         # 멤버 관리
│   ├── invitations/     # 받은 초대
│   └── settings/        # 설정
│
├── stores/              # Zustand stores (Firestore 연동)
│   ├── authStore.ts
│   ├── ledgerStore.ts
│   ├── transactionStore.ts
│   ├── assetStore.ts
│   ├── categoryStore.ts
│   └── invitationStore.ts
│
├── lib/
│   ├── firebase/        # Firebase 서비스
│   │   ├── config.ts
│   │   ├── auth.ts
│   │   ├── ledgers.ts
│   │   ├── transactions.ts
│   │   ├── assets.ts
│   │   ├── categories.ts
│   │   └── invitations.ts
│   └── utils.ts         # 유틸 함수
│
├── hooks/               # 커스텀 훅
│   ├── useIsMobile.ts
│   ├── useCategories.ts
│   └── useLedgerPermission.ts
│
├── types/               # TypeScript 타입 정의
└── constants/           # 상수 정의
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
  - ledgerId, ledgerName, email, role, status, invitedBy, invitedByName, createdAt, respondedAt
```

---

## 다음 단계

### 현재 상태

- ✅ UI 구현 완료
- ✅ Firebase Auth 연동 완료
- ✅ Firestore 데이터 연동 완료
- ✅ 더미 데이터 제거 완료
- ✅ 멤버 초대 기능 완료
- ✅ 권한 관리 완료
- ✅ 반응형 디자인 완료

### 다음 작업 예정

1. **데이터 내보내기** - CSV, Excel 형식
2. **다크 모드** - 테마 토글
3. **PWA 지원** - 오프라인 및 설치 기능
4. **민감 정보 암호화** (선택) - 필요 시 필드 암호화

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
pnpm firebase deploy --only firestore:rules
pnpm firebase deploy --only firestore:indexes
```

---

## 마지막 업데이트

- 날짜: 2024-11-27
- 상태: 멤버 초대 기능 완료, 권한 관리 완료
- 다음: 데이터 내보내기, 다크 모드

---

## 최근 주요 변경사항

### 멤버 초대 기능 (2024-11-27)

- ✅ **Firestore 초대 서비스** (`invitations.ts`)
  - 초대 생성, 수락, 거절, 취소
  - 멤버 권한 변경, 제거

- ✅ **Zustand 초대 스토어** (`invitationStore.ts`)
  - 받은 초대 목록 관리
  - 대기 초대 개수 관리
  - 멤버 관리 기능

- ✅ **멤버 관리 페이지** (`/ledgers/:ledgerId/members`)
  - 현재 멤버 목록
  - 권한 변경 (Editor/Viewer)
  - 멤버 제거
  - 대기 중인 초대 목록
  - 초대 취소

- ✅ **받은 초대 페이지** (`/invitations`)
  - 대기 중인 초대 (수락/거절)
  - 지난 초대 이력 (최대 5개)

- ✅ **헤더 초대 알림**
  - 초대 아이콘 + 배지 (대기 초대 개수)

- ✅ **설정 페이지 연동**
  - 받은 초대 바로가기 카드

### 권한 관리 (2024-11-27)

- ✅ **useLedgerPermission 훅**
  - 가계부별 사용자 권한 체크
  - `canEdit`, `canView`, `isOwner`, `isEditor`, `isViewer`

- ✅ **권한별 UI 분기**
  - 대시보드: Viewer는 거래 추가 버튼 숨김
  - 거래 내역: Viewer는 추가/수정/삭제 버튼 숨김
  - 자산 현황: Viewer는 추가/수정/삭제 버튼 숨김

- ✅ **공유 가계부 표시**
  - 파란색 배경/테두리
  - Share2 아이콘
  - "공유됨" 태그
  - Owner만 수정/삭제 버튼 표시

### 가계부 조회 개선 (2024-11-27)

- ✅ **소유 + 공유 가계부 조회**
  - `getLedgersByUser`에서 `ownerId` 및 `memberIds` 모두 조회

### 이전 변경사항

- Firestore 전체 연동 (거래, 자산, 카테고리)
- Firebase Auth 연동 (Google OAuth)
- 가계부 CRUD + 기본 카테고리 자동 생성
- 모바일/PC 분기 처리 (모달 vs 전체 페이지)
- 대시보드 통계 및 차트 통합
