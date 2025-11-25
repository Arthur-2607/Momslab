"use client"

import { useState, useEffect } from "react"

export function useCountdown(endAt: string) {
  const [timeLeft, setTimeLeft] = useState("")
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(endAt).getTime()
      const diff = end - now

      if (diff <= 0) {
        setTimeLeft("마감")
        setIsExpired(true)
        return null
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
      setIsExpired(false)
      return diff
    }

    // 초기 계산
    calculateTimeLeft()

    // 1초마다 업데이트
    const interval = setInterval(() => {
      const diff = calculateTimeLeft()
      if (diff === null) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [endAt])

  return { timeLeft, isExpired }
}
