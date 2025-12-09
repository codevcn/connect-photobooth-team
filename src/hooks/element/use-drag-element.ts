import { useState, useRef, useEffect, useCallback } from 'react'

type TPosition = { x: number; y: number }

export interface UseDraggableReturn {
  containerRef: React.RefObject<HTMLDivElement | null>
  dragButtonRef: React.RefObject<HTMLDivElement | null>
  isDragging: boolean
}

export const useDragElement = (
  currentPosition: TPosition,
  setCurrentPosition: (pos: TPosition) => void,
  disabled?: boolean,
  scaleFactor: number = 1
): UseDraggableReturn => {
  // ===== REFS =====
  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragButtonRef = useRef<HTMLDivElement | null>(null)
  const isDraggingRef = useRef(false)
  const offsetRef = useRef<TPosition>({ x: 0, y: 0 })

  // RAF refs
  const rafRef = useRef<number | null>(null)
  const pendingPositionRef = useRef<TPosition | null>(null)

  // Stable reference cho setCurrentPosition
  const setCurrentPositionRef = useRef(setCurrentPosition)

  // ===== STATE =====
  const [isDragging, setIsDragging] = useState<boolean>(false)

  // ===== UPDATE STABLE REFS =====
  useEffect(() => {
    setCurrentPositionRef.current = setCurrentPosition
  }, [setCurrentPosition])

  // ===== HANDLE FINAL POSITION WITH RAF =====
  const handleFinalPosition = useCallback(
    (posX: number, posY: number) => {
      // Lưu position mới nhất vào ref (không trigger re-render)
      pendingPositionRef.current = {
        x: posX / scaleFactor,
        y: posY / scaleFactor,
      }

      // Nếu đã có RAF pending, skip (tránh schedule nhiều lần)
      if (rafRef.current !== null) return

      // Schedule update trong next animation frame
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null

        if (pendingPositionRef.current) {
          setCurrentPositionRef.current(pendingPositionRef.current)
          pendingPositionRef.current = null
        }
      })
    },
    [scaleFactor]
  )

  // ===== HANDLE START =====
  const handleStart = useCallback(
    (e: PointerEvent) => {
      if (disabled) return

      e.preventDefault()
      e.stopPropagation()

      isDraggingRef.current = true
      setIsDragging(true)

      const clientX = e.clientX
      const clientY = e.clientY

      // Tính offset từ vị trí click đến góc top-left của element
      offsetRef.current = {
        x: clientX - currentPosition.x * scaleFactor,
        y: clientY - currentPosition.y * scaleFactor,
      }

      // Set cursor style
      document.body.style.cursor = 'move'
      document.body.style.userSelect = 'none'
    },
    [disabled, currentPosition, scaleFactor]
  )

  // ===== HANDLE MOVE =====
  const handleMove = useCallback(
    (e: PointerEvent) => {
      if (!isDraggingRef.current || disabled) return

      e.preventDefault()
      e.stopPropagation()

      const clientX = e.clientX
      const clientY = e.clientY

      // Gọi RAF throttled version
      handleFinalPosition(clientX - offsetRef.current.x, clientY - offsetRef.current.y)
    },
    [disabled, handleFinalPosition]
  )

  // ===== HANDLE END =====
  const handleEnd = useCallback(() => {
    if (!isDraggingRef.current) return

    isDraggingRef.current = false
    setIsDragging(false)

    // Reset cursor style
    document.body.style.cursor = 'default'
    document.body.style.userSelect = 'auto'

    // Cancel pending RAF nếu có
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    // Flush pending position để đảm bảo position cuối cùng được apply
    if (pendingPositionRef.current) {
      setCurrentPositionRef.current(pendingPositionRef.current)

      pendingPositionRef.current = null
    }
  }, [currentPosition])

  // ===== EFFECT: REGISTER/CLEANUP EVENT LISTENERS =====
  useEffect(() => {
    const button = dragButtonRef.current
    if (!button) return

    // Register event listeners
    button.addEventListener('pointerdown', handleStart)
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleEnd)

    // Cleanup function
    return () => {
      button.removeEventListener('pointerdown', handleStart)
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleEnd)

      // Cancel RAF nếu component unmount trong khi đang drag
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }

      // Reset styles
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }
  }, [handleStart, handleMove, handleEnd])

  // ===== RETURN =====
  return {
    containerRef,
    dragButtonRef,
    isDragging,
  }
}
