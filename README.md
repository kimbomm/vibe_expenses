# Vibe — 함께 쓰는 가계부

> 가족 · 연인 · 룸메이트와 **하나의 가계부를 같이 쓰되, 돈 정보는 안전하게.**
> 권한별 공유와 클라이언트 암호화를 갖춘 Firebase 기반 가계부 웹앱입니다.

<br>

## 📌 왜 만들었나

엑셀로 가계부를 같이 쓰다 보면 세 가지가 불편했습니다.

1. **공유가 어렵다** — 파일을 주고받다 보면 버전이 꼬이고, 누가 무엇을 바꿨는지 알 수 없다
2. **권한이 없다** — 보기만 해야 하는 사람도 실수로 데이터를 지울 수 있다
3. **민감하다** — 금액과 메모가 그대로 서버에 남는 것이 꺼려진다

Vibe는 **실시간 공유 + 역할별 권한 + 민감 필드 암호화**로 이 문제를 풀었고, 기존 엑셀 데이터를 그대로 옮겨올 수 있도록 엑셀 가져오기 · 내보내기를 지원합니다.

<br>

## 📋 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 형태 | 개인 프로젝트 (기획 · 설계 · 개발) |
| 개발 방식 | 기획 · 기술 선택 · 아키텍처 설계는 직접, 구현은 AI 도구를 활용 |
| 플랫폼 | 반응형 웹 + PWA |

<br>

## ✨ 주요 기능

| 기능 | 설명 |
|---|---|
| **공유 가계부** | 가계부 생성, 멤버 초대 · 수락 · 거절 · 취소 |
| **역할 기반 권한** | `owner` 전체 관리 · `editor` 편집 · `viewer` 조회 전용 |
| **거래 관리** | 거래 CRUD, 월 단위 저장 구조, 캘린더 보기 |
| **자산 관리** | 자산 CRUD, 잔액 변경 이력 자동 기록 |
| **카테고리** | 가계부별 2단계 카테고리 |
| **엑셀 연동** | 거래 업로드(`.xlsx`, `.xls`), 거래 · 자산 내보내기(`.xlsx`) |
| **통계** | 대시보드 요약, 기간별 통계 차트 |
| **암호화** | 금액 · 설명 · 메모를 AES-256-GCM으로 암호화해 저장 |

<br>

## 🛠 기술 스택

| 영역 | 기술 | 선택 이유 |
|---|---|---|
| UI | React 19, TypeScript, Vite 7 | 최신 React와 빠른 개발 서버 |
| 라우팅 | React Router v7 | 보호 라우트, 중첩 레이아웃 |
| 상태 | Zustand, TanStack Query | 클라이언트 상태와 서버 상태를 분리해 관리 |
| 폼 | React Hook Form, Zod | 스키마 기반 입력 검증 |
| 스타일 | Tailwind CSS | 일관된 디자인 토큰, 빠른 반응형 작업 |
| 백엔드 | Firebase Auth, Firestore | 별도 서버 없이 인증 · 데이터 · 접근 규칙 처리 |
| 기타 | Recharts, xlsx | 통계 차트, 엑셀 입출력 |

<br>

## 🏗 아키텍처

**Feature-Sliced Design(FSD)** 으로 레이어를 나눠, 기능 하나를 고칠 때 다른 기능에 영향이 번지지 않도록 했습니다.

```text
src/
├── app/        # 진입점, 라우터
├── pages/      # 라우트 단위 화면 (대시보드, 거래, 자산, 통계, 멤버 ...)
├── widgets/    # 기능을 조합한 UI 블록 (대시보드 요약, 거래 캘린더, 레이아웃)
├── features/   # 사용자 행동 단위 (거래 생성, 멤버 초대, 엑셀 가져오기 · 내보내기 ...)
├── entities/   # 도메인 모델 · API · 스토어 (ledger, transaction, asset, category, user)
└── shared/     # 공통 UI, 훅, 암호화 유틸
```

**Firestore 데이터 모델**

```text
users/{userId}
ledgers/{ledgerId}
  ├── transactions/{YYYY-MM}/items/{transactionId}
  ├── assets/{assetId}
  └── assetLogs/{logId}
categories/{ledgerId}
invitations/{invitationId}
```

<br>

## 💡 설계 결정

### 1. 권한은 화면과 서버에서 이중으로 검증
- 화면: `useLedgerPermission` 훅으로 버튼과 메뉴 노출을 제어
- 서버: `firestore.rules`에서 같은 권한을 다시 검증
- → 화면을 조작해도 권한 밖의 데이터는 읽거나 쓸 수 없음 · [보안 규칙 설명](FIRESTORE_SECURITY_RULES.md)

### 2. 민감한 필드는 저장 전에 암호화
- 가계부별 키로 아래 필드를 AES-256-GCM 암호화
  - 거래: `amount`, `description`, `memo`
  - 자산: `name`, `balance`, `memo`
  - 자산 이력: `previousBalance`, `newBalance`, `description`
- → 데이터베이스가 노출되더라도 금액과 메모는 읽을 수 없음

### 3. 거래는 월 단위 서브컬렉션으로 저장
- `transactions/{YYYY-MM}/items` 구조
- → 가계부 조회의 대부분이 "이번 달" 기준이라는 사용 패턴에 맞춰 조회 범위와 비용을 줄임

### 4. 기존 엑셀 데이터 이관
- 실제로 쓰던 엑셀 가계부를 분석하고 변환하는 마이그레이션 스크립트 작성 (`scripts/migragtion`)
- → 새 서비스로 옮겨도 과거 기록이 끊기지 않도록 함

<br>

## 🚀 실행 방법

```bash
# 요구사항: Node.js 18+, pnpm
cp .env.example .env    # Firebase 프로젝트 설정값 입력
pnpm install
pnpm dev
```

<details>
<summary>기타 명령어</summary>

```bash
pnpm build        # 프로덕션 빌드
pnpm build:check  # 타입 체크 + 빌드
pnpm lint         # 린트
pnpm format       # 코드 포맷
```
</details>

<br>

## 🤖 개발 방식

| 직접 수행 | AI 도구 활용 |
|---|---|
| 문제 정의, 기능 기획, 우선순위 | 컴포넌트 · API 코드 작성 |
| 기술 스택 선정, FSD 아키텍처 설계 | 반복 작업, 마이그레이션 스크립트 |
| 데이터 모델 · 권한 · 암호화 설계 | 문서 초안 |
| 코드 리뷰, 보안 점검, 동작 검증 | |

<br>

## 📝 한계와 다음 계획

- [ ] 자산 내보내기에 변경 이력 시트 포함
- [ ] 엑셀 업로드 시 카테고리 · 결제수단 검증 (현재는 이관 모드로 생략)
- [ ] 오프라인 편집 지원

<br>

## 📚 문서

| 문서 | 내용 |
|---|---|
| [PROJECT_PLAN](PROJECT_PLAN.md) | 기획, 아키텍처, 백로그 |
| [DEVELOPMENT_STATUS](DEVELOPMENT_STATUS.md) | 구현 현황 |
| [FIRESTORE_SECURITY_RULES](FIRESTORE_SECURITY_RULES.md) | 보안 규칙 설명 |
| [FSD_MIGRATION_COMPLETE](FSD_MIGRATION_COMPLETE.md) | FSD 전환 기록 |
| [IMPORT_PLAN](IMPORT_PLAN.md) · [EXPORT_PLAN](EXPORT_PLAN.md) | 엑셀 입출력 설계 |
