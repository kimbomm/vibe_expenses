import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { CategoryManager } from '@/components/settings/CategoryManager'
import { useCategoryStore } from '@/stores/categoryStore'
import { ImportCategoryModal } from '@/components/import/ImportCategoryModal'
import { useLedgerPermission } from '@/hooks/useLedgerPermission'

export function CategoriesPage() {
  const { ledgerId } = useParams<{ ledgerId: string }>()
  const fetchCategories = useCategoryStore((state) => state.fetchCategories)
  const [importOpen, setImportOpen] = useState(false)
  const { canEdit } = useLedgerPermission(ledgerId)

  if (!ledgerId) {
    return <div>가계부를 선택해주세요.</div>
  }

  useEffect(() => {
    fetchCategories(ledgerId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">카테고리 관리</h1>
          <p className="mt-1 text-muted-foreground">
            수입, 지출, 결제수단, 자산 카테고리를 관리하세요
          </p>
        </div>
        {canEdit && (
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              setImportOpen(true)
            }}
          >
            <Upload className="mr-2 h-5 w-5" />
            카테고리 업로드
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <CategoryManager ledgerId={ledgerId} type="income" />
        <CategoryManager ledgerId={ledgerId} type="expense" />
        <CategoryManager ledgerId={ledgerId} type="payment" />
        <CategoryManager ledgerId={ledgerId} type="asset" />
      </div>

      {ledgerId && (
        <ImportCategoryModal open={importOpen} onOpenChange={setImportOpen} ledgerId={ledgerId} />
      )}
    </div>
  )
}
