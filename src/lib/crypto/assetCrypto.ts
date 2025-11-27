/**
 * 자산 데이터 암호화/복호화 헬퍼
 */

import { encrypt, decrypt, encryptNumber, decryptNumber, isEncrypted } from './encryption'
import type { Asset, AssetLog } from '@/types'

/**
 * 자산 데이터 암호화 (저장 전)
 */
export async function encryptAsset(
  asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
  encryptionKey: string
): Promise<Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>> {
  if (!encryptionKey) return asset

  return {
    ...asset,
    name: await encrypt(asset.name, encryptionKey),
    balance: (await encryptNumber(asset.balance, encryptionKey)) as any,
    memo: asset.memo ? await encrypt(asset.memo, encryptionKey) : undefined,
  }
}

/**
 * 자산 데이터 복호화 (조회 후)
 */
export async function decryptAsset(asset: Asset, encryptionKey: string): Promise<Asset> {
  if (!encryptionKey) return asset

  const nameIsEncrypted = isEncrypted(asset.name)
  const balanceIsEncrypted = typeof asset.balance === 'string' && isEncrypted(asset.balance as any)
  const memoIsEncrypted = asset.memo && isEncrypted(asset.memo)

  return {
    ...asset,
    name: nameIsEncrypted ? await decrypt(asset.name, encryptionKey) : asset.name,
    balance: balanceIsEncrypted
      ? await decryptNumber(asset.balance as any, encryptionKey)
      : asset.balance,
    memo: memoIsEncrypted ? await decrypt(asset.memo!, encryptionKey) : asset.memo,
  }
}

/**
 * 자산 목록 복호화
 */
export async function decryptAssets(assets: Asset[], encryptionKey: string): Promise<Asset[]> {
  if (!encryptionKey || assets.length === 0) return assets

  return Promise.all(assets.map((a) => decryptAsset(a, encryptionKey)))
}

/**
 * 자산 업데이트 데이터 암호화
 */
export async function encryptAssetUpdate(
  updates: Partial<Omit<Asset, 'id' | 'createdAt' | 'createdBy'>>,
  encryptionKey: string
): Promise<Partial<Omit<Asset, 'id' | 'createdAt' | 'createdBy'>>> {
  if (!encryptionKey) return updates

  const encrypted = { ...updates }

  if (updates.name !== undefined) {
    encrypted.name = await encrypt(updates.name, encryptionKey)
  }
  if (updates.balance !== undefined) {
    encrypted.balance = (await encryptNumber(updates.balance, encryptionKey)) as any
  }
  if (updates.memo !== undefined) {
    encrypted.memo = await encrypt(updates.memo, encryptionKey)
  }

  return encrypted
}

/**
 * 자산 로그 암호화 (저장 전)
 */
export async function encryptAssetLog(
  log: Omit<AssetLog, 'id' | 'createdAt'>,
  encryptionKey: string
): Promise<Omit<AssetLog, 'id' | 'createdAt'>> {
  if (!encryptionKey) return log

  return {
    ...log,
    previousBalance:
      log.previousBalance !== undefined
        ? ((await encryptNumber(log.previousBalance, encryptionKey)) as any)
        : undefined,
    newBalance:
      log.newBalance !== undefined
        ? ((await encryptNumber(log.newBalance, encryptionKey)) as any)
        : undefined,
    description: await encrypt(log.description, encryptionKey),
  }
}

/**
 * 자산 로그 복호화 (조회 후)
 */
export async function decryptAssetLog(log: AssetLog, encryptionKey: string): Promise<AssetLog> {
  if (!encryptionKey) return log

  const prevBalanceIsEncrypted =
    log.previousBalance !== undefined &&
    typeof log.previousBalance === 'string' &&
    isEncrypted(log.previousBalance as any)
  const newBalanceIsEncrypted =
    log.newBalance !== undefined &&
    typeof log.newBalance === 'string' &&
    isEncrypted(log.newBalance as any)
  const descriptionIsEncrypted = isEncrypted(log.description)

  return {
    ...log,
    previousBalance: prevBalanceIsEncrypted
      ? await decryptNumber(log.previousBalance as any, encryptionKey)
      : log.previousBalance,
    newBalance: newBalanceIsEncrypted
      ? await decryptNumber(log.newBalance as any, encryptionKey)
      : log.newBalance,
    description: descriptionIsEncrypted
      ? await decrypt(log.description, encryptionKey)
      : log.description,
  }
}

/**
 * 자산 로그 목록 복호화
 */
export async function decryptAssetLogs(
  logs: AssetLog[],
  encryptionKey: string
): Promise<AssetLog[]> {
  if (!encryptionKey || logs.length === 0) return logs

  return Promise.all(logs.map((l) => decryptAssetLog(l, encryptionKey)))
}
