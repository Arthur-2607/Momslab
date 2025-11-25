"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

interface BranchThemeContextType {
  branchColors: Record<string, string>
  setBranchColor: (branchId: string, color: string) => void
  getBranchColor: (branchId: string) => string
}

const BranchThemeContext = createContext<BranchThemeContextType | undefined>(undefined)

const DEFAULT_COLOR = "#10b981" // Default green color

export function BranchThemeProvider({ children }: { children: ReactNode }) {
  const [branchColors, setBranchColors] = useState<Record<string, string>>({})

  const setBranchColor = (branchId: string, color: string) => {
    setBranchColors((prev) => ({ ...prev, [branchId]: color }))
  }

  const getBranchColor = (branchId: string) => {
    return branchColors[branchId] || DEFAULT_COLOR
  }

  return (
    <BranchThemeContext.Provider value={{ branchColors, setBranchColor, getBranchColor }}>
      {children}
    </BranchThemeContext.Provider>
  )
}

export function useBranchTheme() {
  const context = useContext(BranchThemeContext)
  if (context === undefined) {
    throw new Error("useBranchTheme must be used within a BranchThemeProvider")
  }
  return context
}
