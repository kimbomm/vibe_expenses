# FSD 마이그레이션 진행 상황

## ✅ 완료된 작업

### Phase 1: shared 레이어 구성 ✅
- [x] `shared/ui` - UI 컴포넌트들
- [x] `shared/lib/utils` - 유틸리티 함수들
- [x] `shared/lib/crypto` - 암호화 유틸리티
- [x] `shared/lib/export` - export 유틸리티
- [x] `shared/api/firebase` - Firebase 설정
- [x] `shared/config` - 상수들
- [x] `shared/hooks` - 공통 훅들
- [x] `shared/types` - 공통 타입 재export

### Phase 2: entities 레이어 구성 (진행 중)
- [x] `entities/transaction` - 완료
  - [x] `model/types.ts`, `model/store.ts`
  - [x] `api/transactionApi.ts`
  - [x] `lib/transactionCrypto.ts`
- [x] `entities/ledger` - 완료
  - [x] `model/types.ts`, `model/store.ts`
  - [x] `api/ledgerApi.ts`
- [x] `entities/asset` - 완료
  - [x] `model/types.ts`, `model/store.ts`
  - [x] `api/assetApi.ts`
  - [x] `lib/assetCrypto.ts`
- [x] `entities/category/model/types.ts` - 타입 정의 완료
- [x] `entities/user/model/types.ts` - 타입 정의 완료

### 임포트 경로 업데이트 ✅
- [x] 모든 주요 임포트 경로 업데이트 완료
- [x] 빌드 성공 확인

## 🔄 진행 중인 작업

### Phase 2: 나머지 엔티티들
- [ ] `entities/category` - store, api 구성 필요 (기존 파일 유지)
- [ ] `entities/user` - store, api 구성 필요 (기존 파일 유지)
- [ ] `entities/invitation` - 전체 구성 필요

## 📋 다음 단계

1. 나머지 엔티티들 완전 구성 (category, user, invitation)
2. features 레이어 구성
3. widgets 레이어 구성
4. pages 레이어 재구성
5. app 레이어 구성
6. 기존 파일 정리 (삭제)

## 📝 주요 변경사항

### 완성된 엔티티 구조
```
entities/
├── transaction/    ✅ 완료
│   ├── model/      (types, store)
│   ├── api/        (transactionApi)
│   └── lib/        (transactionCrypto)
├── ledger/         ✅ 완료
│   ├── model/      (types, store)
│   └── api/        (ledgerApi)
└── asset/          ✅ 완료
    ├── model/      (types, store)
    ├── api/        (assetApi)
    └── lib/        (assetCrypto)
```

### 임포트 경로 변경 완료
- `@/stores/transactionStore` → `@/entities/transaction/model/store`
- `@/stores/ledgerStore` → `@/entities/ledger/model/store`
- `@/stores/assetStore` → `@/entities/asset/model/store`
- `@/lib/firebase/transactions` → `@/entities/transaction/api/transactionApi`
- `@/lib/firebase/ledgers` → `@/entities/ledger/api/ledgerApi`
- `@/lib/firebase/assets` → `@/entities/asset/api/assetApi`
- `@/lib/crypto/transactionCrypto` → `@/entities/transaction/lib/transactionCrypto`
- `@/lib/crypto/assetCrypto` → `@/entities/asset/lib/assetCrypto`

## 🎯 현재 상태

- ✅ 기본 FSD 구조 적용 완료
- ✅ shared 레이어 완전 구성
- ✅ transaction, ledger, asset 엔티티 완전 구성
- ✅ 임포트 경로 일괄 업데이트 완료
- ✅ 빌드 성공 확인

## ⚠️ 주의사항

- 기존 파일들은 아직 삭제하지 않음
- category, user 엔티티는 타입만 정의하고 store/api는 기존 파일 유지
- 빌드는 성공했으나 일부 경고 존재 (동적 임포트 관련)
