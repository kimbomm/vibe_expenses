import { useState, useRef, useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  AlertTriangle,
  Download,
} from 'lucide-react'
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
import { getDefaultCategories } from '@/entities/category/api/categoryApi'

interface ImportCategoryContentProps {
  ledgerId: string
  onCancel: () => void
}

export function ImportCategoryContent({ ledgerId, onCancel }: ImportCategoryContentProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [validating, setValidating] = useState(false)
  const [importing, setImporting] = useState(false)
  const [parsedRows, setParsedRows] = useState<unknown[]>([])
  const [validCategories, setValidCategories] = useState<ValidatedCategory[]>([])
  const [invalidRows, setInvalidRows] = useState<Array<{ row: number; errors: ValidationError[] }>>(
    []
  )
  const [usedCategories, setUsedCategories] = useState<UsedCategory[]>([])
  const [showWarning, setShowWarning] = useState(false)
  const [importResult, setImportResult] = useState<{ success: boolean; message?: string } | null>(
    null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const ledgerCategories = useCategoryStore((state) => state.categories[ledgerId])
  const fetchCategories = useCategoryStore((state) => state.fetchCategories)

  // 카테고리 로드
  useEffect(() => {
    if (ledgerId) {
      fetchCategories(ledgerId)
    }
  }, [ledgerId, fetchCategories])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const validExtensions = ['.xlsx', '.xls']
    const fileName = selectedFile.name.toLowerCase()
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext))

    if (!isValid) {
      alert('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.')
      return
    }

    setFile(selectedFile)
    setParsedRows([])
    setValidCategories([])
    setInvalidRows([])
    setUsedCategories([])
    setShowWarning(false)
    setImportResult(null)
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (!droppedFile) return

    const validExtensions = ['.xlsx', '.xls']
    const fileName = droppedFile.name.toLowerCase()
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext))

    if (!isValid) {
      alert('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.')
      return
    }

    setFile(droppedFile)
    setParsedRows([])
    setValidCategories([])
    setInvalidRows([])
    setUsedCategories([])
    setShowWarning(false)
    setImportResult(null)
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

      // 사용 중인 카테고리 확인
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
        message: error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.',
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

  return (
    <div className="space-y-6">
      {/* 파일 선택 */}
      {!file && (
        <Card className="p-6">
          <div
            className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:bg-accent"
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium">Excel 파일을 선택하거나 드래그하세요</p>
            <p className="mb-4 text-sm text-muted-foreground">지원 형식: .xlsx, .xls</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button variant="outline">파일 선택</Button>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                const link = document.createElement('a')
                link.href = '/samples/카테고리_샘플.xlsx'
                link.download = '카테고리_샘플.xlsx'
                link.click()
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              샘플 다운로드
            </Button>
          </div>
        </Card>
      )}

      {/* 파일 정보 및 파싱 */}
      {file && !parsedRows.length && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              <span className="font-medium">{file.name}</span>
              <span className="text-sm text-muted-foreground">
                ({(file.size / 1024).toFixed(2)} KB)
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleParse} disabled={parsing}>
            {parsing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                파싱 중...
              </>
            ) : (
              '파일 파싱'
            )}
          </Button>
        </Card>
      )}

      {/* 파싱 결과 및 검증 */}
      {parsedRows.length > 0 && validCategories.length === 0 && invalidRows.length === 0 && (
        <Card className="p-6">
          <div className="mb-4">
            <p className="mb-2 font-medium">파싱 완료: {parsedRows.length}개 행</p>
            <p className="text-sm text-muted-foreground">
              데이터를 검증하려면 아래 버튼을 클릭하세요.
            </p>
          </div>
          <Button onClick={handleValidate} disabled={validating}>
            {validating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                검증 중...
              </>
            ) : (
              '데이터 검증'
            )}
          </Button>
        </Card>
      )}

      {/* 검증 결과 */}
      {validCategories.length > 0 && (
        <Card className="p-6">
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="font-medium">검증 완료</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">성공:</span>{' '}
                <span className="font-medium text-green-600">{validCategories.length}개</span>
              </div>
              <div>
                <span className="text-muted-foreground">실패:</span>{' '}
                <span className="font-medium text-red-600">{invalidRows.length}개</span>
              </div>
            </div>
          </div>

          {/* 사용 중인 카테고리 경고 */}
          {showWarning && usedCategories.length > 0 && (
            <div className="mb-4 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-600">
                  기존 거래내역에서 사용 중인 카테고리 ({usedCategories.length}개)
                </p>
              </div>
              <p className="mb-2 text-xs text-yellow-700 dark:text-yellow-300">
                다음 카테고리가 기존 거래내역에서 사용 중입니다. 덮어쓰기하면 새 거래 추가 시 사용할
                수 없게 됩니다.
              </p>
              <div className="max-h-40 space-y-1 overflow-y-auto text-xs">
                {usedCategories.slice(0, 10).map((item, idx) => (
                  <div key={idx}>
                    <span className="font-medium">
                      {item.type === 'expense'
                        ? '지출'
                        : item.type === 'income'
                          ? '수입'
                          : item.type === 'payment'
                            ? '결제수단'
                            : '자산'}
                    </span>
                    {' > '}
                    <span className="font-medium">{item.category1}</span>
                    {' > '}
                    <span className="font-medium">{item.category2}</span>{' '}
                    <span className="text-muted-foreground">({item.count}건 사용 중)</span>
                  </div>
                ))}
                {usedCategories.length > 10 && (
                  <p className="text-muted-foreground">... 외 {usedCategories.length - 10}개</p>
                )}
              </div>
            </div>
          )}

          {/* 실패한 행 목록 */}
          {invalidRows.length > 0 && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 dark:bg-red-950">
              <div className="mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm font-medium text-red-600">
                  실패한 행 ({invalidRows.length}개)
                </p>
              </div>
              <div className="max-h-40 space-y-2 overflow-y-auto">
                {invalidRows.slice(0, 10).map((item) => (
                  <div key={item.row} className="text-xs">
                    <span className="font-medium">행 {item.row}:</span>{' '}
                    {item.errors.map((e) => e.message).join(', ')}
                  </div>
                ))}
                {invalidRows.length > 10 && (
                  <p className="text-xs text-muted-foreground">
                    ... 외 {invalidRows.length - 10}개 행
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 업로드 버튼 */}
          {validCategories.length > 0 && (
            <Button onClick={handleImport} disabled={importing} className="w-full">
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  업로드 중...
                </>
              ) : (
                `카테고리 덮어쓰기 (${validCategories.length}개)`
              )}
            </Button>
          )}
        </Card>
      )}

      {/* 업로드 결과 */}
      {importResult && !importing && (
        <Card className="p-6">
          <div className="mb-4">
            {importResult.success ? (
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="font-medium">업로드 완료</p>
              </div>
            ) : (
              <div className="mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="font-medium">업로드 실패</p>
              </div>
            )}
            {importResult.message && (
              <p className="text-sm text-muted-foreground">{importResult.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleReset} variant="outline" className="flex-1">
              새로 업로드
            </Button>
            <Button onClick={onCancel} className="flex-1">
              완료
            </Button>
          </div>
        </Card>
      )}

      {/* 취소 버튼 */}
      {!importing && !importResult && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
        </div>
      )}
    </div>
  )
}
