import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  History,
  PlusCircle,
  Edit,
  X,
  Trash2,
} from 'lucide-react'
import { useMockDataStore } from '@/stores/mockDataStore'
import { mockAssetLogs } from '@/lib/mocks/mockData'
import { formatCurrency, formatDateString, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { AssetForm } from '@/components/asset/AssetForm'
import type { Asset } from '@/types'

export function AssetsPage() {
  const { ledgerId } = useParams()
  const [showLogs, setShowLogs] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>()

  const { assets: storeAssets, addAsset, updateAsset, deleteAsset } = useMockDataStore()

  const assets = storeAssets.filter((a) => a.ledgerId === ledgerId && a.isActive)

  // 자산 로그 필터링 및 정렬
  const assetLogs = mockAssetLogs
    .filter((log) => log.ledgerId === ledgerId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

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

  // 총 자산 계산
  const totalAssets = assets.filter((a) => a.balance > 0).reduce((sum, a) => sum + a.balance, 0)
  const totalLiabilities = Math.abs(
    assets.filter((a) => a.balance < 0).reduce((sum, a) => sum + a.balance, 0)
  )
  const netWorth = totalAssets - totalLiabilities

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">자산 현황</h1>
          <p className="mt-1 text-muted-foreground">나의 자산을 관리하세요</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showLogs ? 'default' : 'outline'}
            size="lg"
            onClick={() => setShowLogs(!showLogs)}
            className="w-full sm:w-auto"
          >
            <History className="mr-2 h-5 w-5" />
            변경 이력
          </Button>
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => {
              setEditingAsset(undefined)
              setFormOpen(true)
            }}
          >
            <Plus className="mr-2 h-5 w-5" />
            자산 추가
          </Button>
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
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalAssets)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 부채</CardTitle>
            <TrendingDown className="h-4 w-4 flex-shrink-0 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
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
            <div className="text-2xl font-bold">{formatCurrency(netWorth)}</div>
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
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 text-left sm:text-right">
                        <div
                          className={cn(
                            'text-lg font-bold',
                            asset.balance >= 0 ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {formatCurrency(Math.abs(asset.balance))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
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
                          onClick={() => {
                            if (confirm('정말 삭제하시겠습니까?')) {
                              deleteAsset(asset.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 자산 변경 이력 */}
      {showLogs && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>자산 변경 이력</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowLogs(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assetLogs.map((log) => {
                const asset = assets.find((a) => a.id === log.assetId)
                const getLogIcon = () => {
                  switch (log.type) {
                    case 'created':
                      return <PlusCircle className="h-4 w-4 text-blue-500" />
                    case 'updated':
                      return <Edit className="h-4 w-4 text-primary" />
                    case 'balance_changed':
                      return <TrendingUp className="h-4 w-4 text-green-500" />
                    case 'deactivated':
                      return <X className="h-4 w-4 text-red-500" />
                    case 'reactivated':
                      return <PlusCircle className="h-4 w-4 text-green-500" />
                    default:
                      return <History className="h-4 w-4 text-muted-foreground" />
                  }
                }

                const getLogLabel = () => {
                  switch (log.type) {
                    case 'created':
                      return '생성'
                    case 'updated':
                      return '수정'
                    case 'balance_changed':
                      return '잔액 변경'
                    case 'deactivated':
                      return '비활성화'
                    case 'reactivated':
                      return '재활성화'
                    default:
                      return '변경'
                  }
                }

                return (
                  <div key={log.id} className="flex items-start gap-4 rounded-lg border p-4">
                    <div className="flex-shrink-0 rounded-lg bg-muted p-2">{getLogIcon()}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{asset?.name || '알 수 없음'}</span>
                        <span className="text-xs text-muted-foreground">({getLogLabel()})</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{log.description}</p>
                      {log.type === 'balance_changed' && log.previousBalance !== undefined && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">
                            {formatCurrency(log.previousBalance)}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-semibold text-primary">
                            {formatCurrency(log.newBalance || 0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xs text-muted-foreground">
                        {formatDateString(log.createdAt)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeTime(log.createdAt)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 자산 추가/수정 폼 */}
      {ledgerId && (
        <AssetForm
          open={formOpen}
          onOpenChange={setFormOpen}
          ledgerId={ledgerId}
          asset={editingAsset}
          onSubmit={(data) => {
            if (editingAsset) {
              updateAsset(editingAsset.id, data)
            } else {
              addAsset(data)
            }
          }}
        />
      )}
    </div>
  )
}
