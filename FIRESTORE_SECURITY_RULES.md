# Firestore 보안 규칙 가이드

## 개요

이 문서는 Vibe 가계부 애플리케이션의 Firestore 보안 규칙에 대한 설명입니다.

## 보안 규칙 파일

- **파일 위치**: `firestore.rules`
- **배포 방법**: Firebase Console 또는 Firebase CLI 사용

## 컬렉션별 접근 권한

### 1. users 컬렉션

- **경로**: `/users/{userId}`
- **읽기/쓰기**: 본인만 가능 (`request.auth.uid == userId`)

### 2. ledgers 컬렉션

- **경로**: `/ledgers/{ledgerId}`
- **읽기**: 소유자 또는 멤버만 가능
- **생성**: 인증된 사용자만 가능 (생성자가 소유자가 됨)
- **수정**: 소유자만 가능
- **삭제**: 소유자만 가능

### 3. transactions 컬렉션

- **경로**: `/transactions/{transactionId}`
- **읽기**: 해당 가계부의 멤버만 가능 (Viewer 포함)
- **생성/수정/삭제**: 해당 가계부의 Editor 또는 Owner만 가능

### 4. assets 컬렉션

- **경로**: `/assets/{assetId}`
- **읽기**: 해당 가계부의 멤버만 가능 (Viewer 포함)
- **생성/수정/삭제**: 해당 가계부의 Editor 또는 Owner만 가능

### 5. assetLogs 컬렉션

- **경로**: `/assetLogs/{logId}`
- **읽기**: 해당 가계부의 멤버만 가능
- **생성**: 해당 가계부의 Editor 또는 Owner만 가능
- **수정/삭제**: 불가 (로그는 변경 불가)

### 6. categories 컬렉션

- **경로**: `/categories/{ledgerId}`
- **읽기**: 해당 가계부의 멤버만 가능
- **생성/수정**: 해당 가계부의 Editor 또는 Owner만 가능
- **삭제**: 소유자만 가능

### 7. invitations 컬렉션

- **경로**: `/invitations/{invitationId}`
- **읽기**:
  - 가계부 소유자: 모든 초대 조회 가능
  - 초대받은 사용자: 본인 이메일의 초대만 조회 가능
- **생성**: 가계부 소유자만 가능
- **수정**: 가계부 소유자 또는 초대받은 사용자 (초대 수락/거절)
- **삭제**: 가계부 소유자만 가능

## 권한 구조

### MemberRole

- **owner**: 모든 권한 (삭제, 멤버 관리, 수정)
- **editor**: 수입/지출 추가, 수정, 삭제
- **viewer**: 조회만 가능

## Helper Functions

보안 규칙에서 사용하는 헬퍼 함수들:

- `isAuthenticated()`: 사용자가 인증되었는지 확인
- `getUserId()`: 현재 사용자의 UID 반환
- `isLedgerOwner(ledgerId)`: 사용자가 가계부의 소유자인지 확인
- `isLedgerMember(ledgerId)`: 사용자가 가계부의 멤버인지 확인
- `getMemberRole(ledgerId)`: 사용자의 멤버 권한 반환
- `canEdit(ledgerId)`: 사용자가 수정 권한이 있는지 확인 (Editor 또는 Owner)

## 보안 규칙 배포 방법

### 방법 1: Firebase Console

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택
3. Firestore Database → 규칙 탭
4. `firestore.rules` 파일 내용 복사하여 붙여넣기
5. "게시" 버튼 클릭

### 방법 2: Firebase CLI

```bash
# Firebase CLI 설치 (미설치 시)
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 초기화 (이미 초기화되어 있으면 생략)
firebase init firestore

# 보안 규칙 배포
firebase deploy --only firestore:rules
```

## 주의사항

1. **보안 규칙 테스트**: 배포 전에 Firebase Console의 "규칙 시뮬레이터"에서 테스트하는 것을 권장합니다.
2. **멤버 배열 구조**: `ledgers` 컬렉션의 `members` 필드는 배열이며, 각 요소는 `{userId, email, name, role, joinedAt}` 구조입니다.
3. **실시간 동기화**: 보안 규칙은 실시간 리스너(`onSnapshot`)에도 적용됩니다.

## 문제 해결

### 보안 규칙 오류

- Firebase Console → Firestore Database → 규칙 탭에서 구문 오류 확인
- 규칙 시뮬레이터에서 테스트하여 문제 파악

### 접근 권한 오류

- 사용자가 올바른 가계부 멤버인지 확인
- 멤버의 권한(role)이 적절한지 확인
- `request.auth.uid`와 `resource.data`의 값이 올바른지 확인

## 참고 자료

- [Firestore 보안 규칙 문서](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore 보안 규칙 참조](https://firebase.google.com/docs/reference/rules/rules)
