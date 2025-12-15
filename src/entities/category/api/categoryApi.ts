import { doc, getDoc, setDoc, serverTimestamp, deleteField } from 'firebase/firestore'
import { db } from '@/shared/api/firebase/config'
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  ASSET_CATEGORIES,
} from '@/shared/config/categories'
import type { LedgerCategories, CategoryMap, CategoryType } from '../model/types'

export const CATEGORIES_COLLECTION = 'categories'

function cloneCategoryConst(constant: Record<string, readonly string[]>): CategoryMap {
  return Object.fromEntries(Object.entries(constant).map(([key, values]) => [key, [...values]]))
}

export function getDefaultCategories(): LedgerCategories {
  return {
    income: cloneCategoryConst(INCOME_CATEGORIES),
    expense: cloneCategoryConst(EXPENSE_CATEGORIES),
    payment: cloneCategoryConst(PAYMENT_METHODS),
    asset: cloneCategoryConst(ASSET_CATEGORIES),
  }
}

export function getEmptyCategories(): LedgerCategories {
  return {
    income: {},
    expense: {},
    payment: {},
    asset: {},
  }
}

function getCategoryDocRef(ledgerId: string) {
  return doc(db, CATEGORIES_COLLECTION, ledgerId)
}

function normalizeCategoryMap(source: unknown): CategoryMap {
  if (!source || typeof source !== 'object') {
    return {}
  }

  const normalized: CategoryMap = {}
  Object.entries(source as Record<string, unknown>).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      normalized[key] = [...value]
    }
  })

  return normalized
}

export function parseCategoriesDoc(data: unknown): LedgerCategories {
  if (!data || typeof data !== 'object') {
    return getEmptyCategories()
  }

  const record = data as Record<string, unknown>
  return {
    income: normalizeCategoryMap(record.income),
    expense: normalizeCategoryMap(record.expense),
    payment: normalizeCategoryMap(record.payment),
    asset: normalizeCategoryMap(record.asset),
  }
}

export async function ensureDefaultCategories(ledgerId: string) {
  const ref = getCategoryDocRef(ledgerId)
  const snapshot = await getDoc(ref)

  if (!snapshot.exists()) {
    const defaults = getDefaultCategories()
    await setDoc(ref, {
      ...defaults,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
}

export async function setCategoryGroup(
  ledgerId: string,
  type: CategoryType,
  data: CategoryMap,
  _previous?: CategoryMap
) {
  const ref = getCategoryDocRef(ledgerId)

  // 기존 타입 전체를 제거하여 중첩 필드가 남지 않도록 처리
  await setDoc(
    ref,
    {
      [type]: deleteField(),
    },
    { merge: true }
  )

  await setDoc(
    ref,
    {
      [type]: data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

