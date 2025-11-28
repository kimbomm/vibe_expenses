/**
 * 자산 내보내기 로직
 */

import type { Asset, AssetLog } from '@/types'
import { formatDateToYYYYMMDD } from './dateUtils'
import { decryptAssets, decryptAssetLogs } from '@/lib/crypto/assetCrypto'
import { useAssetStore } from '@/stores/assetStore'
import { useLedgerStore } from '@/stores/ledgerStore'
import { formatNumber } from '@/lib/utils/format'

export interface AssetExportOptions {
  includeInactive?: boolean // 비활성 자산 포함 여부
  includeLogs?: boolean // 자산 로그 포함 여부
}

/**
 * 자산 내보내기 데이터 조회
 */
export async function getAssetsForExport(
  ledgerId: string,
  options: AssetExportOptions = {}
): Promise<{ assets: Asset[]; assetLogs: AssetLog[] }> {
  const { includeInactive = false, includeLogs = false } = options

  // 자산 조회
  await useAssetStore.getState().fetchAssets(ledgerId)
  let assets = useAssetStore.getState().assets[ledgerId] || []

  // 비활성 자산 필터링
  if (!includeInactive) {
    assets = assets.filter((asset) => asset.isActive)
  }

  // 복호화
  const ledger = useLedgerStore.getState().ledgers.find((l) => l.id === ledgerId)
  if (ledger?.encryptionKey) {
    assets = await decryptAssets(assets, ledger.encryptionKey)
  }

  // 자산 로그 조회 (옵션)
  let assetLogs: AssetLog[] = []
  if (includeLogs) {
    await useAssetStore.getState().fetchAssetLogs(ledgerId)
    const storeLogs = useAssetStore.getState().assetLogs[ledgerId] || []

    // 복호화
    if (ledger?.encryptionKey) {
      assetLogs = await decryptAssetLogs(storeLogs, ledger.encryptionKey)
    } else {
      assetLogs = storeLogs
    }
  }

  return { assets, assetLogs }
}

/**
 * 자산 헤더 목록 가져오기
 */
export function getAssetExportHeaders(): string[] {
  return ['이름', '대분류', '소분류', '잔액', '통화', '메모', '상태', '생성일시', '수정일시']
}

/**
 * 자산 로그 헤더 목록 가져오기
 */
export function getAssetLogExportHeaders(): string[] {
  return ['날짜', '자산명', '타입', '이전 잔액', '변경 금액', '새 잔액', '설명', '생성일시']
}

/**
 * 자산을 Excel 형식으로 변환
 */
export function formatAssetForExport(asset: Asset): Record<string, unknown> {
  return {
    이름: asset.name,
    대분류: asset.category1,
    소분류: asset.category2,
    잔액: formatNumber(asset.balance),
    통화: asset.currency,
    메모: asset.memo || '',
    상태: asset.isActive ? '활성' : '비활성',
    생성일시: asset.createdAt ? formatDateToYYYYMMDD(asset.createdAt) : '',
    수정일시: asset.updatedAt ? formatDateToYYYYMMDD(asset.updatedAt) : '',
  }
}

/**
 * 자산 로그를 Excel 형식으로 변환
 */
export function formatAssetLogForExport(
  assetLog: AssetLog,
  assetName: string
): Record<string, unknown> {
  const previousBalance = assetLog.previousBalance ?? 0
  const newBalance = assetLog.newBalance ?? 0
  const changeAmount = newBalance - previousBalance

  return {
    날짜: formatDateToYYYYMMDD(assetLog.createdAt),
    자산명: assetName,
    타입: getAssetLogTypeLabel(assetLog.type),
    '이전 잔액': formatNumber(previousBalance),
    '변경 금액': formatNumber(changeAmount),
    '새 잔액': formatNumber(newBalance),
    설명: assetLog.description || '',
    생성일시: formatDateToYYYYMMDD(assetLog.createdAt),
  }
}

/**
 * 자산 로그 타입 라벨
 */
function getAssetLogTypeLabel(type: AssetLog['type']): string {
  const labels: Record<AssetLog['type'], string> = {
    created: '생성',
    updated: '수정',
    deactivated: '비활성화',
    reactivated: '재활성화',
    balance_changed: '잔액 변경',
  }
  return labels[type] || type
}

/**
 * 파일명 생성
 */
export function generateAssetExportFilename(includeLogs: boolean = false): string {
  const now = new Date()
  const dateStr = formatDateToYYYYMMDD(now)
  const suffix = includeLogs ? '_로그포함' : ''
  return `자산현황_${dateStr}${suffix}.xlsx`
}
