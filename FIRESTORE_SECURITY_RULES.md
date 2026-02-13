# Firestore 보안 규칙 문서 (코드 기준)

기준 파일: `firestore.rules`

## 1. 컬렉션 구조

- `users/{userId}`
- `ledgers/{ledgerId}`
  - `transactions/{monthKey}/items/{transactionId}`
  - `assets/{assetId}`
  - `assetLogs/{logId}`
- `categories/{ledgerId}`
- `invitations/{invitationId}`

## 2. 주요 헬퍼 함수

- `isAuthenticated()`
- `isLedgerOwner(ledgerId)`
- `isLedgerMember(ledgerId)`
- `canEdit(ledgerId)`

참고: `isMemberEditorOrOwner`는 `members` 배열 인덱스를 0~9까지만 검사합니다.

## 3. 권한 정책 요약

### users

- read/write: 본인만

### ledgers

- read: owner 또는 member
- create: 인증 사용자 + `ownerId == request.auth.uid`
- delete: owner만
- update:
  - owner는 항상 가능
  - 또는 `members`, `memberIds`, `updatedAt`만 변경하는 경우 허용

### transactions (`ledgers/{ledgerId}/transactions/{monthKey}/items/{transactionId}`)

- read: ledger member
- create/update/delete: ledger member + `canEdit`

### assets (`ledgers/{ledgerId}/assets/{assetId}`)

- read: ledger member
- create/update/delete: ledger member + `canEdit`

### assetLogs (`ledgers/{ledgerId}/assetLogs/{logId}`)

- read: ledger member
- create: ledger member + `canEdit`
- update/delete: 불가

### categories (`categories/{ledgerId}`)

- read: ledger member
- create/update: ledger member + `canEdit`
- delete: owner

### invitations (`invitations/{invitationId}`)

- read: ledger owner 또는 초대받은 이메일
- create: ledger owner
- update: ledger owner 또는 초대받은 이메일
- delete: ledger owner

## 4. 운영 시 주의사항

1. `members/memberIds/updatedAt`만 수정하는 ledger update는 owner가 아니어도 규칙상 허용됩니다.
2. `isMemberEditorOrOwner`는 최대 10명 인덱스 기반 검사입니다.
3. 규칙 변경 시 Firebase Rules Simulator로 회귀 테스트를 권장합니다.

## 5. 배포

```bash
pnpm firebase deploy --only firestore:rules
pnpm firebase deploy --only firestore:indexes
```
