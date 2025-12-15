import { create } from 'zustand'
import {
  createAsset,
  updateAssetById,
  deleteAssetById,
  deactivateAsset as deactivateAssetApi,
  getAssetsByLedger,
  getAssetLogsByLedger,
} from '../api/assetApi'
import {
  encryptAsset,
  encryptAssetUpdate,
  decryptAssets,
  decryptAssetLogs,
} from '../lib/assetCrypto'
import { useLedgerStore } from '@/entities/ledger/model/store'
import type { Asset, AssetLog } from './types'

interface AssetState {
  assets: Record<string, Asset[]> // ledgerId -> assets[]
  assetLogs: Record<string, AssetLog[]> // ledgerId -> assetLogs[]
  loading: Record<string, boolean>
  error: string | null
  lastFetched: Record<string, number> // ledgerId -> timestamp

  // Actions
  fetchAssets: (ledgerId: string) => Promise<void>
  fetchAssetLogs: (ledgerId: string) => Promise<void>
  addAsset: (
    asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
    userId: string
  ) => Promise<string>
  updateAsset: (
    ledgerId: string,
    assetId: string,
    updates: Partial<Asset>,
    userId: string
  ) => Promise<void>
  deleteAsset: (ledgerId: string, assetId: string) => Promise<void>
  deactivateAsset: (ledgerId: string, assetId: string, userId: string) => Promise<void>
}

// 가계부의 암호화 키 가져오기
function getEncryptionKey(ledgerId: string): string | undefined {
  const ledgers = useLedgerStore.getState().ledgers
  const ledger = ledgers.find((l) => l.id === ledgerId)
  return ledger?.encryptionKey
}

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: {},
  assetLogs: {},
  loading: {},
  error: null,
  lastFetched: {},

  // 자산 조회
  fetchAssets: async (ledgerId: string) => {
    if (!ledgerId) return

    const loadingKey = `assets_${ledgerId}`
    const { loading } = get()
    if (loading[loadingKey]) return

    set((state) => ({
      loading: { ...state.loading, [loadingKey]: true },
      error: null,
    }))

    try {
      let assets = await getAssetsByLedger(ledgerId)

      // 복호화
      const encryptionKey = getEncryptionKey(ledgerId)
      if (encryptionKey) {
        assets = await decryptAssets(assets, encryptionKey)
      }

      set((state) => ({
        assets: { ...state.assets, [ledgerId]: assets },
        loading: { ...state.loading, [loadingKey]: false },
        lastFetched: { ...state.lastFetched, [ledgerId]: Date.now() },
        error: null,
      }))
    } catch (error) {
      console.error('자산 조회 실패:', error)
      set((state) => ({
        loading: { ...state.loading, [loadingKey]: false },
        error: error instanceof Error ? error.message : '자산 조회 실패',
      }))
    }
  },

  // 자산 로그 조회
  fetchAssetLogs: async (ledgerId: string) => {
    if (!ledgerId) return

    const loadingKey = `logs_${ledgerId}`
    const { loading } = get()
    if (loading[loadingKey]) return

    set((state) => ({
      loading: { ...state.loading, [loadingKey]: true },
      error: null,
    }))

    try {
      let logs = await getAssetLogsByLedger(ledgerId)

      // 복호화
      const encryptionKey = getEncryptionKey(ledgerId)
      if (encryptionKey) {
        logs = await decryptAssetLogs(logs, encryptionKey)
      }

      set((state) => ({
        assetLogs: { ...state.assetLogs, [ledgerId]: logs },
        loading: { ...state.loading, [loadingKey]: false },
        error: null,
      }))
    } catch (error) {
      console.error('자산 로그 조회 실패:', error)
      set((state) => ({
        loading: { ...state.loading, [loadingKey]: false },
        error: error instanceof Error ? error.message : '자산 로그 조회 실패',
      }))
    }
  },

  // 자산 추가
  addAsset: async (asset, userId) => {
    try {
      console.log('자산 생성 시작:', { asset, userId })

      // 암호화
      const encryptionKey = getEncryptionKey(asset.ledgerId)
      const dataToSave = encryptionKey ? await encryptAsset(asset, encryptionKey) : asset

      const assetId = await createAsset(dataToSave, userId)
      console.log('자산 생성 완료:', assetId)

      // 생성 후 해당 가계부의 자산 및 로그 다시 조회
      await get().fetchAssets(asset.ledgerId)
      await get().fetchAssetLogs(asset.ledgerId)

      return assetId
    } catch (error) {
      console.error('자산 생성 실패:', error)
      const errorMessage = error instanceof Error ? error.message : '자산 생성 실패'
      set({ error: errorMessage })
      throw error
    }
  },

  // 자산 수정
  updateAsset: async (ledgerId, assetId, updates, userId) => {
    try {
      // 암호화
      const encryptionKey = getEncryptionKey(ledgerId)
      const dataToSave = encryptionKey ? await encryptAssetUpdate(updates, encryptionKey) : updates

      await updateAssetById(ledgerId, assetId, dataToSave, userId)

      // 수정 후 해당 가계부의 자산 및 로그 다시 조회
      await get().fetchAssets(ledgerId)
      await get().fetchAssetLogs(ledgerId)
    } catch (error) {
      console.error('자산 수정 실패:', error)
      const errorMessage = error instanceof Error ? error.message : '자산 수정 실패'
      set({ error: errorMessage })
      throw error
    }
  },

  // 자산 삭제
  deleteAsset: async (ledgerId, assetId) => {
    try {
      await deleteAssetById(ledgerId, assetId)

      // 삭제 후 해당 가계부의 자산 다시 조회
      await get().fetchAssets(ledgerId)
    } catch (error) {
      console.error('자산 삭제 실패:', error)
      const errorMessage = error instanceof Error ? error.message : '자산 삭제 실패'
      set({ error: errorMessage })
      throw error
    }
  },

  // 자산 비활성화 (소프트 삭제)
  deactivateAsset: async (ledgerId, assetId, userId) => {
    try {
      await deactivateAssetApi(ledgerId, assetId, userId)

      // 비활성화 후 해당 가계부의 자산 및 로그 다시 조회
      await get().fetchAssets(ledgerId)
      await get().fetchAssetLogs(ledgerId)
    } catch (error) {
      console.error('자산 비활성화 실패:', error)
      const errorMessage = error instanceof Error ? error.message : '자산 비활성화 실패'
      set({ error: errorMessage })
      throw error
    }
  },
}))

