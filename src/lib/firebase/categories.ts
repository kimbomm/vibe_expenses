import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './config'
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  ASSET_CATEGORIES,
} from '@/constants/categories'
import type { LedgerCategories, CategoryMap, CategoryType } from '@/types/category'

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

function getCategoryDocRef(ledgerId: string) {
  return doc(db, CATEGORIES_COLLECTION, ledgerId)
}

function normalizeCategoryMap(source: unknown, fallback: CategoryMap): CategoryMap {
  if (!source || typeof source !== 'object') {
    return { ...fallback }
  }

  const normalized: CategoryMap = {}
  Object.entries(source as Record<string, unknown>).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      normalized[key] = [...value]
    }
  })

  return Object.keys(normalized).length ? normalized : { ...fallback }
}

export function parseCategoriesDoc(data: unknown): LedgerCategories {
  const defaults = getDefaultCategories()
  if (!data || typeof data !== 'object') {
    return defaults
  }

  const record = data as Record<string, unknown>
  return {
    income: normalizeCategoryMap(record.income, defaults.income),
    expense: normalizeCategoryMap(record.expense, defaults.expense),
    payment: normalizeCategoryMap(record.payment, defaults.payment),
    asset: normalizeCategoryMap(record.asset, defaults.asset),
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

export async function setCategoryGroup(ledgerId: string, type: CategoryType, data: CategoryMap) {
  const ref = getCategoryDocRef(ledgerId)
  await setDoc(
    ref,
    {
      [type]: data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}
