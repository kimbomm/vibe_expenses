import { useState, useRef, useEffect } from 'react'
import { parseExcelFile } from '@/shared/lib/import/excelParser'
import {
  validateCategoryRows,
  type ValidationError,
  type ValidatedCategory,
} from '@/shared/lib/import/categoryValidator'
import {
  importCategories,
  findUsedCategories,
  type UsedCategory,
} from '@/shared/lib/import/categoryImporter'
import { useCategoryStore } from '@/entities/category/model/store'

interface UseImportCategoryOptions {
  ledgerId: string
  onCancel: () => void
}

export function useImportCategory({ ledgerId, onCancel }: UseImportCategoryOptions) {
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [validating, setValidating] = useState(false)
  const [importing, setImporting] = useState(false)
  const [parsedRows, setParsedRows] = useState<unknown[]>([])
  const [validCategories, setValidCategories] = useState<ValidatedCategory[]>([])
  const [invalidRows, setInvalidRows] = useState<
    Array<{ row: number; errors: ValidationError[] }>
  >([])
  const [usedCategories, setUsedCategories] = useState<UsedCategory[]>([])
  const [showWarning, setShowWarning] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    message?: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchCategories = useCategoryStore((state) => state.fetchCategories)

  useEffect(() => {
    if (ledgerId) {
      fetchCategories(ledgerId)
    }
  }, [ledgerId, fetchCategories])

  const resetFileState = () => {
    setParsedRows([])
    setValidCategories([])
    setInvalidRows([])
    setUsedCategories([])
    setShowWarning(false)
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
      const result = validateCategoryRows(parsedRows)
      setValidCategories(result.valid)
      setInvalidRows(result.invalid)

      if (result.valid.length > 0) {
        const used = findUsedCategories(ledgerId, result.valid)
        setUsedCategories(used)
        if (used.length > 0) {
          setShowWarning(true)
        }
      }
    } catch (error) {
      console.error('검증 실패:', error)
      alert('데이터 검증 중 오류가 발생했습니다.')
    } finally {
      setValidating(false)
    }
  }

  const handleImport = async () => {
    if (validCategories.length === 0) return

    setImporting(true)
    try {
      await importCategories(validCategories, ledgerId)
      setImportResult({ success: true })
    } catch (error) {
      console.error('업로드 실패:', error)
      setImportResult({
        success: false,
        message:
          error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.',
      })
    } finally {
      setImporting(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setParsedRows([])
    setValidCategories([])
    setInvalidRows([])
    setUsedCategories([])
    setShowWarning(false)
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadSample = () => {
    const link = document.createElement('a')
    link.href = '/samples/카테고리_샘플.xlsx'
    link.download = '카테고리_샘플.xlsx'
    link.click()
  }

  return {
    file,
    parsing,
    validating,
    importing,
    parsedRows,
    validCategories,
    invalidRows,
    usedCategories,
    showWarning,
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
