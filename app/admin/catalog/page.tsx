"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface CatalogItem {
  id: string
  name: string
  category: string
  imageUrl: string
  recommendedPrice: number
  recommendedMoq: number
  description: string
}

export default function CatalogPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null)

  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([
    {
      id: "cat-001",
      name: "제주 한라봉",
      category: "과일",
      imageUrl: "/fresh-jeju-hallabong-oranges-in-box.jpg",
      recommendedPrice: 12000,
      recommendedMoq: 100,
      description: "달콤하고 신선한 제주 한라봉",
    },
    {
      id: "cat-002",
      name: "GAP 인증 사과",
      category: "과일",
      imageUrl: "/fresh-red-apples-in-basket.jpg",
      recommendedPrice: 8000,
      recommendedMoq: 50,
      description: "안전하고 신선한 GAP 인증 사과",
    },
    {
      id: "cat-003",
      name: "국내산 딸기",
      category: "과일",
      imageUrl: "/fresh-korean-strawberries.jpg",
      recommendedPrice: 15000,
      recommendedMoq: 80,
      description: "달콤한 국내산 딸기",
    },
  ])

  const filteredItems = catalogItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleSave = () => {
    toast({
      title: "저장 완료",
      description: "품목이 저장되었습니다.",
    })
    setIsDialogOpen(false)
    setEditingItem(null)
  }

  const handleDelete = (id: string) => {
    setCatalogItems(catalogItems.filter((item) => item.id !== id))
    toast({
      title: "삭제 완료",
      description: "품목이 삭제되었습니다.",
    })
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">품목 관리</h1>
          <p className="text-gray-600 mt-1">마스터 품목 카탈로그를 관리하세요</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus className="mr-2 h-4 w-4" />
              품목 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "품목 수정" : "품목 추가"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">상품명 *</Label>
                <Input id="name" placeholder="상품명을 입력하세요" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Select defaultValue="과일">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="과일">과일</SelectItem>
                    <SelectItem value="채소">채소</SelectItem>
                    <SelectItem value="육류">육류</SelectItem>
                    <SelectItem value="수산물">수산물</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">이미지 업로드</Label>
                <Input id="image" type="file" accept="image/*" />
                <p className="text-sm text-gray-500">최대 5장, 5MB 이하</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">상세 설명</Label>
                <Textarea id="description" placeholder="상품 설명을 입력하세요" rows={4} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">권장 가격 (원)</Label>
                  <Input id="price" type="number" placeholder="12000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moq">권장 MOQ (개)</Label>
                  <Input id="moq" type="number" placeholder="100" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleSave}>저장하기</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="상품명 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="과일">과일</SelectItem>
                <SelectItem value="채소">채소</SelectItem>
                <SelectItem value="육류">육류</SelectItem>
                <SelectItem value="수산물">수산물</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">이미지</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">상품명</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">카테고리</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">권장 가격</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">권장 MOQ</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded">
                      <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{item.name}</td>
                  <td className="px-6 py-4 text-gray-600">{item.category}</td>
                  <td className="px-6 py-4">{item.recommendedPrice.toLocaleString()}원</td>
                  <td className="px-6 py-4">{item.recommendedMoq}개</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingItem(item)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
