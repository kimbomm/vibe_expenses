import { useState } from 'react'
import {
  getAssetsForExport,
  formatAssetForExport,
  getAssetExportHeaders,
  generateAssetExportFilename,
  type AssetExportOptions,
} from '@/shared/lib/export/assetExporter'
import { generateExcel, downloadExcel } from '@/shared/lib/export/excelGenerator'
import { useAssetStore } from '@/entities/asset/model/store'

interface UseExportAssetOptions {
  ledgerId: string
  onCancel: () => void
}

export function useExportAsset({ ledgerId, onCancel }: UseExportAssetOptions) {
  const [options, setOptions] = useState<AssetExportOptions>({
    includeInactive: false,
    includeLogs: false,
  })
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const assets = useAssetStore((state) => state.assets[ledgerId] || [])
  const assetLogs = useAssetStore((state) => state.assetLogs[ledgerId] || [])

  const handleExport = async () => {
    setExporting(true)
    setError(null)

    try {
      const { assets: exportAssets } = await getAssetsForExport(ledgerId, options)
      const formattedAssets = exportAssets.map((asset) => formatAssetForExport(asset))
      const filename = generateAssetExportFilename(options.includeLogs)
      const headers = getAssetExportHeaders()
      const blob = generateExcel(formattedAssets, headers, '자산현황')
      downloadExcel(blob, filename)

      setTimeout(() => {
        onCancel()
      }, 500)
    } catch (err) {
      console.error('보내기 실패:', err)
      setError(
        err instanceof Error ? err.message : '보내기 중 오류가 발생했습니다.'
      )
    } finally {
      setExporting(false)
    }
  }

  const activeCount = options.includeInactive
    ? assets.length
    : assets.filter((a) => a.isActive).length

  return {
    options,
    setOptions,
    exporting,
    error,
    handleExport,
    activeCount,
    logCount: assetLogs.length,
    onCancel,
  }
}
