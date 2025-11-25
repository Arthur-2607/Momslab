"use client"

/**
 * Branch Products Page - New Architecture Example
 * 
 * This demonstrates how to use the new layered architecture:
 * - Import Server Actions from @/lib/server
 * - Call them as regular functions
 * - Handle loading states
 * - Display results
 */

import { useEffect, useState } from "react" 
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import {
    getProductsByBranch,
    listProducts,
    deleteProduct,
    updateProduct,
    updateProductStatus,
    createProduct,
    getAdminSession,
    type Product,
    type CreateProductDto,
} from "@/lib/server"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function BranchProductsPageNew() {
    const { toast } = useToast()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [branchId, setBranchId] = useState<string>("")
    const [adminName, setAdminName] = useState<string>("")
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)

    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [editForm, setEditForm] = useState({
        name: "",
        price: 0,
        moq: 0,
        stock: null as number | null,
        imageUrl: "",
        description: "",
        category: "",
    })
    const [editLoading, setEditLoading] = useState(false)

    // Add dialog state
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [addForm, setAddForm] = useState<CreateProductDto>({
        branchId: "",
        name: "",
        price: 0,
        moq: 1,
        stock: null,
        status: "open",
        imageUrl: "",
        description: "",
        category: "",
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    })
    const [addLoading, setAddLoading] = useState(false)

    // Load products on mount
    useEffect(() => {
        loadProducts()
    }, [])

    async function loadProducts() {
        setLoading(true)

        // Get admin session
        const session = await getAdminSession()

        if (!session) {
            toast({
                title: "인증 오류",
                description: "로그인 세션이 만료되었습니다",
                variant: "destructive",
            })
            setLoading(false)
            return
        }

        setAdminName(session.name)

        let result

        // Super admin: Load ALL products from ALL branches
        if (session.role === "super_admin") {
            setIsSuperAdmin(true)
            setBranchId("") // No specific branch

            result = await listProducts({
                limit: 100,
                offset: 0,
            })
        }
        // Branch owner: Load only their branch products
        else if (session.role === "branch_owner") {
            setIsSuperAdmin(false)

            // Validate branchId exists for branch owners
            if (!session.branchId) {
                toast({
                    title: "권한 오류",
                    description: "지점 정보를 찾을 수 없습니다",
                    variant: "destructive",
                })
                setLoading(false)
                return
            }

            setBranchId(session.branchId)
            result = await getProductsByBranch(session.branchId)
        }
        // Unknown role
        else {
            toast({
                title: "권한 오류",
                description: "접근 권한이 없습니다",
                variant: "destructive",
            })
            setLoading(false)
            return
        }

        if (result.success && result.products) {
            setProducts(result.products)
        } else {
            toast({
                title: "오류",
                description: result.error || "상품을 불러올 수 없습니다",
                variant: "destructive",
            })
        }

        setLoading(false)
    }

    async function handleDelete(id: string) {
        if (!confirm("이 상품을 삭제하시겠습니까?")) return

        const result = await deleteProduct(id)

        if (result.success) {
            toast({
                title: "삭제 완료",
                description: "상품이 삭제되었습니다",
            })
            loadProducts() // Reload
        } else {
            toast({
                title: "삭제 실패",
                description: result.error,
                variant: "destructive",
            })
        }
    }

    async function handleStatusChange(id: string, status: "open" | "closed" | "soldout") {
        const result = await updateProductStatus(id, status)

        if (result.success) {
            toast({
                title: "상태 변경 완료",
                description: "상품 상태가 변경되었습니다",
            })
            loadProducts() // Reload
        } else {
            toast({
                title: "상태 변경 실패",
                description: result.error,
                variant: "destructive",
            })
        }
    }

    function handleEditClick(product: Product) {
        setEditingProduct(product)
        setEditForm({
            name: product.name,
            price: product.price,
            moq: product.moq,
            stock: product.stock,
            imageUrl: product.imageUrl,
            description: product.description || "",
            category: product.category || "",
        })
        setEditDialogOpen(true)
    }

    async function handleEditSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!editingProduct) return

        setEditLoading(true)

        const result = await updateProduct({
            id: editingProduct.id,
            name: editForm.name,
            price: editForm.price,
            moq: editForm.moq,
            stock: editForm.stock,
            imageUrl: editForm.imageUrl,
            description: editForm.description,
            category: editForm.category,
        })

        setEditLoading(false)

        if (result.success) {
            toast({
                title: "수정 완료",
                description: "상품이 수정되었습니다",
            })
            setEditDialogOpen(false)
            loadProducts() // Reload
        } else {
            toast({
                title: "수정 실패",
                description: result.error,
                variant: "destructive",
            })
        }
    }

    function handleAddClick() {
        // Reset form
        setAddForm({
            branchId: branchId || "", // Use current branch for branch owners
            name: "",
            price: 0,
            moq: 1,
            stock: null,
            status: "open",
            imageUrl: "",
            description: "",
            category: "",
            startAt: new Date().toISOString(),
            endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        setAddDialogOpen(true)
    }

    async function handleAddSubmit(e: React.FormEvent) {
        e.preventDefault()
        setAddLoading(true)

        const result = await createProduct(addForm)

        setAddLoading(false)

        if (result.success) {
            toast({
                title: "추가 완료",
                description: "상품이 추가되었습니다",
            })
            setAddDialogOpen(false)
            loadProducts() // Reload
        } else {
            toast({
                title: "추가 실패",
                description: result.error,
                variant: "destructive",
            })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">상품 관리</h1>
                    <p className="text-gray-600 mt-1">
                        {adminName && `${adminName}님, `}
                        {isSuperAdmin ? "모든 지점의 상품을 관리하세요" : "지점의 상품을 관리하세요"}
                    </p>
                </div>
                <Button onClick={handleAddClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    상품 추가
                </Button>
            </div>

            <div className="rounded-lg border bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold">이미지</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">상품명</th>
                                {isSuperAdmin && (
                                    <th className="px-6 py-3 text-left text-sm font-semibold">지점 ID</th>
                                )}
                                <th className="px-6 py-3 text-left text-sm font-semibold">가격</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">MOQ</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">현재 주문</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">상태</th>
                                <th className="px-6 py-3 text-right text-sm font-semibold">작업</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={isSuperAdmin ? 8 : 7} className="px-6 py-8 text-center text-gray-500">
                                        등록된 상품이 없습니다
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
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
                                        {isSuperAdmin && (
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-mono text-gray-600">
                                                    {product.branchId.substring(0, 8)}...
                                                </span>
                                            </td>
                                        )}
                                        <td className="px-6 py-4">{product.price.toLocaleString()}원</td>
                                        <td className="px-6 py-4">{product.moq}개</td>
                                        <td className="px-6 py-4">
                                            {product.currentOrders}/{product.moq}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={product.status}
                                                onChange={(e) =>
                                                    handleStatusChange(product.id, e.target.value as any)
                                                }
                                                className="rounded border px-2 py-1 text-sm"
                                            >
                                                <option value="open">판매중</option>
                                                <option value="closed">마감</option>
                                                <option value="soldout">품절</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditClick(product)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Product Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>상품 수정</DialogTitle>
                        <DialogDescription>
                            상품 정보를 수정하세요
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">상품명 *</Label>
                            <Input
                                id="name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                required
                                placeholder="예: 제주 한라봉 5kg"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">가격 (원) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={editForm.price}
                                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                    required
                                    min="0"
                                    placeholder="12000"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="moq">최소 주문 수량 (MOQ) *</Label>
                                <Input
                                    id="moq"
                                    type="number"
                                    value={editForm.moq}
                                    onChange={(e) => setEditForm({ ...editForm, moq: Number(e.target.value) })}
                                    required
                                    min="1"
                                    placeholder="100"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="stock">재고 수량 (선택)</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    value={editForm.stock || ""}
                                    onChange={(e) => setEditForm({
                                        ...editForm,
                                        stock: e.target.value ? Number(e.target.value) : null
                                    })}
                                    min="0"
                                    placeholder="무제한 (비워두기)"
                                />
                                <p className="text-xs text-gray-500">비워두면 무제한 재고</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">카테고리</Label>
                                <Input
                                    id="category"
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    placeholder="예: 그로서리"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">이미지 URL *</Label>
                            <Input
                                id="imageUrl"
                                type="url"
                                value={editForm.imageUrl}
                                onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                                required
                                placeholder="https://example.com/image.jpg"
                            />
                            {editForm.imageUrl && (
                                <div className="relative h-32 w-32 mt-2 border rounded overflow-hidden">
                                    <Image
                                        src={editForm.imageUrl}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">상품 설명</Label>
                            <Textarea
                                id="description"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                placeholder="상품에 대한 자세한 설명을 입력하세요"
                                rows={4}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditDialogOpen(false)}
                                disabled={editLoading}
                            >
                                취소
                            </Button>
                            <Button type="submit" disabled={editLoading}>
                                {editLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        수정 중...
                                    </>
                                ) : (
                                    "수정 완료"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add Product Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>상품 추가</DialogTitle>
                        <DialogDescription>
                            새로운 상품을 등록하세요
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="add-name">상품명 *</Label>
                            <Input
                                id="add-name"
                                value={addForm.name}
                                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                                required
                                placeholder="예: 제주 한라봉 5kg"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="add-price">가격 (원) *</Label>
                                <Input
                                    id="add-price"
                                    type="number"
                                    value={addForm.price}
                                    onChange={(e) => setAddForm({ ...addForm, price: Number(e.target.value) })}
                                    required
                                    min="0"
                                    placeholder="12000"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="add-moq">최소 주문 수량 (MOQ) *</Label>
                                <Input
                                    id="add-moq"
                                    type="number"
                                    value={addForm.moq}
                                    onChange={(e) => setAddForm({ ...addForm, moq: Number(e.target.value) })}
                                    required
                                    min="1"
                                    placeholder="100"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="add-stock">재고 수량 (선택)</Label>
                                <Input
                                    id="add-stock"
                                    type="number"
                                    value={addForm.stock || ""}
                                    onChange={(e) => setAddForm({
                                        ...addForm,
                                        stock: e.target.value ? Number(e.target.value) : null
                                    })}
                                    min="0"
                                    placeholder="무제한 (비워두기)"
                                />
                                <p className="text-xs text-gray-500">비워두면 무제한 재고</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="add-category">카테고리</Label>
                                <Input
                                    id="add-category"
                                    value={addForm.category}
                                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                                    placeholder="예: 그로서리"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="add-imageUrl">이미지 URL *</Label>
                            <Input
                                id="add-imageUrl"
                                type="url"
                                value={addForm.imageUrl}
                                onChange={(e) => setAddForm({ ...addForm, imageUrl: e.target.value })}
                                required
                                placeholder="https://example.com/image.jpg"
                            />
                            {addForm.imageUrl && (
                                <div className="relative h-32 w-32 mt-2 border rounded overflow-hidden">
                                    <Image
                                        src={addForm.imageUrl}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="add-startAt">시작 날짜 *</Label>
                                <Input
                                    id="add-startAt"
                                    type="datetime-local"
                                    value={addForm.startAt ? new Date(addForm.startAt).toISOString().slice(0, 16) : ""}
                                    onChange={(e) => setAddForm({
                                        ...addForm,
                                        startAt: new Date(e.target.value).toISOString()
                                    })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="add-endAt">종료 날짜 *</Label>
                                <Input
                                    id="add-endAt"
                                    type="datetime-local"
                                    value={addForm.endAt ? new Date(addForm.endAt).toISOString().slice(0, 16) : ""}
                                    onChange={(e) => setAddForm({
                                        ...addForm,
                                        endAt: new Date(e.target.value).toISOString()
                                    })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="add-description">상품 설명</Label>
                            <Textarea
                                id="add-description"
                                value={addForm.description}
                                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                                placeholder="상품에 대한 자세한 설명을 입력하세요"
                                rows={4}
                            />
                        </div>

                        {isSuperAdmin && (
                            <div className="space-y-2">
                                <Label htmlFor="add-branchId">지점 ID *</Label>
                                <Input
                                    id="add-branchId"
                                    value={addForm.branchId}
                                    onChange={(e) => setAddForm({ ...addForm, branchId: e.target.value })}
                                    required
                                    placeholder="지점 UUID를 입력하세요"
                                />
                                <p className="text-xs text-gray-500">슈퍼 관리자는 지점 ID를 직접 입력해야 합니다</p>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAddDialogOpen(false)}
                                disabled={addLoading}
                            >
                                취소
                            </Button>
                            <Button type="submit" disabled={addLoading}>
                                {addLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        추가 중...
                                    </>
                                ) : (
                                    "추가 완료"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

