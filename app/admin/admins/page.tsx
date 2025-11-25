"use client"

import { Button } from "@/components/ui/button"
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
import { mockAdmins, mockBranches } from "@/lib/mock-data"
import type { Admin } from "@/lib/types"
import { Plus, Pencil } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function AdminsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [selectedRole, setSelectedRole] = useState<"super_admin" | "branch_owner">("branch_owner")
  const { toast } = useToast()

  const handleEdit = (admin: Admin) => {
    setSelectedAdmin(admin)
    setSelectedRole(admin.role)
    setIsEditDialogOpen(true)
  }

  const handleSave = () => {
    toast({
      title: "저장 완료",
      description: "운영자 정보가 저장되었습니다.",
    })
    setIsEditDialogOpen(false)
    setIsAddDialogOpen(false)
  }

  const getBranchName = (branchId?: string) => {
    if (!branchId) return "-"
    const branch = mockBranches.find((b) => b.id === branchId)
    return branch?.name || "-"
  }

  return (
    <div className="flex">
      {/* Removed duplicate AdminGuard and AdminSidebar imports since they're in the layout */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">운영자 관리</h1>
            <p className="text-gray-600 mt-1">관리자 계정을 관리하세요</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            운영자 추가
          </Button>
        </div>

        <div className="rounded-lg border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">아이디</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">역할</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">담당 지점</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{admin.username}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          admin.role === "super_admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {admin.role === "super_admin" ? "Super Admin" : "지점 점주"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{getBranchName(admin.branchId)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(admin)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>운영자 추가</DialogTitle>
              <DialogDescription>새로운 운영자 계정을 생성하세요.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">아이디</Label>
                <Input id="username" placeholder="admin_username" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">역할</Label>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="branch_owner">지점 점주</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedRole === "branch_owner" && (
                <div className="grid gap-2">
                  <Label htmlFor="branch">담당 지점</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="지점 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBranches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
              <DialogTitle>운영자 수정</DialogTitle>
              <DialogDescription>운영자 정보를 수정하세요.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-username">아이디</Label>
                <Input id="edit-username" defaultValue={selectedAdmin?.username} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">새 비밀번호 (선택사항)</Label>
                <Input id="edit-password" type="password" placeholder="변경하려면 입력하세요" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">역할</Label>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="branch_owner">지점 점주</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedRole === "branch_owner" && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-branch">담당 지점</Label>
                  <Select defaultValue={selectedAdmin?.branchId}>
                    <SelectTrigger>
                      <SelectValue placeholder="지점 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBranches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleSave}>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
