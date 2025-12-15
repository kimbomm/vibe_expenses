import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Download, Loader2 } from 'lucide-react'
import { DateFilterSelector } from './DateFilterSelector'
import {
  getTransactionsForExport,
  formatTransactionForExport,
  generateExportFilename,
  getExportHeaders,
  type DateFilterState,
} from '@/shared/lib/export/transactionExporter'
import { generateExcel, downloadExcel } from '@/shared/lib/export/excelGenerator'
import { useTransactionStore } from '@/entities/transaction/model/store'

interface ExportTransactionContentProps {
  ledgerId: string
  onCancel: () => void
}

export function ExportTransactionContent({ ledgerId, onCancel }: ExportTransactionContentProps) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const [filter, setFilter] = useState<DateFilterState>({
    type: 'month',
    selectedYear: currentYear,
    selectedMonth: currentMonth,
  })
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 항상 Excel 형식, 한글 컬럼명 사용
  const format: 'xlsx' = 'xlsx'
  const useEnglishHeaders = false

  const transactions = useTransactionStore((state) => state.transactions[ledgerId] || [])

  const handleExport = async () => {
    setExporting(true)
    setError(null)
    setProgress({ current: 0, total: 0 })

    try {
      // 거래내역 조회
      const data = await getTransactionsForExport(ledgerId, filter, (current, total) => {
        setProgress({ current, total })
      })

      // 데이터 포맷팅
      const formattedData = data.map((transaction) =>
        formatTransactionForExport(transaction, useEnglishHeaders)
      )

      // 헤더 추출 (데이터가 없어도 헤더는 생성)
      const headers = getExportHeaders(useEnglishHeaders)

      // 파일 생성 및 다운로드 (항상 Excel 형식)
      const filename = generateExportFilename(filter, format)
      const blob = generateExcel(formattedData, headers, '거래내역')
      downloadExcel(blob, filename)

      // 완료 후 모달 닫기
      setTimeout(() => {
        onCancel()
      }, 500)
    } catch (err) {
      console.error('내보내기 실패:', err)
      setError(err instanceof Error ? err.message : '내보내기 중 오류가 발생했습니다.')
    } finally {
      setExporting(false)
      setProgress(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* 날짜 필터 선택 */}
      <DateFilterSelector
        filter={filter}
        onChange={setFilter}
        transactions={transactions}
        ledgerId={ledgerId}
      />

      {/* 진행 상황 */}
      {progress && progress.total > 0 && (
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
      )}

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
