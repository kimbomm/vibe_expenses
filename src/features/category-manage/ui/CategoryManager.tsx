import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Lock } from 'lucide-react'
import { useCategoryStore } from '@/entities/category/model/store'
import { isLiabilityCategory } from '@/shared/lib/utils/asset'
import type { CategoryType } from '@/shared/types'

const categoryLabels: Record<CategoryType, string> = {
  income: '수입 카테고리',
  expense: '지출 카테고리',
  payment: '결제수단',
  asset: '자산 카테고리',
}

interface CategoryManagerProps {
  ledgerId: string
  type: CategoryType
}

export function CategoryManager({ ledgerId, type }: CategoryManagerProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [editingCategory1, setEditingCategory1] = useState<string | null>(null)
  const [editingCategory2, setEditingCategory2] = useState<{
    category1: string
    name: string
  } | null>(null)
  const [newCategory1Name, setNewCategory1Name] = useState('')
  const [newCategory2Name, setNewCategory2Name] = useState('')
  const [showAddCategory1, setShowAddCategory1] = useState(false)
  const [showAddCategory2, setShowAddCategory2] = useState<string | null>(null)

  const ledgerCategories = useCategoryStore((state) => state.categories[ledgerId])
  const loading = useCategoryStore((state) => state.loading[ledgerId])
  const addCategory1 = useCategoryStore((state) => state.addCategory1)
  const updateCategory1 = useCategoryStore((state) => state.updateCategory1)
  const deleteCategory1 = useCategoryStore((state) => state.deleteCategory1)
  const addCategory2 = useCategoryStore((state) => state.addCategory2)
  const updateCategory2 = useCategoryStore((state) => state.updateCategory2)
  const deleteCategory2 = useCategoryStore((state) => state.deleteCategory2)

  const categories = ledgerCategories?.[type] || {}
  const isLoading = loading ?? !ledgerCategories

  const toggleExpand = (category1: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category1)) {
      newExpanded.delete(category1)
    } else {
      newExpanded.add(category1)
    }
    setExpandedCategories(newExpanded)
  }

  const handleAddCategory1 = async () => {
    if (!newCategory1Name.trim()) return
    try {
      await addCategory1(ledgerId, type, newCategory1Name.trim())
      setNewCategory1Name('')
      setShowAddCategory1(false)
    } catch (error) {
      console.error('1단계 카테고리 추가 실패:', error)
    }
  }

  const handleUpdateCategory1 = async (oldName: string) => {
    if (!newCategory1Name.trim() || newCategory1Name.trim() === oldName) return

    // 부채 카테고리 수정 방지
    if (type === 'asset' && isLiabilityCategory(oldName, categories)) {
      alert('부채 카테고리는 수정할 수 없습니다.')
      setEditingCategory1(null)
      setNewCategory1Name('')
      return
    }

    try {
      await updateCategory1(ledgerId, type, oldName, newCategory1Name.trim())
      setEditingCategory1(null)
      setNewCategory1Name('')
    } catch (error) {
      console.error('1단계 카테고리 수정 실패:', error)
      const errorMessage = error instanceof Error ? error.message : '카테고리 수정에 실패했습니다.'
      alert(errorMessage)
    }
  }

  const handleDeleteCategory1 = async (name: string) => {
    // 부채 카테고리 삭제 방지
    if (type === 'asset' && isLiabilityCategory(name, categories)) {
      alert('부채 카테고리는 삭제할 수 없습니다.')
      return
    }

    if (confirm(`"${name}" 카테고리를 삭제하시겠습니까? 하위 카테고리도 모두 삭제됩니다.`)) {
      try {
        await deleteCategory1(ledgerId, type, name)
      } catch (error) {
        console.error('1단계 카테고리 삭제 실패:', error)
        const errorMessage =
          error instanceof Error ? error.message : '카테고리 삭제에 실패했습니다.'
        alert(errorMessage)
      }
    }
  }

  const handleAddCategory2 = async (category1: string) => {
    if (!newCategory2Name.trim()) return
    try {
      await addCategory2(ledgerId, type, category1, newCategory2Name.trim())
      setNewCategory2Name('')
      setShowAddCategory2(null)
    } catch (error) {
      console.error('2단계 카테고리 추가 실패:', error)
    }
  }

  const handleUpdateCategory2 = async (category1: string, oldName: string) => {
    if (!newCategory2Name.trim() || newCategory2Name.trim() === oldName) return
    try {
      await updateCategory2(ledgerId, type, category1, oldName, newCategory2Name.trim())
      setEditingCategory2(null)
      setNewCategory2Name('')
    } catch (error) {
      console.error('2단계 카테고리 수정 실패:', error)
    }
  }

  const handleDeleteCategory2 = async (category1: string, name: string) => {
    if (confirm(`"${name}" 카테고리를 삭제하시겠습니까?`)) {
      try {
        await deleteCategory2(ledgerId, type, category1, name)
      } catch (error) {
        console.error('2단계 카테고리 삭제 실패:', error)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{categoryLabels[type]}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNewCategory1Name('')
              setShowAddCategory1(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            1단계 추가
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && (
          <div className="text-sm text-muted-foreground">카테고리를 불러오는 중입니다...</div>
        )}

        {!isLoading && Object.keys(categories).length === 0 && (
          <div className="text-sm text-muted-foreground">등록된 카테고리가 없습니다.</div>
        )}

        {Object.entries(categories).map(([category1, category2List]) => {
          const isLiability = type === 'asset' && isLiabilityCategory(category1, categories)

          return (
            <div key={category1} className="space-y-1">
              <div className="relative rounded-lg border p-2">
                {editingCategory1 === category1 ? (
                  <div className="flex flex-1 items-center gap-2">
                    <Input
                      value={newCategory1Name}
                      onChange={(e) => setNewCategory1Name(e.target.value)}
                      placeholder="카테고리 이름"
                      className="flex-1"
                      autoFocus
                      disabled={isLiability}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleUpdateCategory1(category1)}
                      disabled={isLiability}
                    >
                      저장
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCategory1(null)
                        setNewCategory1Name('')
                      }}
                    >
                      취소
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* 모바일: 수정/삭제 버튼 우상단 */}
                    <div className="absolute right-2 top-2 flex items-center gap-1 sm:hidden">
                      {isLiability ? (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Lock className="h-3 w-3" />
                          <span>고정</span>
                        </div>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setEditingCategory1(category1)
                              setNewCategory1Name(category1)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500"
                            onClick={() => handleDeleteCategory1(category1)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                    {/* PC: 타이틀, 수정/삭제, 2단계 추가 모두 같은 라인 */}
                    <div className="flex items-center gap-2 pr-20 sm:pr-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleExpand(category1)}
                      >
                        {expandedCategories.has(category1) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <span className="flex flex-1 items-center gap-2 font-medium">
                        {category1}
                        {isLiability && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Lock className="h-3 w-3" />
                            <span className="hidden sm:inline">고정 카테고리</span>
                          </span>
                        )}
                      </span>
                      <div className="hidden items-center gap-1 sm:flex">
                        {!isLiability && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                setEditingCategory1(category1)
                                setNewCategory1Name(category1)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500"
                              onClick={() => handleDeleteCategory1(category1)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // 아코디언이 닫혀있으면 열기
                            if (!expandedCategories.has(category1)) {
                              toggleExpand(category1)
                            }
                            setNewCategory2Name('')
                            setShowAddCategory2(category1)
                          }}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          2단계 추가
                        </Button>
                      </div>
                    </div>
                    {/* 모바일: 2단계 추가 버튼 하단 full 너비 */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full sm:hidden"
                      onClick={() => {
                        // 아코디언이 닫혀있으면 열기
                        if (!expandedCategories.has(category1)) {
                          toggleExpand(category1)
                        }
                        setNewCategory2Name('')
                        setShowAddCategory2(category1)
                      }}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      2단계 추가
                    </Button>
                  </>
                )}
              </div>

              {expandedCategories.has(category1) && (
                <div className="ml-8 space-y-1">
                  {category2List.map((category2) => (
                    <div
                      key={category2}
                      className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2"
                    >
                      {editingCategory2?.category1 === category1 &&
                      editingCategory2?.name === category2 ? (
                        <div className="flex flex-1 items-center gap-2">
                          <Input
                            value={newCategory2Name}
                            onChange={(e) => setNewCategory2Name(e.target.value)}
                            placeholder="카테고리 이름"
                            className="flex-1"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleUpdateCategory2(category1, category2)}
                          >
                            저장
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCategory2(null)
                              setNewCategory2Name('')
                            }}
                          >
                            취소
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1 text-sm">{category2}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setEditingCategory2({ category1, name: category2 })
                              setNewCategory2Name(category2)
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500"
                            onClick={() => handleDeleteCategory2(category1, category2)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                  {showAddCategory2 === category1 && (
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2">
                      <Input
                        value={newCategory2Name}
                        onChange={(e) => setNewCategory2Name(e.target.value)}
                        placeholder="2단계 카테고리 이름"
                        className="flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddCategory2(category1)
                          } else if (e.key === 'Escape') {
                            setShowAddCategory2(null)
                            setNewCategory2Name('')
                          }
                        }}
                      />
                      <Button size="sm" onClick={() => handleAddCategory2(category1)}>
                        추가
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddCategory2(null)
                          setNewCategory2Name('')
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {showAddCategory1 && (
          <div className="flex items-center gap-2 rounded-lg border p-2">
            <Input
              value={newCategory1Name}
              onChange={(e) => setNewCategory1Name(e.target.value)}
              placeholder="1단계 카테고리 이름"
              className="flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddCategory1()
                } else if (e.key === 'Escape') {
                  setShowAddCategory1(false)
                  setNewCategory1Name('')
                }
              }}
            />
            <Button size="sm" onClick={handleAddCategory1}>
              추가
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAddCategory1(false)
                setNewCategory1Name('')
              }}
            >
              취소
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
