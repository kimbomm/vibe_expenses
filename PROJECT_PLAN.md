# Vibe 코드 기반 기획서

이 문서는 저장소의 현재 코드 기준으로 정리한 기획/아키텍처 문서입니다.

## 1. 제품 개요

- 제품명: Vibe
- 유형: 반응형 웹 가계부
- 핵심 개념: 가계부 단위 Room 분리
- 목표: 개인/공유 재무 관리, 권한 기반 협업

## 2. 사용자 시나리오

1. 사용자는 Google 로그인 후 가계부를 생성한다.
2. 가계부에서 거래/자산을 기록한다.
3. 필요 시 이메일로 멤버를 초대해 공동 관리한다.
4. 대시보드/통계에서 월별 흐름을 확인한다.
5. 엑셀로 데이터를 업로드/내보낸다.

## 3. 핵심 도메인

### 3.1 Ledger (Room)

- 멤버/권한/통화/암호화 키의 기준 단위
- 멤버 배열(`members`) + 빠른 조회용 `memberIds`

### 3.2 Transaction

- 경로: `ledgers/{ledgerId}/transactions/{YYYY-MM}/items/{docId}`
- 월 단위 서브컬렉션 구조
- ID는 앱 레벨에서 `{YYYY-MM}_{docId}`로 취급

### 3.3 Asset

- 경로: `ledgers/{ledgerId}/assets/{assetId}`
- 변경 이력은 `assetLogs` 서브컬렉션으로 분리 저장

### 3.4 Category

- 경로: `categories/{ledgerId}`
- 타입: `income`, `expense`, `payment`, `asset`
- 2단계 구조 (`category1 > category2[]`)

### 3.5 Invitation

- 경로: `invitations/{invitationId}`
- 이메일 기반 초대 흐름

## 4. 권한 모델

- `owner`: 전체 권한 (멤버 관리 포함)
- `editor`: 거래/자산/카테고리 수정 가능
- `viewer`: 조회 전용

클라이언트 훅: `useLedgerPermission`
서버 규칙: `firestore.rules`

## 5. 아키텍처

FSD 레이어로 구성됨.

```text
app -> pages -> widgets -> features -> entities -> shared
```

- `app`: 라우팅/앱 부트스트랩
- `pages`: 라우트 단위 화면
- `widgets`: 복합 UI 블록
- `features`: 유스케이스 단위 UI/로직
- `entities`: 도메인 상태/타입/API
- `shared`: 공통 UI/유틸/설정

## 6. 구현 완료 범위

- 인증: Firebase Google Popup
- 가계부: CRUD
- 거래: CRUD + 월별 조회 + 캘린더 표시
- 자산: CRUD + 자산 로그
- 멤버/초대: 생성/수락/거절/취소/권한 변경
- 카테고리: CRUD + 엑셀 업로드
- 내보내기: 거래/자산 엑셀
- 통계: 월별 비교/카테고리 분석/추세 차트
- 암호화: AES-256-GCM (가계부 키 기반)

## 7. 현재 제약사항 (코드 기준)

1. 거래 내보내기 UI는 `.xlsx`만 사용
2. 자산 내보내기의 "로그 포함"은 UI 옵션만 있고 실제 다중 시트 출력은 미구현
3. 거래 업로드는 현재 마이그레이션 모드로 카테고리/결제수단 검증을 스킵
4. 테스트 코드(단위/e2e) 미구축

## 8. 우선 개선 백로그

1. import 검증 모드 분리
- 운영 모드: 카테고리/결제수단 엄격 검증
- 마이그레이션 모드: 선택적으로 완화

2. export 고도화
- CSV 옵션 추가
- 자산 로그 별도 시트 내보내기

3. 보안/운영
- Firestore rules 정밀 검토 및 시뮬레이터 테스트 케이스 문서화
- 암호화 키 저장 정책 보완(회전/복구 전략)

4. 품질
- 도메인 서비스 단위 테스트
- 핵심 사용자 플로우 e2e 테스트

## 9. 비기능 요구

- 반응형: 모바일/태블릿/데스크톱 지원
- 데이터 무결성: 월 경계 이동 시 거래 문서 재배치
- 가시성: 실패 시 사용자 알림(현재는 `alert` 기반)
- 성능: 월 단위 조회 우선

## 10. 참고 파일

- 라우팅: `src/app/router.tsx`
- 보안 규칙: `firestore.rules`
- 암호화: `src/shared/lib/crypto/encryption.ts`
- 거래 API: `src/entities/transaction/api/transactionApi.ts`
- 자산 API: `src/entities/asset/api/assetApi.ts`
