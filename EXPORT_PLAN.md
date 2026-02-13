# Export 기능 문서 (코드 기준)

## 1. 현재 구현 범위

### 1.1 거래내역 Export

- 진입: 거래내역 페이지 "내보내기"
- 형식: **Excel(`.xlsx`) 고정**
- 필터:
  - 전체
  - 월 단위
  - 연 단위
  - 커스텀 기간(월 범위)
- 월 키 생성 후 Firestore에서 해당 월 데이터 조회
- 복호화 후 엑셀 다운로드

### 1.2 자산 Export

- 진입: 자산 페이지 "내보내기"
- 형식: **Excel(`.xlsx`)**
- 옵션:
  - 비활성 자산 포함
  - 자산 변경 이력 포함(옵션 존재)

## 2. 현재 동작상 주의점

1. 거래 Export
- CSV 옵션은 현재 UI/로직에서 사용하지 않음
- 생성 파일은 한글 헤더 기반 `.xlsx`

2. 자산 Export
- "자산 변경 이력 포함" 체크는 데이터 조회에는 반영되지만,
  현재 파일은 자산 시트만 내려감 (로그 별도 시트 미구현)

3. 전체 범위 조회
- 월 목록 조회 실패 시 스토어 데이터 기반 폴백 사용
- 스토어에 없는 월은 누락될 수 있음

## 3. 처리 흐름

### 거래 Export

1. 필터 선택
2. 월 키 목록 생성/조회
3. 월별 거래 조회
4. 복호화
5. 헤더 매핑 및 포맷 변환
6. 엑셀 생성/다운로드

### 자산 Export

1. 옵션 선택
2. 자산 조회 (필요 시 로그 조회)
3. 복호화
4. 엑셀 생성/다운로드

## 4. 관련 코드

- `src/features/transaction-export/ui/ExportTransactionContent.tsx`
- `src/shared/lib/export/transactionExporter.ts`
- `src/features/asset-export/ui/ExportAssetContent.tsx`
- `src/shared/lib/export/assetExporter.ts`
- `src/shared/lib/export/excelGenerator.ts`

## 5. 개선 백로그

1. 거래 CSV 내보내기 옵션 복구
2. 자산 내보내기 멀티시트 구현 (자산 + 로그)
3. 대용량 기간 조회 시 청크/스트리밍 개선
4. 파일 생성 실패 원인 노출 강화
