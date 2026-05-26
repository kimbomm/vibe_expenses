import { useState } from 'react'
import {
  getTransactionsForExport,
  formatTransactionForExport,
  generateExportFilename,
  getExportHeaders,
  type DateFilterState,
} from '@/shared/lib/export/transactionExporter'
import { generateExcel, downloadExcel } from '@/shared/lib/export/excelGenerator'
import { useTransactionStore } from '@/entities/transaction/model/store'

interface UseExportTransactionOptions {
  ledgerId: string
  onCancel: () => void
}

export function useExportTransaction({
  ledgerId,
  onCancel,
}: UseExportTransactionOptions) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const [filter, setFilter] = useState<DateFilterState>({
    type: 'month',
    selectedYear: currentYear,
    selectedMonth: currentMonth,
  })
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  const format: 'xlsx' = 'xlsx'
  const useEnglishHeaders = false

  const transactions = useTransactionStore(
    (state) => state.transactions[ledgerId] || []
  )

  const handleExport = async () => {
    setExporting(true)
    setError(null)
    setProgress({ current: 0, total: 0 })

    try {
      const data = await getTransactionsForExport(ledgerId, filter, (current, total) => {
        setProgress({ current, total })
      })

      const formattedData = data.map((transaction) =>
        formatTransactionForExport(transaction, useEnglishHeaders)
      )

      const headers = getExportHeaders(useEnglishHeaders)
      const filename = generateExportFilename(filter, format)
      const blob = generateExcel(formattedData, headers, '거래내역')
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
      setProgress(null)
    }
  }

  return {
    filter,
    setFilter,
    exporting,
    progress,
    error,
    handleExport,
    transactions,
    onCancel,
  }
}
