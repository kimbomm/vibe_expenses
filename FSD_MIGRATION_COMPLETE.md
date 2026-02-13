# FSD 마이그레이션 완료 보고서

기준: 현재 코드베이스

## 최종 결과

마이그레이션은 완료되었고, 코드가 FSD 레이어로 운영 중입니다.

```text
src/
├── app/
├── pages/
├── widgets/
├── features/
├── entities/
└── shared/
```

## 레이어별 상태

- app: 라우팅/앱 초기화 분리 완료
- pages: 라우트 단위 조립 레이어로 유지
- widgets: 레이아웃/달력/요약 위젯 분리
- features: 폼, import/export, 권한 보호 기능 분리
- entities: 도메인별 타입/스토어/API 분리
- shared: 공통 UI/유틸/설정/훅/API 정리

## 코드 기준 확인 포인트

- 라우터: `src/app/router.tsx`
- 앱 엔트리: `src/main.tsx`, `src/app/index.tsx`
- 도메인 스토어: `src/entities/*/model/store.ts`
- 공용 유틸: `src/shared/lib/*`

## 남은 작업(구조 관점)

- 구조 마이그레이션 자체는 종료
- 이후 작업은 기능 개선/품질 개선(테스트, 문서, 성능) 중심
