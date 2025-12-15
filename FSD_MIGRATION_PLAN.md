# FSD (Feature-Sliced Design) 구조 전환 계획

## 현재 구조 분석

### 현재 폴더 구조

```
src/
├── pages/          # 페이지 컴포넌트
├── components/     # UI 컴포넌트 (기능별 분류)
├── stores/         # Zustand 상태 관리
├── lib/            # 유틸리티, Firebase, 암호화, import/export
├── types/          # 타입 정의
├── hooks/          # 커스텀 훅
├── constants/      # 상수
├── router.tsx      # 라우팅
├── App.tsx         # 앱 초기화
└── main.tsx        # 진입점
```

## FSD 구조로의 변환 계획

### 1. app/ (앱 초기화 및 설정)

**목적**: 앱의 초기화, 라우팅, 전역 프로바이더

**구성**:

```
app/
├── providers/          # 전역 프로바이더 (필요시)
├── router.tsx         # 라우팅 설정 (현재 router.tsx)
└── index.tsx          # 앱 진입점 (현재 App.tsx + main.tsx 통합)
```

**이동할 파일**:

- `router.tsx` → `app/router.tsx`
- `App.tsx` + `main.tsx` → `app/index.tsx`

---

### 2. pages/ (페이지 레이어)

**목적**: 라우트별 페이지 컴포넌트 (기본 구조 유지)

**구성**:

```
pages/
├── auth/
│   └── login/
│       └── ui/
│           └── LoginPage.tsx
├── ledgers/
│   ├── list/
│   │   └── ui/
│   │       └── LedgersPage.tsx
│   └── form/
│       └── ui/
│           └── LedgerFormPage.tsx
├── transactions/
│   ├── list/
│   │   └── ui/
│   │       └── TransactionsPage.tsx
│   ├── form/
│   │   └── ui/
│   │       └── TransactionFormPage.tsx
│   ├── import/
│   │   └── ui/
│   │       └── ImportTransactionPage.tsx
│   └── export/
│       └── ui/
│           └── ExportTransactionPage.tsx
├── assets/
│   ├── list/
│   │   └── ui/
│   │       └── AssetsPage.tsx
│   ├── form/
│   │   └── ui/
│   │       └── AssetFormPage.tsx
│   └── export/
│       └── ui/
│           └── ExportAssetPage.tsx
├── dashboard/
│   └── ui/
│       └── DashboardPage.tsx
├── statistics/
│   └── ui/
│       └── StatisticsPage.tsx
├── settings/
│   ├── main/
│   │   └── ui/
│   │       └── SettingsPage.tsx
│   ├── categories/
│   │   └── ui/
│   │       └── CategoriesPage.tsx
│   └── categories-import/
│       └── ui/
│           └── ImportCategoryPage.tsx
├── members/
│   └── ui/
│       └── MembersPage.tsx
└── invitations/
    └── ui/
        └── InvitationsPage.tsx
```

**변경사항**:

- 페이지별로 `ui/` 폴더 구조 추가
- 각 페이지는 해당 feature/widget을 조합하여 구성

---

### 3. widgets/ (위젯 레이어)

**목적**: 여러 features를 조합한 복합 UI 블록

**구성**:

```
widgets/
├── layout/
│   ├── header/
│   │   └── ui/
│   │       └── Header.tsx
│   ├── sidebar/
│   │   └── ui/
│   │       └── Sidebar.tsx
│   └── main-layout/
│       └── ui/
│           └── Layout.tsx
├── transaction-list/
│   └── ui/
│       └── TransactionList.tsx        # 거래 목록 표시 위젯
├── transaction-calendar/
│   └── ui/
│       └── TransactionCalendar.tsx    # 캘린더 뷰 위젯
├── dashboard-summary/
│   └── ui/
│       └── DashboardSummary.tsx       # 대시보드 요약 위젯
└── statistics-chart/
    └── ui/
        └── StatisticsChart.tsx        # 통계 차트 위젯
```

**이동할 파일**:

- `components/layout/*` → `widgets/layout/*`
- `components/transaction/CalendarView.tsx` → `widgets/transaction-calendar/ui/TransactionCalendar.tsx`
- `components/dashboard/MonthPicker.tsx` → `widgets/dashboard-summary/ui/MonthPicker.tsx` (또는 shared로)

---

### 4. features/ (기능 레이어)

**목적**: 비즈니스 기능 단위 (CRUD, import, export 등)

**구성**:

```
features/
├── transaction-create/
│   ├── ui/
│   │   ├── TransactionForm.tsx
│   │   └── TransactionFormContent.tsx
│   └── model/
│       └── useTransactionCreate.ts    # 생성 로직 훅
├── transaction-edit/
│   ├── ui/
│   │   └── TransactionEditForm.tsx
│   └── model/
│       └── useTransactionEdit.ts
├── transaction-delete/
│   └── model/
│       └── useTransactionDelete.ts
├── transaction-import/
│   ├── ui/
│   │   ├── ImportTransactionModal.tsx
│   │   └── ImportTransactionContent.tsx
│   └── model/
│       └── useTransactionImport.ts
├── transaction-export/
│   ├── ui/
│   │   ├── ExportTransactionModal.tsx
│   │   └── ExportTransactionContent.tsx
│   └── model/
│       └── useTransactionExport.ts
├── ledger-create/
│   ├── ui/
│   │   ├── LedgerForm.tsx
│   │   └── LedgerFormContent.tsx
│   └── model/
│       └── useLedgerCreate.ts
├── ledger-edit/
│   ├── ui/
│   │   └── LedgerEditForm.tsx
│   └── model/
│       └── useLedgerEdit.ts
├── ledger-delete/
│   └── model/
│       └── useLedgerDelete.ts
├── asset-create/
│   ├── ui/
│   │   ├── AssetForm.tsx
│   │   └── AssetFormContent.tsx
│   └── model/
│       └── useAssetCreate.ts
├── asset-edit/
│   ├── ui/
│   │   └── AssetEditForm.tsx
│   └── model/
│       └── useAssetEdit.ts
├── asset-export/
│   ├── ui/
│   │   ├── ExportAssetModal.tsx
│   │   └── ExportAssetContent.tsx
│   └── model/
│       └── useAssetExport.ts
├── category-manage/
│   ├── ui/
│   │   └── CategoryManager.tsx
│   └── model/
│       └── useCategoryManage.ts
├── category-import/
│   ├── ui/
│   │   ├── ImportCategoryModal.tsx
│   │   └── ImportCategoryContent.tsx
│   └── model/
│       └── useCategoryImport.ts
├── member-invite/
│   ├── ui/
│   │   └── InviteMemberModal.tsx
│   └── model/
│       └── useMemberInvite.ts
├── auth-login/
│   ├── ui/
│   │   └── LoginForm.tsx
│   └── model/
│       └── useAuthLogin.ts
└── auth-protected-route/
    └── ui/
        └── ProtectedRoute.tsx
```

**이동할 파일**:

- `components/transaction/*` → `features/transaction-*/ui/*`
- `components/ledger/*` → `features/ledger-*/ui/*`
- `components/asset/*` → `features/asset-*/ui/*`
- `components/import/*` → `features/*-import/ui/*`
- `components/export/*` → `features/*-export/ui/*`
- `components/member/*` → `features/member-invite/ui/*`
- `components/auth/*` → `features/auth-*/ui/*`
- `components/settings/*` → `features/category-manage/ui/*`

---

### 5. entities/ (엔티티 레이어)

**목적**: 비즈니스 엔티티 (Transaction, Ledger, Asset, Category, User 등)

**구성**:

```
entities/
├── transaction/
│   ├── model/
│   │   ├── types.ts                    # Transaction 타입
│   │   ├── store.ts                    # transactionStore
│   │   └── hooks.ts                    # useTransactions 등
│   ├── api/
│   │   └── transactionApi.ts           # Firebase API 호출
│   └── lib/
│       └── transactionCrypto.ts        # 암호화 로직
├── ledger/
│   ├── model/
│   │   ├── types.ts
│   │   ├── store.ts
│   │   └── hooks.ts
│   ├── api/
│   │   └── ledgerApi.ts
│   └── lib/
│       └── ledgerCrypto.ts
├── asset/
│   ├── model/
│   │   ├── types.ts
│   │   ├── store.ts
│   │   └── hooks.ts
│   ├── api/
│   │   └── assetApi.ts
│   └── lib/
│       └── assetCrypto.ts
├── category/
│   ├── model/
│   │   ├── types.ts
│   │   ├── store.ts
│   │   └── hooks.ts
│   └── api/
│       └── categoryApi.ts
├── user/
│   ├── model/
│   │   ├── types.ts
│   │   ├── store.ts                    # authStore
│   │   └── hooks.ts
│   └── api/
│       └── authApi.ts
└── invitation/
    ├── model/
    │   ├── types.ts
    │   ├── store.ts
    │   └── hooks.ts
    └── api/
        └── invitationApi.ts
```

**이동할 파일**:

- `types/transaction.ts` → `entities/transaction/model/types.ts`
- `stores/transactionStore.ts` → `entities/transaction/model/store.ts`
- `lib/firebase/transactions.ts` → `entities/transaction/api/transactionApi.ts`
- `lib/crypto/transactionCrypto.ts` → `entities/transaction/lib/transactionCrypto.ts`
- (동일한 패턴으로 ledger, asset, category, user, invitation도 이동)

---

### 6. shared/ (공유 레이어)

**목적**: 프로젝트 전반에서 재사용되는 코드

**구성**:

```
shared/
├── ui/
│   ├── button/
│   │   └── ui/
│   │       └── Button.tsx
│   ├── card/
│   │   └── ui/
│   │       └── Card.tsx
│   ├── dialog/
│   │   └── ui/
│   │       └── Dialog.tsx
│   ├── input/
│   │   └── ui/
│   │       └── Input.tsx
│   ├── label/
│   │   └── ui/
│   │       └── Label.tsx
│   └── select/
│       └── ui/
│           └── Select.tsx
├── lib/
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── format.ts
│   │   ├── asset.ts
│   │   └── index.ts
│   ├── crypto/
│   │   ├── encryption.ts
│   │   └── index.ts
│   ├── export/
│   │   ├── excelGenerator.ts
│   │   ├── csvGenerator.ts
│   │   ├── dateUtils.ts
│   │   ├── transactionExporter.ts
│   │   └── assetExporter.ts
│   └── import/
│       ├── excelParser.ts
│       ├── dateParser.ts
│       ├── columnMapper.ts
│       ├── transactionImporter.ts
│       ├── transactionValidator.ts
│       ├── categoryImporter.ts
│       └── categoryValidator.ts
├── api/
│   └── firebase/
│       └── config.ts                   # Firebase 설정
├── config/
│   ├── routes.ts
│   ├── categories.ts
│   └── currencies.ts
└── hooks/
    ├── useCategories.ts
    ├── useLedgerPermission.ts
    └── useMediaQuery.ts
```

**이동할 파일**:

- `components/ui/*` → `shared/ui/*/ui/*`
- `lib/utils/*` → `shared/lib/utils/*`
- `lib/crypto/encryption.ts` → `shared/lib/crypto/encryption.ts`
- `lib/export/*` → `shared/lib/export/*`
- `lib/import/*` → `shared/lib/import/*`
- `lib/firebase/config.ts` → `shared/api/firebase/config.ts`
- `constants/*` → `shared/config/*`
- `hooks/*` → `shared/hooks/*`

---

## 주요 변경사항 요약

### 1. 엔티티 중심 구조화

- 각 엔티티(transaction, ledger, asset 등)별로 관련 코드를 한 곳에 모음
- 타입, 스토어, API, 암호화 로직을 엔티티별로 그룹화

### 2. 기능 단위 분리

- CRUD 작업을 각각 독립적인 feature로 분리
- import/export 기능도 별도 feature로 분리

### 3. 재사용성 향상

- 공통 UI 컴포넌트는 `shared/ui`로 이동
- 공통 유틸리티는 `shared/lib`로 이동

### 4. 의존성 규칙

FSD의 핵심 원칙:

- **app** → **pages** → **widgets** → **features** → **entities** → **shared**
- 하위 레이어는 상위 레이어를 참조할 수 없음
- 같은 레이어 내에서는 서로 참조 가능

---

## 마이그레이션 단계

### Phase 1: shared 레이어 구성

1. `shared/ui` 구성 (UI 컴포넌트)
2. `shared/lib` 구성 (유틸리티)
3. `shared/api` 구성 (Firebase 설정)
4. `shared/config` 구성 (상수)
5. `shared/hooks` 구성 (공통 훅)

### Phase 2: entities 레이어 구성

1. `entities/transaction` 구성
2. `entities/ledger` 구성
3. `entities/asset` 구성
4. `entities/category` 구성
5. `entities/user` 구성
6. `entities/invitation` 구성

### Phase 3: features 레이어 구성

1. transaction 관련 features
2. ledger 관련 features
3. asset 관련 features
4. category 관련 features
5. auth 관련 features
6. member 관련 features

### Phase 4: widgets 레이어 구성

1. layout 위젯
2. transaction 관련 위젯
3. dashboard 관련 위젯

### Phase 5: pages 레이어 재구성

1. pages를 FSD 구조로 재구성
2. 각 페이지에서 features/widgets 조합

### Phase 6: app 레이어 구성

1. router 이동
2. App.tsx + main.tsx 통합

---

## 주의사항

1. **점진적 마이그레이션**: 한 번에 모든 것을 옮기지 말고 단계적으로 진행
2. **임포트 경로**: `@/` alias를 유지하되, 새로운 경로 구조에 맞게 업데이트
3. **테스트**: 각 단계마다 빌드 및 기능 테스트 수행
4. **의존성 체크**: FSD 의존성 규칙을 위반하지 않도록 주의

---

## 예상 이점

1. **명확한 구조**: 기능과 엔티티가 명확히 분리됨
2. **재사용성**: 공통 코드가 shared에 모여 재사용 용이
3. **확장성**: 새로운 기능 추가 시 구조가 명확함
4. **유지보수성**: 관련 코드가 한 곳에 모여 있어 수정이 쉬움
5. **팀 협업**: 각 레이어의 역할이 명확하여 협업이 용이함
