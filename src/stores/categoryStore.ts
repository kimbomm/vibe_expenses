import { create } from 'zustand'
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { LedgerCategories, CategoryType, CategoryMap } from '@/types/category'
import {
  CATEGORIES_COLLECTION,
  ensureDefaultCategories,
  getDefaultCategories,
  parseCategoriesDoc,
  setCategoryGroup,
} from '@/lib/firebase/categories'

interface CategoryState {
  categories: Record<string, LedgerCategories>
  loading: Record<string, boolean>
  error: string | null
  unsubscribes: Record<string, Unsubscribe | null>
  subscriberCounts: Record<string, number>
  subscribeCategories: (ledgerId: string) => Promise<void>
  unsubscribeCategories: (ledgerId: string) => void
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
  return getDefaultCategories()
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
  unsubscribes: {},
  subscriberCounts: {},

  subscribeCategories: async (ledgerId: string) => {
    if (!ledgerId) return

    const { unsubscribes, subscriberCounts } = get()
    const currentCount = subscriberCounts[ledgerId] || 0

    if (currentCount > 0) {
      set({
        subscriberCounts: { ...subscriberCounts, [ledgerId]: currentCount + 1 },
      })
      return
    }

    set((state) => ({
      loading: { ...state.loading, [ledgerId]: true },
      error: null,
    }))

    try {
      await ensureDefaultCategories(ledgerId)

      const docRef = doc(db, CATEGORIES_COLLECTION, ledgerId)
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            return
          }

          const categories = parseCategoriesDoc(snapshot.data())
          set((state) => ({
            categories: { ...state.categories, [ledgerId]: categories },
            loading: { ...state.loading, [ledgerId]: false },
          }))
        },
        (error) => {
          console.error('카테고리 구독 오류:', error)
          set((state) => ({
            loading: { ...state.loading, [ledgerId]: false },
            error: error.message,
          }))
        }
      )

      set((state) => ({
        unsubscribes: { ...state.unsubscribes, [ledgerId]: unsubscribe },
        subscriberCounts: { ...state.subscriberCounts, [ledgerId]: 1 },
      }))
    } catch (error) {
      console.error('카테고리 구독 실패:', error)
      set((state) => ({
        loading: { ...state.loading, [ledgerId]: false },
        error: error instanceof Error ? error.message : '카테고리 구독 실패',
      }))
    }
  },

  unsubscribeCategories: (ledgerId: string) => {
    const { unsubscribes, subscriberCounts } = get()
    const currentCount = subscriberCounts[ledgerId] || 0

    if (currentCount > 1) {
      set({
        subscriberCounts: { ...subscriberCounts, [ledgerId]: currentCount - 1 },
      })
      return
    }

    const unsubscribe = unsubscribes[ledgerId]
    if (unsubscribe) {
      unsubscribe()
      set((state) => {
        const nextUnsubscribes = { ...state.unsubscribes }
        delete nextUnsubscribes[ledgerId]
        const nextCounts = { ...state.subscriberCounts }
        delete nextCounts[ledgerId]
        return { unsubscribes: nextUnsubscribes, subscriberCounts: nextCounts }
      })
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
    const trimmed = newName.trim()

    await get().updateCategoryGroup(ledgerId, type, (current) => {
      if (!current[oldName]) return current
      const { [oldName]: target, ...rest } = current
      return { ...rest, [trimmed]: target }
    })
  },

  deleteCategory1: async (ledgerId, type, name) => {
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
    await setCategoryGroup(ledgerId, type, nextMap)
  },
}))
