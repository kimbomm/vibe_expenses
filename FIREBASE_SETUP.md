# Firebase 설정 가이드

## 1. Firebase Console 접속

1. [Firebase Console](https://console.firebase.google.com) 접속
2. 프로젝트 선택: `kookbomm-expenses` (또는 새로 생성)

## 2. 웹 앱 설정 확인/추가

### 기존 앱이 있는 경우

1. 프로젝트 설정 (톱니바퀴 아이콘) > 일반 탭
2. "내 앱" 섹션에서 웹 앱 선택
3. 설정값 복사

### 새로 앱을 추가하는 경우

1. 프로젝트 개요 > 웹 앱 추가 (</> 아이콘)
2. 앱 닉네임 입력 (예: "vibe-web")
3. "Firebase Hosting도 설정" 체크 해제 (선택사항)
4. 앱 등록
5. 설정값 복사

## 3. 환경 변수 설정

`.env` 파일을 열고 Firebase Console에서 복사한 값들을 입력하세요:

```env
VITE_FIREBASE_API_KEY=AIza... (복사한 값)
VITE_FIREBASE_AUTH_DOMAIN=kookbomm-expenses.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kookbomm-expenses
VITE_FIREBASE_STORAGE_BUCKET=kookbomm-expenses.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789 (복사한 값)
VITE_FIREBASE_APP_ID=1:123456789:web:abc123 (복사한 값)
```

## 4. Google 인증 활성화

1. Firebase Console > Authentication
2. "시작하기" 클릭 (처음인 경우)
3. "Sign-in method" 탭
4. "Google" 제공업체 선택
5. "사용 설정" 토글 ON
6. 프로젝트 지원 이메일 선택
7. "저장" 클릭

## 5. 승인된 도메인 설정

1. Authentication > Settings > 승인된 도메인
2. 다음 도메인들이 자동으로 추가되어 있어야 합니다:
   - `localhost` (개발용)
   - `kookbomm-expenses.firebaseapp.com` (Firebase Hosting)
3. 배포 도메인 추가 (필요한 경우)

## 6. 테스트

1. 개발 서버 실행: `pnpm dev`
2. 브라우저에서 `http://localhost:5173` 접속
3. "Google로 시작하기" 버튼 클릭
4. Google 계정 선택 및 로그인

## 문제 해결

### "Firebase: Error (auth/unauthorized-domain)" 에러

- Authentication > Settings > 승인된 도메인에서 현재 도메인 추가

### "Firebase: Error (auth/popup-blocked)" 에러

- 브라우저 팝업 차단 해제

### 환경 변수가 적용되지 않는 경우

- 개발 서버 재시작: `pnpm dev`
- 브라우저 캐시 삭제

## 참고

- `.env` 파일은 Git에 커밋하지 마세요 (이미 .gitignore에 추가됨)
- 프로덕션 배포 시에도 환경 변수 설정 필요
- Firebase Console에서 API 키 제한 설정 가능 (보안 강화)
