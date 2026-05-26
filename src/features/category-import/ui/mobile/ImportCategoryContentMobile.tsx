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
import { useImportCategory } from '../../model/useImportCategory'

interface ImportCategoryContentMobileProps {
  ledgerId: string
  onCancel: () => void
}

export function ImportCategoryContentMobile({
  ledgerId,
  onCancel,
}: ImportCategoryContentMobileProps) {
  const {
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
  } = useImportCategory({ ledgerId, onCancel })

  return (
    <div className="space-y-6">
      {!file ? (
        <Card className="p-6">
          <div
            className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:bg-accent"
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium">
              Excel 파일을 선택하거나 드래그하세요
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              지원 형식: .xlsx, .xls
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button variant="outline" className="w-full">
              파일 선택
            </Button>
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation()
                downloadSample()
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              샘플 다운로드
            </Button>
          </div>
        </Card>
      ) : null}

      {file && !parsedRows.length ? (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 shrink-0" />
              <span className="truncate font-medium">{file.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            ({(file.size / 1024).toFixed(2)} KB)
          </p>
          <Button onClick={handleParse} disabled={parsing} className="w-full">
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
      ) : null}

      {parsedRows.length > 0 &&
      validCategories.length === 0 &&
      invalidRows.length === 0 ? (
        <Card className="p-6">
          <div className="mb-4">
            <p className="mb-2 font-medium">파싱 완료: {parsedRows.length}개 행</p>
            <p className="text-sm text-muted-foreground">
              데이터를 검증하려면 아래 버튼을 클릭하세요.
            </p>
          </div>
          <Button onClick={handleValidate} disabled={validating} className="w-full">
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
      ) : null}

      {validCategories.length > 0 ? (
        <Card className="p-6">
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="font-medium">검증 완료</p>
            </div>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">성공:</span>{' '}
                <span className="font-medium text-green-600">
                  {validCategories.length}개
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">실패:</span>{' '}
                <span className="font-medium text-red-600">
                  {invalidRows.length}개
                </span>
              </div>
            </div>
          </div>

          {showWarning && usedCategories.length > 0 ? (
            <div className="mb-4 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-600">
                  사용 중인 카테고리 ({usedCategories.length}개)
                </p>
              </div>
              <p className="mb-2 text-xs text-yellow-700 dark:text-yellow-300">
                덮어쓰기하면 새 거래 추가 시 사용할 수 없게 됩니다.
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
                    <span className="font-medium">{item.category2}</span>
                  </div>
                ))}
                {usedCategories.length > 10 ? (
                  <p className="text-muted-foreground">
                    ... 외 {usedCategories.length - 10}개
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {invalidRows.length > 0 ? (
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
                {invalidRows.length > 10 ? (
                  <p className="text-xs text-muted-foreground">
                    ... 외 {invalidRows.length - 10}개 행
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

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
        </Card>
      ) : null}

      {importResult && !importing ? (
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
            {importResult.message ? (
              <p className="text-sm text-muted-foreground">{importResult.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={onCancel} className="w-full">
              완료
            </Button>
            <Button onClick={handleReset} variant="outline" className="w-full">
              새로 업로드
            </Button>
          </div>
        </Card>
      ) : null}

      {!importing && !importResult ? (
        <Button variant="outline" onClick={onCancel} className="w-full">
          취소
        </Button>
      ) : null}
    </div>
  )
}
