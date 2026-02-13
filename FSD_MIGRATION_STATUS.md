# FSD 마이그레이션 상태

현재 상태: **완료**

## 완료 요약

- `src/app` 구성 완료 (`router.tsx`, `index.tsx`)
- `src/entities` 구성 완료 (`user`, `ledger`, `transaction`, `asset`, `category`, `invitation`)
- `src/features` 구성 완료 (form/import/export/auth/category/member 등)
- `src/widgets` 구성 완료 (layout, transaction-calendar, dashboard-summary)
- `src/shared` 구성 완료 (ui/lib/hooks/config/api/types)
- 페이지 레이어가 새 레이어 구조를 사용하도록 임포트 갱신 완료

## 현재 디렉터리 구조

```text
src/
├── app/
├── pages/
├── widgets/
├── features/
├── entities/
└── shared/
```

## 비고

- 본 문서는 상태 요약본입니다.
- 상세 이력은 `FSD_MIGRATION_COMPLETE.md`를 참고하세요.
