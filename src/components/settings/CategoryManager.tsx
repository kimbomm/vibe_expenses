import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useMockDataStore } from '@/stores/mockDataStore'
import { cn } from '@/lib/utils'

type CategoryType = 'income' | 'expense' | 'payment' | 'asset'

const categoryLabels: Record<CategoryType, string> = {
  income: '수입 카테고리',
  expense: '지출 카테고리',
  payment: '지출방법',
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

  const store = useMockDataStore()
  const categories = store.getCategories(ledgerId, type)

  const toggleExpand = (category1: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category1)) {
      newExpanded.delete(category1)
    } else {
      newExpanded.add(category1)
    }
    setExpandedCategories(newExpanded)
  }

  const handleAddCategory1 = () => {
    if (newCategory1Name.trim()) {
      store.addCategory1(ledgerId, type, newCategory1Name.trim())
      setNewCategory1Name('')
      setShowAddCategory1(false)
    }
  }

  const handleUpdateCategory1 = (oldName: string) => {
    if (newCategory1Name.trim() && newCategory1Name.trim() !== oldName) {
      store.updateCategory1(ledgerId, type, oldName, newCategory1Name.trim())
      setEditingCategory1(null)
      setNewCategory1Name('')
    }
  }

  const handleDeleteCategory1 = (name: string) => {
    if (confirm(`"${name}" 카테고리를 삭제하시겠습니까? 하위 카테고리도 모두 삭제됩니다.`)) {
      store.deleteCategory1(ledgerId, type, name)
    }
  }

  const handleAddCategory2 = (category1: string) => {
    if (newCategory2Name.trim()) {
      store.addCategory2(ledgerId, type, category1, newCategory2Name.trim())
      setNewCategory2Name('')
      setShowAddCategory2(null)
    }
  }

  const handleUpdateCategory2 = (category1: string, oldName: string) => {
    if (newCategory2Name.trim() && newCategory2Name.trim() !== oldName) {
      store.updateCategory2(ledgerId, type, category1, oldName, newCategory2Name.trim())
      setEditingCategory2(null)
      setNewCategory2Name('')
    }
  }

  const handleDeleteCategory2 = (category1: string, name: string) => {
    if (confirm(`"${name}" 카테고리를 삭제하시겠습니까?`)) {
      store.deleteCategory2(ledgerId, type, category1, name)
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
        {Object.entries(categories).map(([category1, category2List]) => (
          <div key={category1} className="space-y-1">
            <div className="flex items-center gap-2 rounded-lg border p-2">
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
              {editingCategory1 === category1 ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    value={newCategory1Name}
                    onChange={(e) => setNewCategory1Name(e.target.value)}
                    placeholder="카테고리 이름"
                    className="flex-1"
                    autoFocus
                  />
                  <Button size="sm" onClick={() => handleUpdateCategory1(category1)}>
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
                  <span className="flex-1 font-medium">{category1}</span>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
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
        ))}

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
