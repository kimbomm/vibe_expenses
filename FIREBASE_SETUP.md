# Firebase 설정 가이드 (코드 기준)

## 1. 필수 환경 변수

`.env`에 아래 값을 설정합니다.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

주의: `VITE_FIREBASE_PROJECT_ID`가 비어 있으면 코드에서 `kookbomm-expenses`를 기본값으로 사용합니다.

## 2. Firebase Console 설정

1. Authentication > Sign-in method > Google 활성화
2. Authentication > Settings > 승인된 도메인에 개발/배포 도메인 등록
3. Firestore Database 생성
4. `firestore.rules`, `firestore.indexes.json` 배포

## 3. 로컬 실행

```bash
pnpm install
pnpm dev
```

## 4. 배포 관련 명령

```bash
pnpm build
pnpm deploy
pnpm deploy:preview
```

규칙/인덱스만 배포 시:

```bash
pnpm firebase deploy --only firestore:rules
pnpm firebase deploy --only firestore:indexes
```

## 5. 트러블슈팅

- `auth/unauthorized-domain`: 승인된 도메인 추가
- `auth/popup-blocked`: 브라우저 팝업 차단 해제
- 환경변수 변경 후 반영 안 됨: 개발 서버 재시작
