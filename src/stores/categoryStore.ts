import { create } from 'zustand'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { LedgerCategories, CategoryType, CategoryMap } from '@/types/category'
import {
  CATEGORIES_COLLECTION,
  parseCategoriesDoc,
  setCategoryGroup,
} from '@/lib/firebase/categories'
import { isLiabilityCategory } from '@/lib/utils/asset'

interface CategoryState {
  categories: Record<string, LedgerCategories>
  loading: Record<string, boolean>
  error: string | null
  lastFetched: Record<string, number> // ledgerId -> timestamp
  fetchCategories: (ledgerId: string) => Promise<void>
  addCategory1: (ledgerId: string, type: CategoryType, name: string) => Promise<void>
  updateCategory1: (
    ledgerId: string,
    type: CategoryType,
    oldName: string,
    newName: string
  ) => Promise<void>
  deleteCategory1: (ledgerId: string, type: CategoryType, name: string) => Promise<void>
  addCategory2: (
    ledgerId: string,
    type: CategoryType,
    category1: string,
    name: string
  ) => Promise<void>
  updateCategory2: (
    ledgerId: string,
    type: CategoryType,
    category1: string,
    oldName: string,
    newName: string
  ) => Promise<void>
  deleteCategory2: (
    ledgerId: string,
    type: CategoryType,
    category1: string,
    name: string
  ) => Promise<void>
  updateCategoryGroup: (
    ledgerId: string,
    type: CategoryType,
    updater: (map: CategoryMap) => CategoryMap
  ) => Promise<void>
}

function getInitialLedgerCategories(): LedgerCategories {
  return {
    income: {},
    expense: {},
    payment: {},
    asset: {},
  }
}

function cloneCategoryMap(map: CategoryMap): CategoryMap {
  return Object.fromEntries(Object.entries(map).map(([key, values]) => [key, [...values]]))
}

function getTypeKey(type: CategoryType): keyof LedgerCategories {
  return type
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: {},
  loading: {},
  error: null,
  lastFetched: {},

  fetchCategories: async (ledgerId: string) => {
    if (!ledgerId) return

    // 이미 로딩 중이면 스킵
    const { loading } = get()
    if (loading[ledgerId]) return

    set((state) => ({
      loading: { ...state.loading, [ledgerId]: true },
      error: null,
    }))

    try {
      const docRef = doc(db, CATEGORIES_COLLECTION, ledgerId)
      const snapshot = await getDoc(docRef)

      if (snapshot.exists()) {
        const categories = parseCategoriesDoc(snapshot.data())
        set((state) => ({
          categories: { ...state.categories, [ledgerId]: categories },
          loading: { ...state.loading, [ledgerId]: false },
          lastFetched: { ...state.lastFetched, [ledgerId]: Date.now() },
          error: null,
        }))
      } else {
        set((state) => ({
          categories: { ...state.categories, [ledgerId]: getInitialLedgerCategories() },
          loading: { ...state.loading, [ledgerId]: false },
          lastFetched: { ...state.lastFetched, [ledgerId]: Date.now() },
          error: null,
        }))
      }
    } catch (error) {
      console.error('카테고리 조회 실패:', error)
      set((state) => ({
        loading: { ...state.loading, [ledgerId]: false },
        error: error instanceof Error ? error.message : '카테고리 조회 실패',
      }))
    }
  },

  addCategory1: async (ledgerId, type, name) => {
    if (!name.trim()) return
    const trimmed = name.trim()

    await get().updateCategoryGroup(ledgerId, type, (current) => ({
      ...current,
      [trimmed]: [],
    }))
  },

  updateCategory1: async (ledgerId, type, oldName, newName) => {
    if (!newName.trim() || oldName === newName.trim()) return

    // 부채 카테고리 수정 방지
    if (type === 'asset') {
      const state = get()
      const ledgerCategories = state.categories[ledgerId] || getInitialLedgerCategories()
      const assetCategories = ledgerCategories.asset || {}

      if (isLiabilityCategory(oldName, assetCategories)) {
        throw new Error('부채 카테고리는 수정할 수 없습니다.')
      }
    }

    const trimmed = newName.trim()

    await get().updateCategoryGroup(ledgerId, type, (current) => {
      if (!current[oldName]) return current
      const { [oldName]: target, ...rest } = current
      return { ...rest, [trimmed]: target }
    })
  },

  deleteCategory1: async (ledgerId, type, name) => {
    // 부채 카테고리 삭제 방지
    if (type === 'asset') {
      const state = get()
      const ledgerCategories = state.categories[ledgerId] || getInitialLedgerCategories()
      const assetCategories = ledgerCategories.asset || {}

      if (isLiabilityCategory(name, assetCategories)) {
        throw new Error('부채 카테고리는 삭제할 수 없습니다.')
      }
    }

    await get().updateCategoryGroup(ledgerId, type, (current) => {
      const { [name]: _, ...rest } = current
      return rest
    })
  },

  addCategory2: async (ledgerId, type, category1, name) => {
    if (!name.trim()) return
    const trimmed = name.trim()

    await get().updateCategoryGroup(ledgerId, type, (current) => {
      const list = current[category1] || []
      if (list.includes(trimmed)) {
        return current
      }
      return {
        ...current,
        [category1]: [...list, trimmed],
      }
    })
  },

  updateCategory2: async (ledgerId, type, category1, oldName, newName) => {
    if (!newName.trim() || oldName === newName.trim()) return
    const trimmed = newName.trim()

    await get().updateCategoryGroup(ledgerId, type, (current) => {
      const list = current[category1] || []
      const index = list.indexOf(oldName)
      if (index === -1) return current
      const nextList = [...list]
      nextList[index] = trimmed
      return {
        ...current,
        [category1]: nextList,
      }
    })
  },

  deleteCategory2: async (ledgerId, type, category1, name) => {
    await get().updateCategoryGroup(ledgerId, type, (current) => {
      const list = current[category1] || []
      const nextList = list.filter((item) => item !== name)
      return {
        ...current,
        [category1]: nextList,
      }
    })
  },

  updateCategoryGroup: async (
    ledgerId: string,
    type: CategoryType,
    updater: (map: CategoryMap) => CategoryMap
  ) => {
    const state = get()
    const ledgerCategories = state.categories[ledgerId] || getInitialLedgerCategories()
    const typeKey = getTypeKey(type)
    const currentMap = ledgerCategories[typeKey] || {}
    const nextMap = updater(cloneCategoryMap(currentMap))

    // Firestore에 저장
    await setCategoryGroup(ledgerId, type, nextMap, currentMap)

    // Store 상태 업데이트
    set((state) => ({
      categories: {
        ...state.categories,
        [ledgerId]: {
          ...(state.categories[ledgerId] || getInitialLedgerCategories()),
          [typeKey]: nextMap,
        },
      },
    }))
  },
}))
