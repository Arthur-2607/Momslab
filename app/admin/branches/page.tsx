"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockBranches } from "@/lib/mock-data"
import type { Branch } from "@/lib/types"
import { Plus, Pencil, ExternalLink, Palette } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useBranchTheme } from "@/lib/branch-theme-context"

export default function BranchesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [editColor, setEditColor] = useState<string>("#10b981")
  const { toast } = useToast()
  const { setBranchColor, getBranchColor } = useBranchTheme()

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch)
    setEditColor(getBranchColor(branch.id))
    setIsEditDialogOpen(true)
  }

  const handleSave = () => {
    if (selectedBranch) {
      setBranchColor(selectedBranch.id, editColor)
    }
    toast({
      title: "저장 완료",
      description: "지점 정보가 저장되었습니다.",
    })
    setIsEditDialogOpen(false)
    setIsAddDialogOpen(false)
  }

  const handleColorChange = (branchId: string, color: string) => {
    setBranchColor(branchId, color)
    toast({
      title: "테마 색상 변경",
      description: "지점의 테마 색상이 즉시 변경되었습니다.",
    })
  }

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">지점 관리</h1>
          <p className="text-gray-600 mt-1">지점을 관리하세요</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          지점 추가
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockBranches.map((branch) => {
          const branchColor = getBranchColor(branch.id)
          return (
            <Card key={branch.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{branch.name}</h3>
                      <div
                        className="w-4 h-4 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: branchColor }}
                        title={`테마 색상: ${branchColor}`}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">/{branch.slug}</p>
                    <p className="text-sm text-gray-600 mt-2">{branch.notificationPhone}</p>
                    {branch.websiteUrl && (
                      <Link
                        href={branch.websiteUrl}
                        className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {branch.websiteUrl}
                      </Link>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          branch.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {branch.status === "active" ? "활성" : "비활성"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Label htmlFor={`color-${branch.id}`} className="text-xs text-gray-600 flex items-center gap-1">
                        <Palette className="h-3 w-3" />
                        테마 색상:
                      </Label>
                      <input
                        type="color"
                        id={`color-${branch.id}`}
                        value={branchColor}
                        onChange={(e) => handleColorChange(branch.id, e.target.value)}
                        className="w-12 h-8 rounded cursor-pointer border border-gray-300"
                      />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(branch)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>지점 추가</DialogTitle>
            <DialogDescription>새로운 지점 정보를 입력하세요.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">지점명</Label>
              <Input id="name" placeholder="강남점" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">URL 슬러그</Label>
              <Input id="slug" placeholder="gangnam" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">웹사이트 URL</Label>
              <Input id="website" placeholder="https://gangnam.momslab.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">알림 전화번호</Label>
              <Input id="phone" placeholder="02-1234-5678" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kakao">카카오 채널 ID</Label>
              <Input id="kakao" placeholder="gangnam_channel" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">상태</Label>
              <Select defaultValue="active">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>지점 수정</DialogTitle>
            <DialogDescription>지점 정보를 수정하세요.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">지점명</Label>
              <Input id="edit-name" defaultValue={selectedBranch?.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-slug">URL 슬러그</Label>
              <Input id="edit-slug" defaultValue={selectedBranch?.slug} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-website">웹사이트 URL</Label>
              <Input id="edit-website" defaultValue={selectedBranch?.websiteUrl} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">알림 전화번호</Label>
              <Input id="edit-phone" defaultValue={selectedBranch?.notificationPhone} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-kakao">카카오 채널 ID</Label>
              <Input id="edit-kakao" defaultValue={selectedBranch?.kakaoChannelId} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">상태</Label>
              <Select defaultValue={selectedBranch?.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-color" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                테마 색상
              </Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="edit-color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-20 h-10 rounded cursor-pointer border border-gray-300"
                />
                <Input
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  placeholder="#10b981"
                  className="flex-1"
                />
                <div
                  className="w-10 h-10 rounded border-2 border-gray-300"
                  style={{ backgroundColor: editColor }}
                />
              </div>
              <p className="text-xs text-gray-500">이 색상은 지점의 버튼, 헤더 등 주요 UI 요소에 적용됩니다.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
