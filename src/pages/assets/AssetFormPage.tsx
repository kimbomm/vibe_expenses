import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { AssetFormContent } from '@/components/asset/AssetFormContent'
import { useMockDataStore } from '@/stores/mockDataStore'
import type { Asset } from '@/types'

export function AssetFormPage() {
  const { ledgerId, assetId } = useParams<{
    ledgerId: string
    assetId?: string
  }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { assets, addAsset, updateAsset } = useMockDataStore()

  // assetId가 있으면 수정 모드
  const asset = assetId ? assets.find((a) => a.id === assetId) : undefined

  if (!ledgerId) {
    return <div>가계부를 선택해주세요.</div>
  }

  const handleSubmit = (
    data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isActive' | 'currency'>
  ) => {
    if (asset) {
      updateAsset(asset.id, data)
    } else {
      addAsset({ ...data, isActive: true })
    }
    // 이전 페이지로 이동
    const returnPath = location.state?.returnPath || `/ledgers/${ledgerId}/assets`
    navigate(returnPath)
  }

  const handleCancel = () => {
    const returnPath = location.state?.returnPath || `/ledgers/${ledgerId}/assets`
    navigate(returnPath)
  }

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit()
  }

  return (
    <div className="flex h-screen flex-col">
      {/* 헤더 */}
      <div className="flex items-center gap-4 border-b bg-background p-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">{asset ? '자산 수정' : '자산 추가'}</h2>
      </div>
      {/* 컨텐츠 */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <AssetFormContent
          ledgerId={ledgerId}
          asset={asset}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          showButtons={false}
        />
      </div>
      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 md:hidden">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
            취소
          </Button>
          <Button
            type="button"
            onClick={() => {
              const form = document.getElementById('asset-form') as HTMLFormElement
              form?.requestSubmit()
            }}
            className="flex-1"
          >
            {asset ? '수정' : '추가'}
          </Button>
        </div>
      </div>
    </div>
  )
}
