"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getAdminToken, logoutAdmin } from "@/lib/admin-auth"
import { mockBranches } from "@/lib/mock-data"
import { LayoutDashboard, Package, ShoppingCart, Store, Users, ClipboardList, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const token = getAdminToken()

  const handleLogout = () => {
    logoutAdmin()
    toast({
      title: "로그아웃",
      description: "로그아웃되었습니다.",
    })
    router.push("/admin/login")
  }

  const superAdminLinks = [
    { href: "/admin/dashboard", label: "대시보드", icon: LayoutDashboard },
    { href: "/admin/catalog", label: "품목 관리", icon: Package },
    { href: "/admin/orders", label: "주문 관리", icon: ShoppingCart },
    { href: "/admin/branches", label: "지점 관리", icon: Store },
    { href: "/admin/admins", label: "운영자 관리", icon: Users },
  ]

  const branchOwnerLinks = [
    { href: "/admin/pickup", label: "픽업 관리", icon: ClipboardList },
    { href: "/admin/branch-orders", label: "주문 내역", icon: ShoppingCart },
    { href: "/admin/branch-products", label: "상품 관리", icon: Package },
  ]

  const links = token?.role === "super_admin" ? superAdminLinks : branchOwnerLinks

  const getBranchOwnerTitle = () => {
    if (token?.role === "branch_owner" && token.branchId) {
      const branch = mockBranches.find((b) => b.id === token.branchId)
      if (branch) {
        return `${branch.name} 점주`
      }
    }
    return "지점 점주"
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50">
      <div className="p-6">
        <h2 className="text-xl font-bold">관리자 페이지</h2>
        <p className="text-sm text-gray-600 mt-1">
          {token?.role === "super_admin" ? "Super Admin" : getBranchOwnerTitle()}
        </p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-gray-700 hover:bg-gray-100",
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </div>
            </Link>
          )
        })}
      </nav>
      <div className="p-3">
        <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </div>
  )
}
