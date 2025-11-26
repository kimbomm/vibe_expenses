# 🏦 Vibe 가계부 - 전체 기획서

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기능 명세](#기능-명세)
3. [기술 스택](#기술-스택)
4. [데이터 구조](#데이터-구조)
5. [화면 구성](#화면-구성)
6. [개발 단계](#개발-단계)
7. [API 설계](#api-설계)

---

## 프로젝트 개요

### 서비스 컨셉

- **이름**: Vibe (가계부)
- **유형**: 반응형 웹 애플리케이션
- **핵심 가치**: 개인/공유 재무 관리, 직관적인 수입/지출 추적
- **아키텍처**: 가계부 = Room 개념 (각 가계부마다 독립적인 데이터 관리)

### 주요 특징

- ✅ 개인 및 공유 가계부 지원 (Room 개념)
- ✅ 가계부별 독립적인 거래, 자산, 카테고리 관리
- ✅ 실시간 동기화 (멤버 간)
- ✅ 직관적인 캘린더 뷰
- ✅ 자산 현황 관리 (수입/지출과 독립적)
- ✅ 대시보드에 통계 및 차트 통합
- ✅ 년도/월 필터링으로 과거 데이터 분석

---

## 기능 명세

### 1. 인증 시스템

#### 1.1 구글 로그인 및 회원가입

- **OAuth 2.0** 기반 구글 인증 (Popup 방식)
- 첫 로그인 시 자동 회원가입 (Firestore에 사용자 정보 저장)
- 사용자 프로필 정보 저장
  - uid (Firebase Auth UID)
  - email
  - displayName
  - photoURL
  - emailVerified
  - createdAt (가입일시)
  - lastLoginAt (마지막 로그인 시간)
  - updatedAt (마지막 업데이트 시간)

#### 1.2 세션 관리

- Firebase Auth 기반 인증
- `onAuthStateChanged`로 자동 로그인 유지
- 로그아웃 기능

**현재 상태**: ✅ Firebase Auth + Firestore 연동 완료

---

### 2. 가계부 관리 (Room 개념)

#### 2.1 가계부 = Room 개념

**핵심 설계**:

- 각 가계부는 **독립적인 Room**으로 동작
- 각 Room마다 독립적인 데이터 관리:
  - 거래 내역 (Transaction)
  - 자산 현황 (Asset)
  - 카테고리 설정 (Categories)
- Room 간 데이터 공유 없음 (완전 분리)

#### 2.2 가계부 생성

**데이터 구조**:

- 가계부 정보: 이름, 설명, 통화, 생성자 ID, 생성/수정일시
- 멤버 정보: 사용자 ID, 이메일, 이름, 권한(owner/editor/viewer), 가입일시

**기능**:

- ✅ 가계부 이름 및 설명 설정
- ✅ 통화 단위 선택
- ✅ 여러 개의 가계부 생성 가능
- ✅ 가계부 목록 조회
- ✅ 가계부 수정/삭제 (더미 데이터)
- ✅ 가계부 생성 시 기본 카테고리 자동 초기화

#### 2.2 가계부 초대(공유)

**권한 구조**:

- **Owner**: 모든 권한 (삭제, 멤버 관리, 수정)
- **Editor**: 수입/지출 추가, 수정, 삭제
- **Viewer**: 조회만 가능

**초대 방식**:

- 이메일 기반 초대
- 초대 링크 생성 (유효기간 24시간)
- 초대 승인/거절 기능
- 멤버 권한 변경 (Owner만 가능)
- 멤버 강제 퇴출 (Owner만 가능)

**현재 상태**: 미구현 (Firebase 연동 후 구현 예정)

---

### 3. 자산 현황

#### 3.1 데이터 구조

- **자산 정보**: ID, 가계부 ID, 자산명, 카테고리(1단계/2단계), 잔액, 통화, 메모, 활성화 여부, 생성/수정일시, 생성자
- **자산 로그**: ID, 자산 ID, 가계부 ID, 로그 타입(생성/수정/비활성화/재활성화/잔액변경), 이전/현재 잔액, 설명, 생성일시, 생성자

#### 3.2 카테고리 구조 (2단계)

- **현금성자산**: 현금, 입출금 계좌, 저축 예금, 청약 저축
- **투자자산**: 주식, 펀드, 채권, 암호화폐, 부동산
- **부채**: 신용카드, 대출, 할부, 기타 부채

#### 3.3 기능

- ✅ 자산 등록/수정/삭제/비활성화 (더미 데이터)
- ✅ 자산별 현재 잔액 표시
- ✅ 2단계 카테고리별 자산 그룹핑
- ✅ 총 자산 집계 (자산 - 부채)
- ✅ 자산 변동 히스토리 (변경 이력 로그)
- ✅ 자산 현황 차트 (구현 예정)

**주의**: 자산 현황은 수입/지출과 **연동되지 않음** (독립적 관리)

---

### 4. 카테고리 관리

#### 4.1 카테고리 타입

- **수입 카테고리**: 수입 거래에 사용되는 카테고리
- **지출 카테고리**: 지출 거래에 사용되는 카테고리
- **지출방법**: 지출 시 사용한 결제 수단
- **자산 카테고리**: 자산 분류에 사용되는 카테고리

#### 4.2 카테고리 구조

- 모든 카테고리는 **2단계 구조**로 구성
- 1단계 카테고리: 대분류 (예: "식비", "교통")
- 2단계 카테고리: 소분류 (예: "외식", "배달")
- **가계부별 독립 관리**: 각 가계부(Room)마다 독립적인 카테고리 설정

#### 4.3 기능

- ✅ 가계부별 카테고리 관리 (각 가계부마다 독립적인 카테고리)
- ✅ 1단계 카테고리 추가/수정/삭제
- ✅ 2단계 카테고리 추가/수정/삭제
- ✅ 카테고리별 접기/펼치기
- ✅ 인라인 편집
- ✅ 실시간 반영 (폼 드롭다운에 즉시 적용)
- ✅ 안전한 삭제 (확인 다이얼로그)
- ✅ 가계부 생성 시 기본 카테고리 자동 초기화

**현재 상태**: 구현 완료 (더미 데이터)
**접근 경로**: `/ledgers/:ledgerId/settings/categories`

---

### 5. 수입/지출 관리

#### 5.1 데이터 구조

- **거래 정보**: ID, 가계부 ID, 타입(수입/지출), 금액, 거래일, 카테고리(1단계/2단계), 지출방법(1단계/2단계, 지출일 때만), 내역, 메모, 생성/수정일시, 생성자/수정자

#### 5.2 카테고리 구조 (2단계)

**수입 카테고리**:

- **급여소득**: 월급, 상여금, 성과급, 야근수당
- **사업소득**: 프리랜서, 부업, 사업 매출
- **재산소득**: 이자, 배당, 임대료
- **기타소득**: 용돈, 선물, 환급, 기타

**지출 카테고리**:

- **식비**: 외식, 배달, 장보기, 카페/디저트
- **교통**: 대중교통, 택시, 주유, 통행료, 주차
- **주거/통신**: 월세/관리비, 인터넷, 휴대폰, 공과금
- **생활**: 생필품, 의류, 미용, 의료
- **문화/여가**: 영화/공연, 여행, 취미, 구독 서비스
- **교육**: 학원, 도서, 강의
- **경조사**: 결혼, 돌잔치, 장례
- **기타**: 세금, 보험, 기타

**지출방법 카테고리** (2단계):

- **현금**: 현금
- **체크카드**: 신한, 국민, 하나, 우리, 기타
- **신용카드**: 신한, 국민, 하나, 우리, 삼성, 현대, 롯데, 기타
- **계좌이체**: 은행 이체
- **간편결제**: 카카오페이, 네이버페이, 토스, 페이코, 기타

#### 5.3 기능

- ✅ 수입/지출 등록/수정/삭제 (더미 데이터)
  - 금액 입력
  - 날짜 선택 (캘린더)
  - 2단계 카테고리 선택
  - 지출 시 지출방법 2단계 선택
  - 내역 및 메모 작성
- ✅ 필터링 기능
  - 기간별 (일/주/월/년/커스텀)
  - 수입/지출 분류
  - 카테고리별
  - 지출방법별
- ✅ 정렬 (날짜순, 금액순)
- ✅ 검색 (내역, 메모) - 구현 예정
- ✅ 캘린더 뷰 (월별, 주 단위 강조)
- ✅ 리스트 뷰 (일 단위)

#### 5.4 통계 및 시각화

**대시보드** (`/ledgers/:id/dashboard`):

- ✅ 년도/월 필터링 (데이터 범위 내에서만 선택 가능)
- ✅ 기간별 요약 (총 수입/지출/순 수입)
- ✅ 카테고리별 지출 파이 차트 (Recharts)
- ✅ 카테고리별 지출 상세 (진행바 + 비율)
- ✅ 가계부 정보

**통계 페이지** (`/ledgers/:id/statistics`) - 디테일한 분석:

- ✅ 년도/월 필터링 (데이터 범위 내에서만 선택 가능)
- ✅ 기간별 비교 분석
  - 전월 대비 증감율 (수입/지출/순 수입)
  - 전년 동월 대비 증감율
  - 증감 방향 아이콘 표시
- ✅ 월별 트렌드 분석
  - 최근 6개월 라인 차트
  - 수입/지출/순 수입 추이 시각화
- ✅ 지출방법별 분석
  - 지출방법별 파이 차트
  - 지출방법별 상세 (금액, 비율, 진행바)
- ✅ 수입 카테고리 분석
  - 수입 카테고리별 파이 차트
  - 수입 카테고리별 상세 (금액, 비율, 진행바)
- ✅ 요일별 패턴 분석
  - 요일별 평균 지출 바 차트
  - 요일별 총액, 건수, 평균 표시
- ✅ Top 5 거래 내역
  - Top 5 지출 내역
  - Top 5 수입 내역
  - 거래 상세 정보 (카테고리, 지출방법, 날짜)
- ✅ 통계 지표
  - 평균 일일 지출/수입
  - 최대 지출/수입 및 날짜
  - 총 거래 건수

---

## 기술 스택

### Frontend

- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구 (빠른 HMR)
- **React Router v7** - 클라이언트 라우팅
- **Tailwind CSS v3.4.18** - 유틸리티 우선 CSS
- **Lucide React** - 아이콘

### 상태 관리

- **Zustand** - 글로벌 상태 (구현 완료)
- **TanStack Query** - 서버 상태 (Firebase 연동 시 사용 예정)

### 폼 & 유효성 검사

- **React Hook Form** - 폼 관리 (구현 완료)
- **Zod** - 스키마 유효성 검사 (구현 완료)

### 차트

- **Recharts** - 데이터 시각화 (설치 완료, 구현 예정)

### 기타

- **date-fns** - 날짜 처리
- **clsx + tailwind-merge** - 클래스 병합

### Backend (예정)

- **Firebase Auth** - 인증 (Google OAuth)
- **Firestore** - NoSQL 데이터베이스
- **Firebase Storage** - 파일 저장 (프로필 이미지 등)
- **Cloud Functions** - 서버리스 함수 (이메일 발송 등)

### 배포

- **Vercel** - 프론트엔드 호스팅
- **Firebase Hosting** - 대안 옵션

---

## 데이터 구조

### Firestore 컬렉션 구조

```
users/
  {userId}/
    - email
    - name
    - profileImage
    - createdAt

ledgers/
  {ledgerId}/
    - name
    - description
    - currency
    - ownerId
    - members[]
    - createdAt
    - updatedAt

assets/
  {assetId}/
    - ledgerId
    - name
    - category1
    - category2
    - balance
    - currency
    - memo
    - isActive
    - createdAt
    - updatedAt
    - createdBy

transactions/
  {transactionId}/
    - ledgerId
    - type
    - amount
    - date
    - category1
    - category2
    - paymentMethod1
    - paymentMethod2
    - description
    - memo
    - createdAt
    - createdBy
    - updatedBy

assetLogs/
  {logId}/
    - assetId
    - ledgerId
    - type
    - previousBalance
    - newBalance
    - description
    - createdAt
    - createdBy

invitations/
  {invitationId}/
    - ledgerId
    - email
    - role
    - token
    - status (pending/accepted/rejected)
    - expiresAt
    - createdAt

categories/
  {ledgerId}/
    - incomeCategories: Record<string, string[]>
    - expenseCategories: Record<string, string[]>
    - paymentMethods: Record<string, string[]>
    - assetCategories: Record<string, string[]>
    - updatedAt
```

**주의**: 카테고리는 가계부별로 독립적으로 관리됨

### 인덱스 설계

- `transactions`: ledgerId + date (DESC)
- `transactions`: ledgerId + type + date
- `assets`: ledgerId + isActive
- `invitations`: email + status
- `categories`: ledgerId (가계부별 카테고리 조회)

---

## 화면 구성

### 인증 페이지

- `/login` - 로그인 (구글 OAuth 버튼)
- `/signup` - 회원가입 (OAuth 자동 처리)

### 메인 페이지

- `/` - 가계부 목록으로 리다이렉트
- `/ledgers` - 가계부 목록 ✅
  - 가계부 카드 목록
  - 가계부 생성 버튼
  - 가계부별 카테고리 설정 버튼

### 가계부 관련 (Room 개념)

- `/ledgers` - 가계부 목록 ✅
- `/ledgers/new` - 가계부 생성 (모달로 구현) ✅
- `/ledgers/[id]/dashboard` - 가계부별 대시보드 ✅
  - 년도/월 필터링 (데이터 범위 내에서만 선택 가능)
  - 요약 카드 (총 수입/지출/순 수입)
  - 카테고리별 지출 파이 차트 ✅
  - 카테고리별 지출 상세 (진행바 + 비율) ✅
  - 가계부 정보
- `/ledgers/[id]/settings` - 가계부 설정
  - 기본 정보 수정
  - 멤버 관리
  - 초대 링크 생성
  - 가계부 삭제
- `/ledgers/[id]/settings/categories` - 가계부별 카테고리 관리 ✅
  - 수입 카테고리 관리 (1단계/2단계)
  - 지출 카테고리 관리 (1단계/2단계)
  - 지출방법 카테고리 관리 (1단계/2단계)
  - 자산 카테고리 관리 (1단계/2단계)
  - **각 가계부마다 독립적인 카테고리 설정**

### 자산 관련

- `/ledgers/[id]/assets` - 자산 현황 ✅
  - 자산 목록
  - 자산 추가/수정 모달 ✅
  - 카테고리별 차트
  - 총 자산 요약
  - 변경 이력 로그 ✅

### 수입/지출 관련

- `/ledgers/[id]/transactions` - 수입/지출 내역 ✅
  - 캘린더 뷰 (월별, 주 단위 강조) ✅
  - 거래 목록 (무한 스크롤)
  - 거래 추가 버튼 (플로팅)
  - 필터/검색 기능 ✅
  - 거래 추가/수정/삭제 (모달) ✅
- `/ledgers/[id]/transactions/new` - 거래 등록 (모달로 구현) ✅
- `/ledgers/[id]/transactions/[transactionId]` - 거래 상세/수정 (모달로 구현) ✅
- `/ledgers/[id]/statistics` - 통계 분석 페이지 ✅
  - 기간별 비교 분석 (전월 대비, 전년 동월 대비)
  - 월별 트렌드 (최근 6개월 라인 차트)
  - 지출방법별 분석 (파이 차트 + 상세)
  - 수입 카테고리 분석 (파이 차트 + 상세)
  - 요일별 패턴 분석 (바 차트)
  - Top 5 거래 내역 (지출/수입)
  - 통계 지표 (평균, 최대값, 총 건수)

### 설정

- `/settings` - 사용자 설정 ✅
  - 프로필 관리
  - 앱 설정 (다크 모드, 통화 설정)
  - 계정 관리 (데이터 내보내기, 계정 삭제)

---

## 개발 단계

### Phase 1: UI 구현 (완료) ✅

1. ✅ 프로젝트 셋업 (Vite + React)
2. ✅ 구글 OAuth UI (더미)
3. ✅ 가계부 CRUD UI
4. ✅ 수입/지출 CRUD UI
5. ✅ 가계부별 대시보드 (년도/월 필터링)
6. ✅ 캘린더 뷰
7. ✅ 자산 현황 UI
8. ✅ 통계 차트 (대시보드 통합)

### Phase 2: 더미 데이터 CRUD (완료) ✅

1. ✅ Zustand 상태 관리 설정
2. ✅ 거래 추가/수정/삭제
3. ✅ 자산 추가/수정/삭제
4. ✅ 가계부 추가/수정/삭제
5. ✅ 가계부별 카테고리 관리 (추가/수정/삭제)
6. ✅ 실시간 UI 업데이트
7. ✅ 가계부별 독립 데이터 관리 (Room 개념 구현)

### Phase 3: Firebase 연동 (다음 단계)

1. ⏳ Firebase 프로젝트 설정
2. ⏳ Firebase Auth (Google OAuth) 연동
3. ⏳ Firestore 데이터베이스 연동
4. ⏳ Security Rules 설정
5. ⏳ 실시간 동기화 구현

### Phase 4: 고급 기능

1. ⏳ 가계부 공유 및 초대
2. ⏳ 고급 필터링 및 검색
3. ✅ 차트 시각화 (Recharts) - 대시보드 및 통계 페이지 완료
4. ✅ 통계 페이지 디테일 분석 기능 완료
   - 기간별 비교 분석
   - 월별 트렌드 (라인 차트)
   - 지출방법별 분석
   - 수입 카테고리 분석
   - 요일별 패턴 분석
   - Top 5 거래 내역
   - 통계 지표
5. ⏳ 데이터 내보내기 (CSV, Excel)
6. ⏳ PWA 지원
7. ⏳ 다크 모드

---

## API 설계 (Firebase 연동 시)

### 인증 API

```
POST /auth/google
GET  /auth/me
POST /auth/logout
```

### 가계부 API

```
GET    /ledgers
POST   /ledgers
GET    /ledgers/:id
PUT    /ledgers/:id
DELETE /ledgers/:id
POST   /ledgers/:id/invite
GET    /ledgers/:id/members
PUT    /ledgers/:id/members/:userId
DELETE /ledgers/:id/members/:userId
```

### 거래 API

```
GET    /ledgers/:id/transactions
POST   /ledgers/:id/transactions
GET    /ledgers/:id/transactions/:transactionId
PUT    /ledgers/:id/transactions/:transactionId
DELETE /ledgers/:id/transactions/:transactionId
```

### 자산 API

```
GET    /ledgers/:id/assets
POST   /ledgers/:id/assets
GET    /ledgers/:id/assets/:assetId
PUT    /ledgers/:id/assets/:assetId
DELETE /ledgers/:id/assets/:assetId
GET    /ledgers/:id/assets/:assetId/logs
```

### 통계 API

```
GET    /ledgers/:id/statistics/summary
GET    /ledgers/:id/statistics/by-category
GET    /ledgers/:id/statistics/by-payment-method
GET    /ledgers/:id/statistics/trends
```

### 카테고리 API (가계부별)

```
GET    /ledgers/:id/categories/:type
POST   /ledgers/:id/categories/:type
PUT    /ledgers/:id/categories/:type/:category1
DELETE /ledgers/:id/categories/:type/:category1
POST   /ledgers/:id/categories/:type/:category1/:category2
PUT    /ledgers/:id/categories/:type/:category1/:category2
DELETE /ledgers/:id/categories/:type/:category1/:category2
```

**카테고리 타입**: `income`, `expense`, `payment`, `asset`
**주의**: 모든 카테고리는 가계부별로 독립적으로 관리됨

---

## UI/UX 설계 방향

### 반응형 디자인

- **모바일 우선** (Mobile First)
- **브레이크포인트**:
  - Mobile: < 640px
  - Tablet: 640px ~ 1024px
  - Desktop: > 1024px

### 디자인 시스템

- **컬러 팔레트**:
  - Primary: 청록색 계열 (174 62% 47%)
  - Success: 초록색 (수입)
  - Danger: 빨간색 (지출)
- **타이포그래피**: Noto Sans KR
- **컴포넌트**: shadcn/ui 스타일

### 주요 UX 패턴

- ✅ 빠른 거래 등록: 플로팅 버튼 (모바일)
- ✅ 캘린더 뷰: 월별/주별 시각화
- ✅ 가계부 선택 시 동적 메뉴: Sidebar에서 가계부 선택 시 해당 가계부의 하위 메뉴 자동 표시
- ✅ 년도/월 필터링: 데이터 범위 내에서만 선택 가능 (시작 년도 이전 접근 불가)
- ✅ 모바일/PC 분기 처리: 폼 입력 시 PC는 모달, 모바일은 전체 페이지로 이동
  - 거래 추가/수정: `/ledgers/:ledgerId/transactions/new`, `/ledgers/:ledgerId/transactions/:id/edit`
  - 자산 추가/수정: `/ledgers/:ledgerId/assets/new`, `/ledgers/:ledgerId/assets/:id/edit`
  - 가계부 추가/수정: `/ledgers/new`, `/ledgers/:id/edit`
- ✅ 모바일 페이지 하단 고정 버튼: 취소/저장 버튼 하단 고정
- ✅ Sidebar 상태 유지: localStorage를 사용한 마지막 선택 가계부 기억
- ⏳ 무한 스크롤: 거래 내역 로딩 (구현 예정)
- ⏳ 토스트 알림: 성공/에러 피드백 (구현 예정)
- ⏳ 스켈레톤 로딩: 데이터 로딩 중 (구현 예정)

---

## 보안 고려사항

- **인증/인가**: Firebase Auth JWT 토큰
- **데이터 접근 제어**: Firestore Security Rules
- **XSS 방지**: Input sanitization
- **CSRF 방지**: Firebase 내장 보안
- **환경 변수**: .env 파일 관리
- **HTTPS**: 배포 시 필수

---

## 성능 최적화

- **코드 스플리팅**: Dynamic import
- **이미지 최적화**: Next.js Image component (Vite에서는 다른 방법)
- **캐싱**: TanStack Query
- **번들 사이즈 최적화**: Tree shaking
- **SSR/ISR**: Vite는 CSR이지만, 필요 시 SSR 추가 가능

---

## 배포 전략

### 개발 환경

- 로컬 개발: `pnpm dev`
- 프리뷰: `pnpm preview`

### 프로덕션 배포

1. **Vercel** (추천)
   - Git 연동 자동 배포
   - 프리뷰 배포
   - Edge Functions
2. **Firebase Hosting** (대안)
   - Firebase 통합
   - CDN 글로벌 배포

---

## 참고 문서

- [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md) - 현재 개발 현황
- [README.md](./README.md) - 프로젝트 소개 및 시작 가이드

---

## 마지막 업데이트

- 날짜: 2024-12-19
- 버전: 1.3.0
- 상태: Phase 2 완료, 모바일/PC 분기 처리 완료, Phase 3 준비 중

## 주요 아키텍처 변경사항

### 가계부 = Room 개념

- 각 가계부는 독립적인 Room으로 동작
- Room별로 독립적인 데이터 관리:
  - 거래 내역 (Transaction)
  - 자산 현황 (Asset)
  - 카테고리 설정 (Categories)
- Room 간 데이터 공유 없음

### 대시보드 및 통계 페이지 역할 분리

**대시보드** (`/ledgers/:id/dashboard`):

- 빠른 현황 파악을 위한 요약 정보
- 년도/월 필터링 기능
- 카테고리별 지출 파이 차트 및 상세
- 가계부 정보

**통계 페이지** (`/ledgers/:id/statistics`):

- 심화 분석 및 트렌드 분석
- 기간별 비교 분석 (전월 대비, 전년 동월 대비)
- 월별 트렌드 (최근 6개월 라인 차트)
- 지출방법별 분석
- 수입 카테고리 분석
- 요일별 패턴 분석
- Top 5 거래 내역
- 통계 지표 (평균, 최대값 등)

### 네비게이션 구조

- Sidebar에서 가계부 선택 시 해당 가계부의 하위 메뉴 자동 표시
- 가계부별 독립적인 메뉴 구조
