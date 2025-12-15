import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ImportCategoryContent } from '@/features/category-import'

export function ImportCategoryPage() {
  const { ledgerId } = useParams<{ ledgerId: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  if (!ledgerId) {
    return <div>가계부를 선택해주세요.</div>
  }

  const returnPath =
    (location.state as { returnPath?: string })?.returnPath ||
    `/ledgers/${ledgerId}/settings/categories`

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 border-b bg-background">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(returnPath)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">카테고리 업로드</h1>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="p-4 pb-24">
        <ImportCategoryContent ledgerId={ledgerId} onCancel={() => navigate(returnPath)} />
      </div>
    </div>
  )
}
