import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { ArrowLeft, Edit } from 'lucide-react'
import { useAssetStore } from '@/entities/asset/model/store'
import { useLedgerStore } from '@/entities/ledger/model/store'
import { useAuthStore } from '@/entities/user/model/store'
import { useLedgerPermission } from '@/shared/hooks/useLedgerPermission'
import { formatCurrency } from '@/shared/lib/utils'
import type { Asset } from '@/shared/types'
import { ROUTES } from '@/shared/config/routes'
import { AssetForm } from '@/features/asset-create'

export function AssetDetailPage() {
  const { ledgerId, assetId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { canEdit } = useLedgerPermission(ledgerId)

  const [formOpen, setFormOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>()

  const EMPTY_ASSETS: Asset[] = useMemo(() => [], [])
  const EMPTY_LOGS = useMemo(() => [], [])

  const storeAssets = useAssetStore((state) => {
    if (!ledgerId) return EMPTY_ASSETS
    return state.assets[ledgerId] || EMPTY_ASSETS
  })
  const assetLogs = useAssetStore((state) => {
    if (!ledgerId) return EMPTY_LOGS
    return state.assetLogs[ledgerId] || EMPTY_LOGS
  })
  const lastFetched = useAssetStore((state) => (ledgerId ? state.lastFetched[ledgerId] : undefined))
  const fetchAssets = useAssetStore((state) => state.fetchAssets)
  const fetchAssetLogs = useAssetStore((state) => state.fetchAssetLogs)
  const updateAsset = useAssetStore((state) => state.updateAsset)
  const currentLedger = useLedgerStore((state) =>
    ledgerId ? (state.ledgers.find((l) => l.id === ledgerId) ?? null) : null
  )

  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (!ledgerId || !currentLedger?.encryptionKey) return
    if (hasFetchedRef.current) return

    hasFetchedRef.current = true
    fetchAssets(ledgerId)
    fetchAssetLogs(ledgerId)
  }, [ledgerId, fetchAssets, fetchAssetLogs, currentLedger?.encryptionKey])

  const asset = useMemo(() => storeAssets.find((a) => a.id === assetId), [storeAssets, assetId])

  const logsForAsset = useMemo(
    () => assetLogs.filter((log) => log.assetId === assetId),
    [assetLogs, assetId]
  )

  if (!ledgerId || !assetId) {
    return null
  }

  if (!asset && !lastFetched) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-2"
          onClick={() => navigate(ROUTES.ASSETS(ledgerId))}
        >
          <ArrowLeft className="h-4 w-4" />
          자산 목록으로
        </Button>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">자산 정보를 불러오는 중입니다...</p>
        </Card>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-2"
          onClick={() => navigate(ROUTES.ASSETS(ledgerId))}
        >
          <ArrowLeft className="h-4 w-4" />
          자산 목록으로
        </Button>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">해당 자산을 찾을 수 없습니다.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="inline-flex items-center gap-2"
        onClick={() => navigate(ROUTES.ASSETS(ledgerId))}
      >
        <ArrowLeft className="h-4 w-4" />
        자산 목록으로
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{asset.name}</h1>
          <p className="mt-1 text-muted-foreground">
            {asset.category1} · {asset.category2}
          </p>
        </div>
        {canEdit && (
          <Button
            size="lg"
            className="flex items-center gap-2"
            onClick={() => {
              setEditingAsset(asset)
              setFormOpen(true)
            }}
          >
            <Edit className="h-5 w-5" />
            자산 수정
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>요약 및 변동 내역</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 요약 영역 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">현재 잔액</span>
              <span className="text-2xl font-semibold">
                {formatCurrency(Math.abs(asset.balance))}
              </span>
            </div>
            {asset.memo && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">메모</div>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                  {asset.memo}
                </p>
              </div>
            )}
          </div>

          {/* 구분선 */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">변동 내역</span>
            </div>
            <div className="max-h-[360px] space-y-2 overflow-y-auto">
              {logsForAsset.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  변동 내역이 없습니다.
                </p>
              ) : (
                logsForAsset.map((log) => (
                  <div key={log.id} className="rounded-md bg-muted/60 p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {getLogTypeLabel(log.type)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {log.createdAt.toLocaleString()}
                      </span>
                    </div>
                    {log.previousBalance !== undefined && log.newBalance !== undefined && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatCurrency(log.previousBalance)} → {formatCurrency(log.newBalance)}
                      </p>
                    )}
                    <p className="mt-1">{log.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {ledgerId && user && editingAsset && (
        <AssetForm
          open={formOpen}
          onOpenChange={setFormOpen}
          ledgerId={ledgerId}
          asset={editingAsset}
          onSubmit={async (data) => {
            try {
              await updateAsset(ledgerId, editingAsset.id, data, user.uid)
              setFormOpen(false)
              setEditingAsset(undefined)
            } catch (error) {
              console.error('자산 수정 실패:', error)
              alert('자산 수정에 실패했습니다.')
            }
          }}
        />
      )}
    </div>
  )
}

function getLogTypeLabel(type: import('@/entities/asset/model/types').AssetLogType): string {
  switch (type) {
    case 'created':
      return '생성'
    case 'updated':
      return '정보 수정'
    case 'balance_changed':
      return '잔액 변경'
    case 'deactivated':
      return '비활성화'
    case 'reactivated':
      return '재활성화'
    default:
      return type
  }
}
