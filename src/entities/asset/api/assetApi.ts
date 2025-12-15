import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '@/shared/api/firebase/config'
import type { Asset, AssetLog, AssetLogType } from '../model/types'

// Firestore의 Timestamp를 Date로 변환
function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date()
  if (timestamp instanceof Date) return timestamp
  return timestamp.toDate()
}

// Firestore 문서를 Asset 타입으로 변환
function convertFirestoreAsset(docId: string, data: any, ledgerId: string): Asset {
  return {
    id: docId,
    ledgerId,
    name: data.name,
    category1: data.category1,
    category2: data.category2,
    balance: data.balance,
    currency: data.currency || 'KRW',
    memo: data.memo || undefined,
    isActive: data.isActive ?? true,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    createdBy: data.createdBy,
  }
}

// Firestore 문서를 AssetLog 타입으로 변환
function convertFirestoreAssetLog(docId: string, data: any, ledgerId: string): AssetLog {
  return {
    id: docId,
    assetId: data.assetId,
    ledgerId,
    type: data.type as AssetLogType,
    previousBalance: data.previousBalance,
    newBalance: data.newBalance,
    description: data.description,
    createdAt: timestampToDate(data.createdAt),
    createdBy: data.createdBy,
  }
}

/**
 * 가계부별 자산 조회
 * 경로: ledgers/{ledgerId}/assets/{assetId}
 */
export async function getAssetsByLedger(ledgerId: string): Promise<Asset[]> {
  try {
    const assetsRef = collection(db, 'ledgers', ledgerId, 'assets')
    const q = query(assetsRef, orderBy('createdAt', 'desc'))

    const querySnapshot = await getDocs(q)
    const assets: Asset[] = []
    querySnapshot.forEach((doc) => {
      assets.push(convertFirestoreAsset(doc.id, doc.data(), ledgerId))
    })

    return assets
  } catch (error) {
    console.error('자산 조회 실패:', error)
    throw error
  }
}

/**
 * 특정 자산 조회
 */
export async function getAssetById(ledgerId: string, assetId: string): Promise<Asset | null> {
  try {
    const assetRef = doc(db, 'ledgers', ledgerId, 'assets', assetId)
    const assetSnap = await getDoc(assetRef)

    if (!assetSnap.exists()) {
      return null
    }

    return convertFirestoreAsset(assetId, assetSnap.data(), ledgerId)
  } catch (error) {
    console.error('자산 조회 실패:', error)
    throw error
  }
}

/**
 * 자산 생성
 */
export async function createAsset(
  asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
  userId: string
): Promise<string> {
  try {
    const assetsRef = collection(db, 'ledgers', asset.ledgerId, 'assets')

    const assetData = {
      name: asset.name,
      category1: asset.category1,
      category2: asset.category2,
      balance: asset.balance,
      currency: asset.currency || 'KRW',
      memo: asset.memo || null,
      isActive: asset.isActive ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
    }

    const docRef = await addDoc(assetsRef, assetData)

    // 자산 생성 로그 추가
    await createAssetLog(asset.ledgerId, {
      assetId: docRef.id,
      type: 'created',
      newBalance: asset.balance,
      description: `자산 '${asset.name}' 추가`,
      createdBy: userId,
    })

    return docRef.id
  } catch (error) {
    console.error('자산 생성 실패:', error)
    throw error
  }
}

/**
 * 자산 수정
 */
export async function updateAssetById(
  ledgerId: string,
  assetId: string,
  updates: Partial<Omit<Asset, 'id' | 'createdAt' | 'createdBy'>>,
  userId: string
): Promise<void> {
  try {
    const assetRef = doc(db, 'ledgers', ledgerId, 'assets', assetId)

    // 기존 자산 조회 (로그용)
    const existingAsset = await getAssetById(ledgerId, assetId)

    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    }

    // ledgerId는 수정하지 않음
    delete updateData.ledgerId

    // null/undefined 필드 처리
    if (updateData.memo === undefined) {
      delete updateData.memo
    } else if (updateData.memo === null || updateData.memo === '') {
      updateData.memo = null
    }

    await updateDoc(assetRef, updateData)

    // 잔액 변경 시 로그 추가
    if (
      existingAsset &&
      updates.balance !== undefined &&
      existingAsset.balance !== updates.balance
    ) {
      await createAssetLog(ledgerId, {
        assetId,
        type: 'balance_changed',
        previousBalance: existingAsset.balance,
        newBalance: updates.balance,
        description: `잔액 변경: ${existingAsset.balance.toLocaleString()} → ${updates.balance.toLocaleString()}`,
        createdBy: userId,
      })
    }

    // 활성화 상태 변경 시 로그 추가
    if (
      existingAsset &&
      updates.isActive !== undefined &&
      existingAsset.isActive !== updates.isActive
    ) {
      await createAssetLog(ledgerId, {
        assetId,
        type: updates.isActive ? 'reactivated' : 'deactivated',
        description: updates.isActive ? '자산 재활성화' : '자산 비활성화',
        createdBy: userId,
      })
    }

    // 일반 수정 로그 (잔액/활성화 변경 외의 경우)
    if (
      existingAsset &&
      updates.balance === undefined &&
      updates.isActive === undefined &&
      (updates.name || updates.category1 || updates.category2 || updates.memo !== undefined)
    ) {
      await createAssetLog(ledgerId, {
        assetId,
        type: 'updated',
        description: `자산 '${existingAsset.name}' 정보 수정`,
        createdBy: userId,
      })
    }
  } catch (error) {
    console.error('자산 수정 실패:', error)
    throw error
  }
}

/**
 * 자산 삭제 (실제 삭제 대신 비활성화 권장)
 */
export async function deleteAssetById(ledgerId: string, assetId: string): Promise<void> {
  try {
    const assetRef = doc(db, 'ledgers', ledgerId, 'assets', assetId)
    await deleteDoc(assetRef)
  } catch (error) {
    console.error('자산 삭제 실패:', error)
    throw error
  }
}

/**
 * 자산 비활성화 (소프트 삭제)
 */
export async function deactivateAsset(
  ledgerId: string,
  assetId: string,
  userId: string
): Promise<void> {
  try {
    await updateAssetById(ledgerId, assetId, { isActive: false }, userId)
  } catch (error) {
    console.error('자산 비활성화 실패:', error)
    throw error
  }
}

// ============================================
// Asset Logs
// ============================================

/**
 * 가계부별 자산 로그 조회
 * 경로: ledgers/{ledgerId}/assetLogs/{logId}
 */
export async function getAssetLogsByLedger(ledgerId: string): Promise<AssetLog[]> {
  try {
    const logsRef = collection(db, 'ledgers', ledgerId, 'assetLogs')
    const q = query(logsRef, orderBy('createdAt', 'desc'))

    const querySnapshot = await getDocs(q)
    const logs: AssetLog[] = []
    querySnapshot.forEach((doc) => {
      logs.push(convertFirestoreAssetLog(doc.id, doc.data(), ledgerId))
    })

    return logs
  } catch (error) {
    console.error('자산 로그 조회 실패:', error)
    throw error
  }
}

/**
 * 특정 자산의 로그 조회
 */
export async function getAssetLogsByAssetId(
  ledgerId: string,
  assetId: string
): Promise<AssetLog[]> {
  try {
    const logs = await getAssetLogsByLedger(ledgerId)
    return logs.filter((log) => log.assetId === assetId)
  } catch (error) {
    console.error('자산 로그 조회 실패:', error)
    throw error
  }
}

/**
 * 자산 로그 생성
 */
async function createAssetLog(
  ledgerId: string,
  log: Omit<AssetLog, 'id' | 'ledgerId' | 'createdAt'>
): Promise<string> {
  try {
    const logsRef = collection(db, 'ledgers', ledgerId, 'assetLogs')

    const logData = {
      assetId: log.assetId,
      type: log.type,
      previousBalance: log.previousBalance ?? null,
      newBalance: log.newBalance ?? null,
      description: log.description,
      createdAt: serverTimestamp(),
      createdBy: log.createdBy,
    }

    const docRef = await addDoc(logsRef, logData)
    return docRef.id
  } catch (error) {
    console.error('자산 로그 생성 실패:', error)
    throw error
  }
}

