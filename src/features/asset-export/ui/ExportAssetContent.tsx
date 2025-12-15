import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Label } from '@/shared/ui/label'
import { Download, Loader2 } from 'lucide-react'
import {
  getAssetsForExport,
  formatAssetForExport,
  getAssetExportHeaders,
  generateAssetExportFilename,
  type AssetExportOptions,
} from '@/shared/lib/export/assetExporter'
import { generateExcel, downloadExcel } from '@/shared/lib/export/excelGenerator'
import { useAssetStore } from '@/entities/asset/model/store'

interface ExportAssetContentProps {
  ledgerId: string
  onCancel: () => void
}

export function ExportAssetContent({ ledgerId, onCancel }: ExportAssetContentProps) {
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
      // 자산 데이터 조회
      const { assets: exportAssets, assetLogs: exportLogs } = await getAssetsForExport(
        ledgerId,
        options
      )

      // 자산 데이터 포맷팅
      const formattedAssets = exportAssets.map((asset) => formatAssetForExport(asset))

      // Excel 파일 생성
      const filename = generateAssetExportFilename(options.includeLogs)
      const headers = getAssetExportHeaders()
      const blob = generateExcel(formattedAssets, headers, '자산현황')
      downloadExcel(blob, filename)

      // TODO: 자산 로그를 별도 시트로 포함하려면 xlsx의 Workbook 기능 사용 필요

      // 완료 후 모달 닫기
      setTimeout(() => {
        onCancel()
      }, 500)
    } catch (err) {
      console.error('내보내기 실패:', err)
      setError(err instanceof Error ? err.message : '내보내기 중 오류가 발생했습니다.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 옵션 선택 */}
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">내보내기 옵션</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.includeInactive}
                  onChange={(e) => setOptions({ ...options, includeInactive: e.target.checked })}
                  className="h-4 w-4"
                />
                <span>비활성 자산 포함</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.includeLogs}
                  onChange={(e) => setOptions({ ...options, includeLogs: e.target.checked })}
                  className="h-4 w-4"
                />
                <span>자산 변경 이력 포함</span>
              </label>
            </div>
          </div>

          {/* 데이터 요약 */}
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">내보내기 예상 데이터:</p>
            <ul className="mt-1 space-y-1 text-muted-foreground">
              <li>
                • 자산:{' '}
                {options.includeInactive ? assets.length : assets.filter((a) => a.isActive).length}
                개
              </li>
              {options.includeLogs && <li>• 변경 이력: {assetLogs.length}개</li>}
            </ul>
          </div>
        </div>
      </Card>

      {/* 에러 메시지 */}
      {error && (
        <Card className="bg-red-50 p-4 dark:bg-red-950">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      {/* 액션 버튼 */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={exporting}>
          취소
        </Button>
        <Button onClick={handleExport} disabled={exporting}>
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              내보내는 중...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              내보내기
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
