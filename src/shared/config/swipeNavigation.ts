/**
 * react-swipeable `delta` — 스와이프로 인식되는 최소 이동 거리(px).
 * 값을 키우면 더 길게 밀어야 하고, 줄이면 짧은 제스처에도 반응합니다.
 */

/** 일별 거래 목록: 좌우 스와이프로 날짜 변경 */
export const DAY_SWIPE_MIN_DISTANCE_PX = 60

export const daySwipeDelta = {
  left: DAY_SWIPE_MIN_DISTANCE_PX,
  right: DAY_SWIPE_MIN_DISTANCE_PX,
} as const

/** 거래 캘린더: 좌우 스와이프로 월 변경 */
export const MONTH_SWIPE_MIN_DISTANCE_PX = 60

export const monthSwipeDelta = {
  left: MONTH_SWIPE_MIN_DISTANCE_PX,
  right: MONTH_SWIPE_MIN_DISTANCE_PX,
} as const
