import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Download, Loader2 } from 'lucide-react'
import { DateFilterSelector } from '../DateFilterSelector'
import { useExportTransaction } from '../../model/useExportTransaction'

interface ExportTransactionContentMobileProps {
  ledgerId: string
  onCancel: () => void
}

export function ExportTransactionContentMobile({
  ledgerId,
  onCancel,
}: ExportTransactionContentMobileProps) {
  const {
    filter,
    setFilter,
    exporting,
    progress,
    error,
    handleExport,
    transactions,
  } = useExportTransaction({ ledgerId, onCancel })

  return (
    <div className="space-y-6">
      <DateFilterSelector
        filter={filter}
        onChange={setFilter}
        transactions={transactions}
        ledgerId={ledgerId}
      />

      {progress && progress.total > 0 ? (
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>데이터 조회 중...</span>
            <span>
              {progress.current} / {progress.total}개 월
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
              }}
            />
          </div>
        </Card>
      ) : null}

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
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={exporting}
          className="w-full"
        >
          취소
        </Button>
      </div>
    </div>
  )
}
