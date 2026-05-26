import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Download,
} from 'lucide-react'
import { useImportTransaction } from '../../model/useImportTransaction'

interface ImportTransactionContentDesktopProps {
  ledgerId: string
  onCancel: () => void
}

export function ImportTransactionContentDesktop({
  ledgerId,
  onCancel,
}: ImportTransactionContentDesktopProps) {
  const {
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
  } = useImportTransaction({ ledgerId, onCancel })

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
            <div className="flex justify-center">
              <Button variant="outline">파일 선택</Button>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                downloadSample(
                  '/samples/거래내역_샘플_한글.xlsx',
                  '거래내역_샘플_한글.xlsx'
                )
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              샘플 다운로드 (한글)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                downloadSample(
                  '/samples/거래내역_샘플_영문.xlsx',
                  '거래내역_샘플_영문.xlsx'
                )
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              샘플 다운로드 (영문)
            </Button>
          </div>
        </Card>
      ) : null}

      {file && !parsedRows.length ? (
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
      ) : null}

      {parsedRows.length > 0 &&
      validTransactions.length === 0 &&
      invalidRows.length === 0 ? (
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
      ) : null}

      {validTransactions.length > 0 ? (
        <Card className="p-6">
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="font-medium">검증 완료</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">성공:</span>{' '}
                <span className="font-medium text-green-600">
                  {validTransactions.length}개
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
              `${validTransactions.length}개 거래내역 업로드`
            )}
          </Button>
        </Card>
      ) : null}

      {importProgress && importing ? (
        <Card className="p-6">
          <div className="mb-4">
            <p className="mb-2 font-medium">업로드 진행 중...</p>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{
                  width: `${(importProgress.processed / importProgress.total) * 100}%`,
                }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {importProgress.processed} / {importProgress.total} (
              {importProgress.success} 성공, {importProgress.failed} 실패)
            </p>
          </div>
        </Card>
      ) : null}

      {importResult && !importing ? (
        <Card className="p-6">
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="font-medium">업로드 완료</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">성공:</span>{' '}
                <span className="font-medium text-green-600">
                  {importResult.success}개
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">실패:</span>{' '}
                <span className="font-medium text-red-600">
                  {importResult.failed}개
                </span>
              </div>
            </div>
          </div>

          {importResult.errors.length > 0 ? (
            <div className="mb-4 rounded-lg bg-red-50 p-4 dark:bg-red-950">
              <div className="mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm font-medium text-red-600">실패한 행</p>
              </div>
              <div className="max-h-40 space-y-2 overflow-y-auto">
                {importResult.errors.slice(0, 10).map((error, idx) => (
                  <div key={idx} className="text-xs">
                    <span className="font-medium">행 {error.row}:</span>{' '}
                    {error.message}
                  </div>
                ))}
                {importResult.errors.length > 10 ? (
                  <p className="text-xs text-muted-foreground">
                    ... 외 {importResult.errors.length - 10}개 행
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button onClick={handleReset} variant="outline" className="flex-1">
              새로 업로드
            </Button>
            <Button onClick={onCancel} className="flex-1">
              완료
            </Button>
          </div>
        </Card>
      ) : null}

      {!importing && !importResult ? (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
        </div>
      ) : null}
    </div>
  )
}
