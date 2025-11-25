"use client"

import { Button } from "@/components/ui/button"
import { mockProducts } from "@/lib/mock-data"
import { getAdminToken } from "@/lib/admin-auth"
import { Plus, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

// Utility function to strip HTML tags from text
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

export default function BranchProductsPage() {
  const token = getAdminToken()
  const branchProducts = mockProducts.filter((p) => p.branchId === token?.branchId)
  const [showCatalogDialog, setShowCatalogDialog] = useState(false)
  const [selectedCatalogProducts, setSelectedCatalogProducts] = useState<string[]>([])
  const { toast } = useToast()

  const catalogProducts = mockProducts.filter((p) => !p.branchId || p.branchId !== token?.branchId)

  const handleAddFromCatalog = () => {
    if (selectedCatalogProducts.length === 0) {
      toast({
        title: "상품을 선택하세요",
        description: "추가할 상품을 선택해주세요.",
        variant: "destructive",
      })
      return
    }
    toast({
      title: "상품 추가 완료",
      description: `${selectedCatalogProducts.length}개의 상품이 추가되었습니다.`,
    })
    setShowCatalogDialog(false)
    setSelectedCatalogProducts([])
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">상품 관리</h1>
          <p className="text-gray-600 mt-1">지점의 상품을 관리하세요</p>
        </div>
        <Button onClick={() => setShowCatalogDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          카탈로그에서 추가
        </Button>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">이미지</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">상품명</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">가격</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">MOQ</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">현재 주문</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">상태</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {branchProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded">
                      <Image
                        src={product.imageUrl || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4">{product.price.toLocaleString()}원</td>
                  <td className="px-6 py-4">{product.moq}개</td>
                  <td className="px-6 py-4">
                    {product.currentOrders || 0}/{product.moq}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        product.status === "open"
                          ? "bg-green-100 text-green-800"
                          : product.status === "soldout"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.status === "open" ? "판매중" : product.status === "soldout" ? "마감" : "마감"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
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

      <Dialog open={showCatalogDialog} onOpenChange={setShowCatalogDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>카탈로그에서 상품 추가</DialogTitle>
            <DialogDescription>추가할 상품을 선택하세요. 선택한 상품이 지점에 추가됩니다.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {catalogProducts.map((product) => (
                <div key={product.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    checked={selectedCatalogProducts.includes(product.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCatalogProducts([...selectedCatalogProducts, product.id])
                      } else {
                        setSelectedCatalogProducts(selectedCatalogProducts.filter((id) => id !== product.id))
                      }
                    }}
                  />
                  <div className="relative h-16 w-16 overflow-hidden rounded flex-shrink-0">
                    <Image
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{product.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{stripHtmlTags(product.description)}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm font-semibold">{product.price.toLocaleString()}원</span>
                      <span className="text-sm text-gray-600">MOQ: {product.moq}개</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCatalogDialog(false)}>
              취소
            </Button>
            <Button onClick={handleAddFromCatalog}>
              {selectedCatalogProducts.length > 0 ? `${selectedCatalogProducts.length}개 추가` : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
