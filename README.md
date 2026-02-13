# Vibe - 스마트 가계부

Firebase 기반 개인/공유 가계부 웹앱입니다.

이 문서는 **현재 코드 기준**으로 작성되었습니다.

## 핵심 기능

- Google 로그인 (Firebase Auth)
- 가계부(Room) 생성/수정/삭제
- 멤버 초대/수락/거절/취소
- 멤버 권한 관리 (`owner` / `editor` / `viewer`)
- 거래내역 CRUD (월별 서브컬렉션 구조)
- 자산 CRUD + 자산 변경 로그
- 가계부별 2단계 카테고리 관리
- 거래 엑셀 업로드 (`.xlsx`, `.xls`)
- 거래/자산 엑셀 내보내기 (`.xlsx`)
- 대시보드/통계 시각화 (Recharts)
- 민감 데이터 클라이언트 암호화 (AES-256-GCM)
- 반응형 UI + PWA 기초(Service Worker 등록)

## 기술 스택

- React 19 + TypeScript + Vite
- React Router v7
- Zustand
- React Hook Form + Zod
- Tailwind CSS
- Firebase Auth / Firestore
- Recharts
- xlsx

## 실제 프로젝트 구조

```text
src/
├── app/
│   ├── index.tsx
│   └── router.tsx
├── pages/
├── widgets/
├── features/
├── entities/
└── shared/
```

## 데이터 모델 (Firestore)

- `users/{userId}`
- `ledgers/{ledgerId}`
  - `transactions/{YYYY-MM}/items/{transactionId}`
  - `assets/{assetId}`
  - `assetLogs/{logId}`
- `categories/{ledgerId}`
- `invitations/{invitationId}`

## 권한 모델

- `owner`: 모든 권한
- `editor`: 거래/자산/카테고리 편집 가능
- `viewer`: 조회 전용

권한은
- 클라이언트 훅: `src/shared/hooks/useLedgerPermission.ts`
- 서버 규칙: `firestore.rules`
로 함께 제어합니다.

## 암호화

다음 필드는 가계부별 `encryptionKey`로 암호화됩니다.

- 거래: `amount`, `description`, `memo`
- 자산: `name`, `balance`, `memo`
- 자산 로그: `previousBalance`, `newBalance`, `description`

코드: `src/shared/lib/crypto/encryption.ts`

## 실행

요구사항
- Node.js 18+
- pnpm

설치

```bash
pnpm install
```

개발 서버

```bash
pnpm dev
```

빌드

```bash
pnpm build
```

타입 체크

```bash
pnpm type-check
```

린트

```bash
pnpm lint
```

## 환경 변수

`.env`에 아래 값을 설정하세요.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

참고: 코드상 `VITE_FIREBASE_PROJECT_ID`가 비어 있으면 기본값 `kookbomm-expenses`를 사용합니다.

## 현재 구현 기준 제한/주의사항

- 거래 내보내기 UI는 현재 **Excel(`.xlsx`) 고정**입니다.
- 자산 내보내기에서 "자산 변경 이력 포함" 옵션은 존재하지만, 현재는 별도 시트 포함이 미구현입니다.
- 거래 업로드 검증은 현재 마이그레이션 모드로 카테고리/결제수단 검증을 건너뜁니다.

## 관련 문서

- `PROJECT_PLAN.md`: 코드 기반 기획/아키텍처/백로그
- `DEVELOPMENT_STATUS.md`: 현재 구현 상태 체크리스트
- `FIRESTORE_SECURITY_RULES.md`: Firestore 보안 규칙 설명
- `IMPORT_PLAN.md`, `EXPORT_PLAN.md`: import/export 현황 및 개선 계획
- `FSD_MIGRATION_COMPLETE.md`: FSD 전환 완료 보고
