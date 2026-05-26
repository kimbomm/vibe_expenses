import { useState, useRef, useEffect } from 'react'
import { parseExcelFile } from '@/shared/lib/import/excelParser'
import {
  validateTransactionRows,
  type ValidationError,
} from '@/shared/lib/import/transactionValidator'
import {
  importTransactions,
  type ImportProgress,
} from '@/shared/lib/import/transactionImporter'
import { useCategoryStore } from '@/entities/category/model/store'
import { getDefaultCategories } from '@/entities/category/api/categoryApi'

interface UseImportTransactionOptions {
  ledgerId: string
  onCancel: () => void
}

export function useImportTransaction({ ledgerId, onCancel }: UseImportTransactionOptions) {
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [validating, setValidating] = useState(false)
  const [importing, setImporting] = useState(false)
  const [parsedRows, setParsedRows] = useState<unknown[]>([])
  const [validTransactions, setValidTransactions] = useState<
    Array<{
      type: 'income' | 'expense'
      amount: number
      date: Date
      category1: string
      category2: string
      paymentMethod1?: string
      paymentMethod2?: string
      description: string
      memo?: string
    }>
  >([])
  const [invalidRows, setInvalidRows] = useState<
    Array<{ row: number; errors: ValidationError[] }>
  >([])
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null)
  const [importResult, setImportResult] = useState<{
    success: number
    failed: number
    errors: Array<{ row: number; message: string }>
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const ledgerCategories = useCategoryStore((state) => state.categories[ledgerId])
  const fetchCategories = useCategoryStore((state) => state.fetchCategories)
  const categories = ledgerCategories || getDefaultCategories()

  useEffect(() => {
    if (ledgerId) {
      fetchCategories(ledgerId)
    }
  }, [ledgerId, fetchCategories])

  const resetFileState = () => {
    setParsedRows([])
    setValidTransactions([])
    setInvalidRows([])
    setImportResult(null)
  }

  const acceptExcelFile = (selectedFile: File) => {
    const validExtensions = ['.xlsx', '.xls']
    const fileName = selectedFile.name.toLowerCase()
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext))

    if (!isValid) {
      alert('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.')
      return false
    }

    setFile(selectedFile)
    resetFileState()
    return true
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    acceptExcelFile(selectedFile)
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (!droppedFile) return
    acceptExcelFile(droppedFile)
  }

  const handleParse = async () => {
    if (!file) return

    setParsing(true)
    try {
      const rows = await parseExcelFile(file)
      setParsedRows(rows)
    } catch (error) {
      console.error('파일 파싱 실패:', error)
      alert('파일을 읽는 중 오류가 발생했습니다.')
    } finally {
      setParsing(false)
    }
  }

  const handleValidate = () => {
    if (parsedRows.length === 0) return

    setValidating(true)
    try {
      const result = validateTransactionRows(parsedRows, categories, {
        skipCategoryValidation: true,
      })
      setValidTransactions(result.valid)
      setInvalidRows(result.invalid)
    } catch (error) {
      console.error('검증 실패:', error)
      alert('데이터 검증 중 오류가 발생했습니다.')
    } finally {
      setValidating(false)
    }
  }

  const handleImport = async () => {
    if (validTransactions.length === 0) return

    setImporting(true)
    setImportProgress({
      total: validTransactions.length,
      processed: 0,
      success: 0,
      failed: 0,
    })

    try {
      const result = await importTransactions(validTransactions, ledgerId, (progress) => {
        setImportProgress(progress)
      })
      setImportResult(result)
    } catch (error) {
      console.error('업로드 실패:', error)
      alert('업로드 중 오류가 발생했습니다.')
    } finally {
      setImporting(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setParsedRows([])
    setValidTransactions([])
    setInvalidRows([])
    setImportProgress(null)
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadSample = (href: string, filename: string) => {
    const link = document.createElement('a')
    link.href = href
    link.download = filename
    link.click()
  }

  return {
    file,
    parsing,
    validating,
    importing,
    parsedRows,
    validTransactions,
    invalidRows,
    importProgress,
    importResult,
    fileInputRef,
    handleFileSelect,
    handleFileDrop,
    handleParse,
    handleValidate,
    handleImport,
    handleReset,
    downloadSample,
    onCancel,
  }
}
