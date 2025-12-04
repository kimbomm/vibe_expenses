import { DEFAULT_LIABILITY_CATEGORY_KEY } from '@/constants/categories'
import { getDefaultCategories } from '@/lib/firebase/categories'
import type { CategoryMap } from '@/types/category'

/**
 * 부채 카테고리인지 확인하는 함수
 * 기본 카테고리에서 '부채' 키를 찾고, 현재 카테고리와 비교합니다.
 *
 * @param category1 - 확인할 카테고리 이름
 * @param assetCategories - 현재 가계부의 자산 카테고리 맵 (선택사항)
 * @returns 부채 카테고리인지 여부
 */
export function isLiabilityCategory(category1: string, assetCategories?: CategoryMap): boolean {
  // 기본 카테고리에서 부채 키 확인
  const defaultCategories = getDefaultCategories()
  const defaultLiabilityKey = DEFAULT_LIABILITY_CATEGORY_KEY

  // 기본값과 직접 비교
  if (category1 === defaultLiabilityKey) {
    return true
  }

  // 현재 카테고리가 제공된 경우, 기본 카테고리의 부채 키와 매핑 확인
  if (assetCategories) {
    // 기본 카테고리의 부채 카테고리 소분류 목록
    const defaultLiabilitySubCategories = defaultCategories.asset[defaultLiabilityKey] || []

    // 현재 카테고리의 소분류 목록
    const currentSubCategories = assetCategories[category1] || []

    // 소분류 목록이 일치하면 부채 카테고리로 간주
    // (사용자가 카테고리 이름을 변경했지만 소분류는 그대로인 경우)
    if (
      currentSubCategories.length > 0 &&
      defaultLiabilitySubCategories.length > 0 &&
      JSON.stringify([...currentSubCategories].sort()) ===
        JSON.stringify([...defaultLiabilitySubCategories].sort())
    ) {
      return true
    }
  }

  return false
}

/**
 * 현재 가계부의 부채 카테고리 키를 찾는 함수
 *
 * @param assetCategories - 현재 가계부의 자산 카테고리 맵
 * @returns 부채 카테고리 키 (없으면 null)
 */
export function findLiabilityCategoryKey(assetCategories: CategoryMap): string | null {
  const defaultCategories = getDefaultCategories()
  const defaultLiabilityKey = DEFAULT_LIABILITY_CATEGORY_KEY
  const defaultLiabilitySubCategories = defaultCategories.asset[defaultLiabilityKey] || []

  // 기본 키가 존재하면 반환
  if (assetCategories[defaultLiabilityKey]) {
    return defaultLiabilityKey
  }

  // 소분류 목록으로 부채 카테고리 찾기
  for (const [key, subCategories] of Object.entries(assetCategories)) {
    if (
      subCategories.length > 0 &&
      defaultLiabilitySubCategories.length > 0 &&
      JSON.stringify([...subCategories].sort()) ===
        JSON.stringify([...defaultLiabilitySubCategories].sort())
    ) {
      return key
    }
  }

  return null
}
