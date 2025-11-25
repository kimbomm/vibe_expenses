# 🏦 Vibe - 스마트 가계부

반응형 웹 기반 개인/공유 가계부 애플리케이션

## 🚀 기술 스택

### Frontend

- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구 (빠른 HMR)
- **React Router v7** - 클라이언트 라우팅
- **Tailwind CSS** - 유틸리티 우선 CSS
- **Lucide React** - 아이콘

### 상태 관리

- **Zustand** - 글로벌 상태 (구현 완료)
- **TanStack Query** - 서버 상태 (예정)

### 폼 & 유효성 검사

- **React Hook Form** - 폼 관리 (구현 완료)
- **Zod** - 스키마 유효성 검사 (구현 완료)

### 차트

- **Recharts** - 데이터 시각화 (예정)

### 기타

- **date-fns** - 날짜 처리
- **clsx + tailwind-merge** - 클래스 병합

## 📁 프로젝트 구조

```
src/
├── components/        # React 컴포넌트
│   ├── ui/           # 기본 UI 컴포넌트 (Button, Card 등)
│   ├── layout/       # 레이아웃 컴포넌트 (Header, Sidebar 등)
│   ├── ledger/       # 가계부 관련 컴포넌트
│   ├── transaction/  # 거래 관련 컴포넌트
│   ├── asset/        # 자산 관련 컴포넌트
│   └── common/       # 공통 컴포넌트
│
├── pages/            # 페이지 컴포넌트
│   ├── auth/         # 로그인/회원가입
│   ├── dashboard/    # 대시보드
│   ├── ledgers/      # 가계부 목록
│   ├── transactions/ # 거래 내역
│   ├── assets/       # 자산 현황
│   ├── statistics/   # 통계
│   └── settings/     # 설정
│
├── lib/              # 유틸리티 및 헬퍼
│   ├── utils/        # 유틸 함수
│   ├── hooks/        # 커스텀 훅
│   └── mocks/        # 더미 데이터 (개발용)
│
├── hooks/            # 도메인별 커스텀 훅
├── stores/           # Zustand 스토어
├── types/            # TypeScript 타입
├── constants/        # 상수 (카테고리, 통화 등)
├── services/         # API 서비스 레이어
│
├── router.tsx        # 라우터 설정
├── App.tsx           # 메인 앱
└── main.tsx          # 엔트리 포인트
```

## 🎨 주요 기능

### ✅ 구현 완료 (UI)

- [x] 로그인 페이지
- [x] 대시보드
- [x] 가계부 목록
- [x] 거래 내역 (수입/지출)
- [x] 자산 현황
- [x] 통계 대시보드
- [x] 반응형 레이아웃 (모바일/태블릿/데스크톱)

### 🔜 예정

- [ ] Firebase 인증 연동
- [ ] Firestore 데이터베이스 연동
- [ ] 거래 추가/수정/삭제
- [ ] 자산 추가/수정/삭제
- [ ] 가계부 초대 및 공유
- [ ] 필터링 및 검색
- [ ] 차트 시각화
- [ ] 데이터 내보내기 (CSV, Excel)
- [ ] PWA 지원
- [ ] 다크 모드

## 🚦 시작하기

### 요구사항

- Node.js 18+
- pnpm 8+

### 설치

```bash
# 의존성 설치
pnpm install
```

### 개발 서버 실행

```bash
# 개발 모드
pnpm dev

# 브라우저에서 http://localhost:5173 열기
```

### 빌드

```bash
# 프로덕션 빌드
pnpm build

# 빌드 미리보기
pnpm preview
```

### 코드 품질

```bash
# 린트 검사
pnpm lint

# 타입 체크
pnpm type-check

# 포맷팅
pnpm format
```

## 📝 개발 단계

### Phase 1: UI 구현 (현재) ✅

- 더미 데이터를 사용한 UI 구현
- 반응형 디자인
- 기본 페이지 및 컴포넌트

### Phase 2: Firebase 연동 (다음)

- Firebase 프로젝트 설정
- Authentication (Google OAuth)
- Firestore 데이터베이스
- Security Rules

### Phase 3: 핵심 기능

- CRUD 기능 완성
- 실시간 동기화
- 가계부 공유 및 초대

### Phase 4: 고급 기능

- 차트 및 통계
- 필터링 및 검색
- 데이터 내보내기
- PWA 기능

## 🎯 카테고리 구조

### 수입 카테고리

- 급여소득: 월급, 상여금, 성과급, 야근수당
- 사업소득: 프리랜서, 부업, 사업 매출
- 재산소득: 이자, 배당, 임대료
- 기타소득: 용돈, 선물, 환급, 기타

### 지출 카테고리

- 식비: 외식, 배달, 장보기, 카페/디저트
- 교통: 대중교통, 택시, 주유, 통행료, 주차
- 주거/통신: 월세/관리비, 인터넷, 휴대폰, 공과금
- 생활: 생필품, 의류, 미용, 의료
- 문화/여가: 영화/공연, 여행, 취미, 구독 서비스
- 교육: 학원, 도서, 강의
- 경조사: 결혼, 돌잔치, 장례
- 기타: 세금, 보험, 기타

### 자산 카테고리

- 현금성자산: 현금, 입출금 계좌, 저축 예금, 청약 저축
- 투자자산: 주식, 펀드, 채권, 암호화폐, 부동산
- 부채: 신용카드, 대출, 할부, 기타 부채

## 📄 라이선스

MIT

## 👨‍💻 개발자

[@iljin](https://github.com/iljin)
