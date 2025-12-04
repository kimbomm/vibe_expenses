import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Wallet, TrendingUp, TrendingDown, Edit, Trash2, Download } from 'lucide-react'
import { useAssetStore } from '@/stores/assetStore'
import { useAuthStore } from '@/stores/authStore'
import { useLedgerStore } from '@/stores/ledgerStore'
import { useLedgerPermission } from '@/hooks/useLedgerPermission'
import { useCategoryStore } from '@/stores/categoryStore'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { isLiabilityCategory } from '@/lib/utils/asset'
import { AssetForm } from '@/components/asset/AssetForm'
import { ExportAssetModal } from '@/components/export/ExportAssetModal'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { useNavigate } from 'react-router-dom'
import type { Asset } from '@/types'

export function AssetsPage() {
  const { ledgerId } = useParams()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [formOpen, setFormOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>()

  const { user } = useAuthStore()
  const { canEdit } = useLedgerPermission(ledgerId)

  // 빈 배열을 상수로 정의하여 같은 참조를 유지
  const EMPTY_ASSETS: Asset[] = useMemo(() => [], [])

  const storeAssets = useAssetStore((state) => {
    if (!ledgerId) return EMPTY_ASSETS
    return state.assets[ledgerId] || EMPTY_ASSETS
  })
  const fetchAssets = useAssetStore((state) => state.fetchAssets)
  const addAsset = useAssetStore((state) => state.addAsset)
  const updateAsset = useAssetStore((state) => state.updateAsset)
  const deleteAsset = useAssetStore((state) => state.deleteAsset)
  const currentLedger = useLedgerStore((state) =>
    ledgerId ? (state.ledgers.find((l) => l.id === ledgerId) ?? null) : null
  )

  // 카테고리 정보 가져오기 (부채 카테고리 감지용)
  const assetCategories = useCategoryStore((state) =>
    ledgerId ? state.categories[ledgerId]?.asset : undefined
  )

  // 가계부별 자산 조회 (페이지 마운트 시)
  useEffect(() => {
    if (!ledgerId || !currentLedger?.encryptionKey) return

    fetchAssets(ledgerId)
  }, [ledgerId, fetchAssets, currentLedger?.encryptionKey])

  const assets = storeAssets.filter((a) => a.isActive)

  // 카테고리별 그룹핑
  const assetsByCategory = assets.reduce(
    (acc, asset) => {
      if (!acc[asset.category1]) {
        acc[asset.category1] = []
      }
      acc[asset.category1].push(asset)
      return acc
    },
    {} as Record<string, typeof assets>
  )

  // 총 자산 계산 (카테고리 기반 - 동적 부채 카테고리 감지)
  const totalAssets = assets
    .filter((a) => !isLiabilityCategory(a.category1, assetCategories))
    .reduce((sum, a) => sum + Math.abs(a.balance), 0)
  const totalLiabilities = assets
    .filter((a) => isLiabilityCategory(a.category1, assetCategories))
    .reduce((sum, a) => sum + Math.abs(a.balance), 0)
  const netWorth = totalAssets - totalLiabilities

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">자산 현황</h1>
          <p className="mt-1 text-muted-foreground">나의 자산을 관리하세요</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="lg"
            variant="outline"
            className="flex-1 sm:flex-initial"
            onClick={() => {
              if (isMobile) {
                navigate(`/ledgers/${ledgerId}/assets/export`)
              } else {
                setExportOpen(true)
              }
            }}
          >
            <Download className="mr-2 h-5 w-5" />
            내보내기
          </Button>
          {canEdit && (
            <Button
              size="lg"
              className="flex-1 sm:flex-initial"
              onClick={() => {
                setEditingAsset(undefined)
                setFormOpen(true)
              }}
            >
              <Plus className="mr-2 h-5 w-5" />
              자산 추가
            </Button>
          )}
        </div>
      </div>

      {/* 자산 요약 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 자산</CardTitle>
            <TrendingUp className="h-4 w-4 flex-shrink-0 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-right text-2xl font-bold text-green-600">
              {formatCurrency(totalAssets)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 부채</CardTitle>
            <TrendingDown className="h-4 w-4 flex-shrink-0 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-right text-2xl font-bold text-red-600">
              {formatCurrency(totalLiabilities)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">순자산</CardTitle>
            <Wallet className="h-4 w-4 flex-shrink-0 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-right text-2xl font-bold">{formatCurrency(netWorth)}</div>
          </CardContent>
        </Card>
      </div>

      {/* 자산 목록 (카테고리별) */}
      <div className="space-y-6">
        {Object.entries(assetsByCategory).map(([category, categoryAssets]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="relative flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2">
                        <Wallet className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-semibold">{asset.name}</h4>
                        <p className="text-sm text-muted-foreground">{asset.category2}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      <div className="flex-shrink-0 text-right sm:min-w-[120px]">
                        <div
                          className={cn(
                            'text-base font-bold sm:text-lg',
                            isLiabilityCategory(asset.category1, assetCategories)
                              ? 'text-red-600'
                              : 'text-green-600'
                          )}
                        >
                          {formatCurrency(Math.abs(asset.balance))}
                        </div>
                      </div>
                      {canEdit && (
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => {
                              setEditingAsset(asset)
                              setFormOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={async () => {
                              if (ledgerId && confirm('정말 삭제하시겠습니까?')) {
                                try {
                                  await deleteAsset(ledgerId, asset.id)
                                } catch (error) {
                                  console.error('자산 삭제 실패:', error)
                                  alert('자산 삭제에 실패했습니다.')
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 자산 내보내기 모달 */}
      {ledgerId && (
        <ExportAssetModal open={exportOpen} onOpenChange={setExportOpen} ledgerId={ledgerId} />
      )}

      {/* 자산 추가/수정 폼 */}
      {ledgerId && user && (
        <AssetForm
          open={formOpen}
          onOpenChange={setFormOpen}
          ledgerId={ledgerId}
          asset={editingAsset}
          onSubmit={async (data) => {
            try {
              if (editingAsset) {
                await updateAsset(ledgerId, editingAsset.id, data, user.uid)
              } else {
                await addAsset({ ...data, isActive: true }, user.uid)
              }
              setFormOpen(false)
              setEditingAsset(undefined)
            } catch (error) {
              console.error('자산 저장 실패:', error)
              alert('자산 저장에 실패했습니다.')
            }
          }}
        />
      )}
    </div>
  )
}
