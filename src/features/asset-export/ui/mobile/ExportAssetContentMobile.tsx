import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Label } from '@/shared/ui/label'
import { Download, Loader2 } from 'lucide-react'
import { useExportAsset } from '../../model/useExportAsset'

interface ExportAssetContentMobileProps {
  ledgerId: string
  onCancel: () => void
}

export function ExportAssetContentMobile({
  ledgerId,
  onCancel,
}: ExportAssetContentMobileProps) {
  const {
    options,
    setOptions,
    exporting,
    error,
    handleExport,
    activeCount,
    logCount,
  } = useExportAsset({ ledgerId, onCancel })

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">보내기 옵션</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.includeInactive}
                  onChange={(e) =>
                    setOptions({ ...options, includeInactive: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <span>비활성 자산 포함</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.includeLogs}
                  onChange={(e) =>
                    setOptions({ ...options, includeLogs: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <span>자산 변경 이력 포함</span>
              </label>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">보내기 예상 데이터:</p>
            <ul className="mt-1 space-y-1 text-muted-foreground">
              <li>• 자산: {activeCount}개</li>
              {options.includeLogs ? <li>• 변경 이력: {logCount}개</li> : null}
            </ul>
          </div>
        </div>
      </Card>
      {error ? (
        <Card className="bg-red-50 p-4 dark:bg-red-950">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      ) : null}
      <div className="flex flex-col gap-2">
        <Button onClick={handleExport} disabled={exporting} className="w-full">
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             보내는 중...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
             보내기
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={exporting} className="w-full">
          취소
        </Button>
      </div>
    </div>
  )
}
