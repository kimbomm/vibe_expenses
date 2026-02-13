# Import 기능 문서 (코드 기준)

## 1. 현재 구현 범위

### 1.1 거래내역 Import

- 진입: 거래내역 페이지의 "일괄 업로드"
- 파일 형식: `.xlsx`, `.xls`
- 시트 처리: 첫 번째 시트만 사용
- 컬럼명 매핑: 한글/영문 컬럼명 지원 (`columnMapper.ts`)
- 파싱: `xlsx` + `sheet_to_json`
- 저장: `useTransactionStore.addTransaction` 경유

필수 필드:
- `type`, `amount`, `date`, `category1`, `category2`, `description`

선택 필드:
- `paymentMethod1`, `paymentMethod2`, `memo`

### 1.2 카테고리 Import

- 진입: 카테고리 관리 페이지의 "카테고리 업로드"
- 파일 형식: `.xlsx`, `.xls`
- 타입: `income`, `expense`, `payment`, `asset` (한글 타입도 허용)
- 반영 방식: 타입별로 업로드 데이터로 교체

## 2. 현재 동작상 주의점

1. 거래 Import 검증 모드
- UI에서 현재 `skipCategoryValidation: true`로 호출
- 즉, 카테고리/결제수단 존재 검증을 건너뜀

2. 카테고리 Import 영향
- 업로드된 타입만 반영됨
- 파일에 누락된 타입은 기존 값 유지
- 업로드된 타입 내부에서는 사실상 덮어쓰기 동작

3. 사용 중 카테고리 경고
- 거래 스토어에 로드된 데이터 기준으로 경고 계산
- 스토어에 없는 과거 데이터는 탐지되지 않을 수 있음

## 3. 처리 흐름

### 거래 Import

1. 파일 선택/드롭
2. Excel 파싱
3. 컬럼 매핑
4. 행 검증
5. 유효 행 일괄 저장 (100건 배치 루프)
6. 결과/오류 표시

### 카테고리 Import

1. 파일 선택/드롭
2. Excel 파싱
3. 행 검증
4. 사용 중 카테고리 경고
5. 타입별 카테고리 저장

## 4. 관련 코드

- `src/features/transaction-import/ui/ImportTransactionContent.tsx`
- `src/shared/lib/import/transactionValidator.ts`
- `src/shared/lib/import/transactionImporter.ts`
- `src/features/category-import/ui/ImportCategoryContent.tsx`
- `src/shared/lib/import/categoryValidator.ts`
- `src/shared/lib/import/categoryImporter.ts`

## 5. 개선 백로그

1. 거래 Import 검증 모드 분리
- 운영 모드(엄격 검증) / 마이그레이션 모드(완화) 토글

2. 대용량 업로드 안정성
- 중단/재시도
- 실패 행 재처리

3. 사용 중 카테고리 검증 강화
- 스토어 기반이 아닌 Firestore 전체 범위 기반 확인
