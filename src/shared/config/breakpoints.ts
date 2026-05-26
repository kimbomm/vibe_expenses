/** Tailwind `md`와 동일: 768px 이상 = 데스크톱 */
export const DESKTOP_MIN_WIDTH_PX = 768

export const MOBILE_MEDIA_QUERY = `(max-width: ${DESKTOP_MIN_WIDTH_PX - 1}px)`

export const DESKTOP_MEDIA_QUERY = `(min-width: ${DESKTOP_MIN_WIDTH_PX}px)`
