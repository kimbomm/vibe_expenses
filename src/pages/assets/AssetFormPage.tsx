import { useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { AssetFormContent } from '@/components/asset/AssetFormContent'
import { useAssetStore } from '@/stores/assetStore'
import { useAuthStore } from '@/stores/authStore'
import type { Asset } from '@/types'

export function AssetFormPage() {
  const { ledgerId, assetId } = useParams<{
    ledgerId: string
    assetId?: string
  }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  // 빈 배열을 상수로 정의하여 같은 참조를 유지
  const EMPTY_ARRAY: Asset[] = useMemo(() => [], [])

  const assets = useAssetStore((state) => {
    if (!ledgerId) return EMPTY_ARRAY
    return state.assets[ledgerId] || EMPTY_ARRAY
  })
  const fetchAssets = useAssetStore((state) => state.fetchAssets)
  const addAsset = useAssetStore((state) => state.addAsset)
  const updateAsset = useAssetStore((state) => state.updateAsset)

  // 가계부별 자산 조회 (페이지 마운트 시)
  useEffect(() => {
    if (!ledgerId) return
    fetchAssets(ledgerId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId])

  // assetId가 있으면 수정 모드
  const asset = assetId ? assets.find((a) => a.id === assetId) : undefined

  if (!ledgerId) {
    return <div>가계부를 선택해주세요.</div>
  }

  const handleSubmit = async (
    data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isActive' | 'currency'>
  ) => {
    if (!user) return

    try {
      if (asset) {
        await updateAsset(ledgerId, asset.id, data, user.uid)
      } else {
        await addAsset({ ...data, isActive: true }, user.uid)
      }
      // 이전 페이지로 이동
      const returnPath = location.state?.returnPath || `/ledgers/${ledgerId}/assets`
      navigate(returnPath)
    } catch (error) {
      console.error('자산 저장 실패:', error)
      alert('자산 저장에 실패했습니다.')
    }
  }

  const handleCancel = () => {
    const returnPath = location.state?.returnPath || `/ledgers/${ledgerId}/assets`
    navigate(returnPath)
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
