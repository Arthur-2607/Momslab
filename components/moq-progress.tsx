import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface MoqProgressProps {
  current: number
  moq: number
  className?: string
  themeColor?: string
}

export function MoqProgress({ current, moq, className, themeColor = "#10b981" }: MoqProgressProps) {
  const percentage = Math.min((current / moq) * 100, 100)
  const isAchieved = current >= moq

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: isAchieved ? "#9ca3af" : themeColor,
          }}
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span
          className={cn("font-medium", isAchieved ? "text-gray-600 dark:text-gray-400" : "")}
          style={!isAchieved ? { color: themeColor } : undefined}
        >
          {current}/{moq}개 달성
        </span>
        <span
          className={cn("font-semibold", isAchieved ? "text-gray-600 dark:text-gray-400" : "")}
          style={!isAchieved ? { color: themeColor } : undefined}
        >
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}
