import { useRotateElement } from '@/hooks/element/use-rotate-element'
import { useZoomElement } from '@/hooks/element/use-zoom-element'
import { useDragElement } from '@/hooks/element/use-drag-element'
import { useEffect, useState, useRef } from 'react'
import { createInitialConstants } from '@/utils/contants'
import {
  TElementMountType,
  TElementType,
  TElementVisualBaseState,
  TPosition,
} from '@/utils/types/global'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { useEditAreaStore } from '@/stores/ui/edit-area.store'
import { useSnapThresholdRotateElement } from './use-snap-threshold-rotate-element'

type TElementPreviousRelativeProps = {
  relativeLeftPercent: number
  relativeTopPercent: number
}

type TInitialParams = Partial<
  TElementVisualBaseState & {
    maxZoom: number
    minZoom: number
    mountType: TElementMountType
  }
>

type TElementControlReturn = {
  // forPinch: {
  //   ref: React.RefObject<HTMLElement | null>
  // }
  forRotate: {
    ref: React.RefObject<HTMLElement | null>
    isRotating: boolean
    rotateButtonRef: React.RefObject<HTMLButtonElement | null>
  }
  forZoom: {
    ref: React.RefObject<HTMLElement | null>
    isZooming: boolean
    zoomButtonRef: React.RefObject<HTMLButtonElement | null>
  }
  forDrag: {
    ref: React.RefObject<HTMLElement | null>
    dragButtonRef: React.RefObject<HTMLDivElement | null>
  }
  state: TElementVisualBaseState
  handleSetElementState: (
    posX?: number,
    posY?: number,
    scale?: number,
    angle?: number,
    zindex?: number
  ) => void
}

export type TElementControlRegistryRef =
  | React.RefObject<Record<string, { todo: (payload: any) => void }>>
  | null

export const useElementControl = (
  elementId: string,
  elementRootRef: React.RefObject<HTMLElement | null>,
  printAreaAllowedRef: React.RefObject<HTMLDivElement | null>,
  containerForElementAbsoluteToRef: React.RefObject<HTMLDivElement | null>,
  elementControlRef: TElementControlRegistryRef,
  elementType: TElementType,
  initialParams?: TInitialParams
): TElementControlReturn => {
  const {
    position: initialPosition,
    maxZoom,
    minZoom,
    angle: initialAngle = createInitialConstants<number>('ELEMENT_ROTATION'),
    scale: initialZoom = createInitialConstants<number>('ELEMENT_ZOOM'),
    zindex: initialZindex = createInitialConstants<number>('ELEMENT_ZINDEX'),
    mountType,
  } = initialParams || {}
  const [position, setPosition] = useState<TElementVisualBaseState['position']>({
    x: initialPosition?.x || createInitialConstants<number>('ELEMENT_X'),
    y: initialPosition?.y || createInitialConstants<number>('ELEMENT_Y'),
  })
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const edgesMargin: number = 10 // px
  const handleSetElementPosition = (posX: TPosition['x'], posY: TPosition['y']) => {
    const containerForElementAbsoluteTo = containerForElementAbsoluteToRef.current
    const rootElement = elementRootRef.current
    if (!containerForElementAbsoluteTo || !rootElement) return

    if (posX < 0) return
    if (posY < 0) return
    const containerForElementAbsoluteToRect = containerForElementAbsoluteTo.getBoundingClientRect()
    const rootElementRect = rootElement.getBoundingClientRect()
    if (posX > containerForElementAbsoluteToRect.width - rootElementRect.width - edgesMargin) return
    if (posY > containerForElementAbsoluteToRect.height - rootElementRect.height - edgesMargin)
      return
    setPosition({ x: posX, y: posY })
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const containerForElementAbsoluteTo = containerForElementAbsoluteToRef.current
      const rootElement = elementRootRef.current
      if (!containerForElementAbsoluteTo || !rootElement) return
      const containerForElementAbsoluteToRect =
        containerForElementAbsoluteTo.getBoundingClientRect()
      const rootElementRect = rootElement.getBoundingClientRect()
      if (
        rootElementRect.left + rootElementRect.width >
        containerForElementAbsoluteToRect.left + containerForElementAbsoluteToRect.width
      ) {
        setPosition((prev) => ({
          ...prev,
          x: containerForElementAbsoluteToRect.width - rootElementRect.width - edgesMargin,
        }))
      }
      if (
        rootElementRect.top + rootElementRect.height >
        containerForElementAbsoluteToRect.top + containerForElementAbsoluteToRect.height
      ) {
        setPosition((prev) => ({
          ...prev,
          y: containerForElementAbsoluteToRect.height - rootElementRect.height - edgesMargin,
        }))
      }
    }, 700)
  }

  const handleSetSinglePosition = (posX?: TPosition['x'], posY?: TPosition['y']) => {
    const containerForElementAbsoluteTo = containerForElementAbsoluteToRef.current
    const rootElement = elementRootRef.current
    if (!containerForElementAbsoluteTo || !rootElement) return
    const containerForElementAbsoluteToRect = containerForElementAbsoluteTo.getBoundingClientRect()
    const rootElementRect = rootElement.getBoundingClientRect()
    if (posX && posX > 0) {
      let parsedValue = posX
      if (posX > containerForElementAbsoluteToRect.width - rootElementRect.width) {
        parsedValue = containerForElementAbsoluteToRect.width - rootElementRect.width - 5
      }
      setPosition((prev) => ({
        ...prev,
        x: parsedValue,
      }))
    } else if (posY && posY > 0) {
      let parsedValue = posY
      if (posY > containerForElementAbsoluteToRect.height - rootElementRect.height) {
        parsedValue = containerForElementAbsoluteToRect.height - rootElementRect.height - 5
      }
      setPosition((prev) => ({
        ...prev,
        y: parsedValue,
      }))
    }
  }

  const [scale, setScale] = useState<TElementVisualBaseState['scale']>(initialZoom)
  const [angle, setAngle] = useState<TElementVisualBaseState['angle']>(initialAngle)
  const [zindex, setZindex] = useState<TElementVisualBaseState['zindex']>(initialZindex)
  const scaleFactor = useEditAreaStore((s) => s.editAreaScaleValue)
  // Ref to store previous offset values before visual state changes
  const elementPreviousRelativeProps = useRef<TElementPreviousRelativeProps | null>(null)
  // const { ref: refForPinch } = usePinchElement({
  //   maxScale: maxZoom,
  //   minScale: minZoom,
  //   currentScale: scale,
  //   setCurrentScale: setScale,
  //   currentRotation: angle,
  //   setCurrentRotation: setAngle,
  //   currentPosition: position,
  //   setCurrentPosition: (pos) => {
  //     handleSetElementPosition(pos.x, pos.y)
  //   },
  // })
  const {
    rotateButtonRef,
    containerRef: refForRotate,
    isRotating,
  } = useSnapThresholdRotateElement({
    currentRotation: angle,
    setCurrentRotation: setAngle,
    snapBreakThreshold: createInitialConstants<number>('ELEMENT_ROTATION_SNAP_BREAK_THRESHOLD'),
    snapThreshold: createInitialConstants<number>('ELEMENT_ROTATION_SNAP_THRESHOLD'),
  })
  const {
    zoomButtonRef,
    containerRef: refForZoom,
    isZooming,
  } = useZoomElement({
    maxZoom: maxZoom,
    minZoom: minZoom,
    currentZoom: scale,
    setCurrentZoom: setScale,
  })
  const elementLayers = useElementLayerStore((s) => s.elementLayers)

  const handleSetElementPositionCallback = (pos: TPosition) => {
    handleSetElementPosition(pos.x, pos.y)
  }
  /**
   * const { containerRef: refForDrag, dragButtonRef } = useDragElement(
    disabled: isRotating || isZooming,
    currentPosition: position,
    scaleFactor,
    setCurrentPosition: handleSetElementPositionCallback,
    postFunctionDrag: () => {
      const element = elementRootRef.current
      if (!element) return
      const container = containerForElementAbsoluteToRef.current
      if (!container) return
    },
  )
   */
  const { containerRef: refForDrag, dragButtonRef } = useDragElement(
    position,
    handleSetElementPositionCallback,
    isRotating || isZooming,
    undefined,
    scaleFactor
  )

  const validateInputValueAndSet = (
    value: string | number | [TPosition['x'], TPosition['y']],
    type: 'posX' | 'posY' | 'scale' | 'angle' | 'zindex' | 'posXY'
  ) => {
    switch (type) {
      case 'posXY':
        handleSetElementPosition((value as Array<number>)[0], (value as Array<number>)[1])
        break
      case 'posX':
        handleSetSinglePosition(value as number, undefined)
        break
      case 'posY':
        handleSetSinglePosition(undefined, value as number)
        break
      case 'scale':
        let parsedScale = value as number
        if (minZoom) {
          if ((value as number) < minZoom) {
            parsedScale = minZoom
          }
          setScale(parsedScale)
        }
        if (maxZoom) {
          if ((value as number) > maxZoom) {
            parsedScale = maxZoom
          }
          setScale(parsedScale)
        }
        break
      case 'angle':
        setAngle(value as number)
        break
    }
  }

  const handleSetElementState = (
    posX?: number,
    posY?: number,
    scale?: number,
    angle?: number,
    zindex?: number
  ) => {
    if (posX || posX === 0) {
      validateInputValueAndSet(posX, 'posX')
    }
    if (posY || posY === 0) {
      validateInputValueAndSet(posY, 'posY')
    }
    if (scale) {
      validateInputValueAndSet(scale, 'scale')
    }
    if (angle || angle === 0) {
      validateInputValueAndSet(angle, 'angle')
    }
    if (zindex) {
      useElementLayerStore.getState().updateElementLayerIndex(elementId, zindex)
    }
  }

  const setupVisualData = () => {
    if (mountType !== 'from-saved') return
    // Normalise saved scale: some saved data may store percentage (e.g. 100)
    let parsedScale = typeof initialZoom === 'number' ? initialZoom : 1
    if (parsedScale <= 0) parsedScale = 1
    // If value looks like percent (very large > 10), convert to ratio
    if (parsedScale > 10) parsedScale = parsedScale / 100
    // Clamp to min/max zoom if provided
    if (minZoom && parsedScale < minZoom) parsedScale = minZoom
    if (maxZoom && parsedScale > maxZoom) parsedScale = maxZoom
    // debug
    handleSetElementState(initialPosition?.x, initialPosition?.y, parsedScale, initialAngle)
  }

  const stayElementVisualOnAllowedPrintArea = () => {
    const elementPreOffset = elementPreviousRelativeProps.current
    if (!elementPreOffset) return
    const allowedPrintArea = printAreaAllowedRef.current
    const element = elementRootRef.current
    if (!allowedPrintArea || !element) return
    // const allowedPrintAreaLeft = allowedPrintArea.offsetLeft
    // const allowedPrintAreaTop = allowedPrintArea.offsetTop
    // const allowedPrintAreaRect = allowedPrintArea.getBoundingClientRect()
    // const elementRect = element.getBoundingClientRect()
    console.log('>>> [sta] start ref:', {
      elementPreOffset,
      elementId,
    })

    function setRelativePositionWithScale(
      elementA: HTMLElement,
      elementB: HTMLElement,
      offsetXPercent: number,
      offsetYPercent: number
    ): void {
      // Lấy bounding rect của B
      const rectB = elementB.getBoundingClientRect()

      // Lấy scale factor của A
      // const styleA = window.getComputedStyle(elementA)
      // const matrix = new DOMMatrix(styleA.transform)
      // const scale = matrix.a // scale đồng đều nên chỉ cần matrix.a

      // Lấy kích thước của A sau khi scale
      const rectA = elementA.getBoundingClientRect()

      // Tính kích thước gốc và scale offset
      const originalWidth = rectA.width / scale
      const originalHeight = rectA.height / scale
      const scaleOffsetX = (rectA.width - originalWidth) / 2
      const scaleOffsetY = (rectA.height - originalHeight) / 2

      // Lấy vị trí CSS của B
      const styleB = window.getComputedStyle(elementB)
      const bCssLeft = parseFloat(styleB.left) || 0
      const bCssTop = parseFloat(styleB.top) || 0

      // Tính offset mong muốn theo pixel
      const offsetX = (offsetXPercent / 100) * rectB.width
      const offsetY = (offsetYPercent / 100) * rectB.height

      // Vị trí thực tế mong muốn (vị trí hiển thị của góc top-left A)
      const targetActualLeft = bCssLeft + offsetX
      const targetActualTop = bCssTop + offsetY

      // Compensate cho scale offset để tính CSS left/top
      // Vì transform-origin: center, element "lùi lại" khi scale
      const targetCssLeft = targetActualLeft + scaleOffsetX
      const targetCssTop = targetActualTop + scaleOffsetY

      // Set vị trí CSS
      // elementA.style.left = `${targetCssLeft}px`
      // elementA.style.top = `${targetCssTop}px`
      console.log('>>> [sta] targets:', {
        targetCssLeft,
        targetCssTop,
      })
      handleSetElementPosition(targetCssLeft, targetCssTop)
    }
    setRelativePositionWithScale(
      element,
      allowedPrintArea,
      elementPreOffset.relativeLeftPercent,
      elementPreOffset.relativeTopPercent
    )

    // handleSetElementPosition(
    //   Math.min(
    //     allowedPrintAreaLeft + elementPreOffset.relativeOffsetLeft,
    //     allowedPrintAreaLeft + allowedPrintAreaRect.width - elementRect.width - 4
    //   ),
    //   Math.min(
    //     allowedPrintAreaTop + elementPreOffset.relativeOffsetTop,
    //     allowedPrintAreaTop + allowedPrintAreaRect.height - elementRect.height - 4
    //   )
    // )
  }

  useEffect(() => {
    if (!elementControlRef) return
    const registry = elementControlRef.current
    if (!registry) return

    registry[elementId] = {
      todo: (param: any) => {
        console.log('>>> [elementControlRef] todo called with param:', param)
        const persistPositionData = param[elementId]
        if (!persistPositionData) return
        const { posXPixel, posYPixel, scale: newScale } = persistPositionData
        console.log('>>> debug kkk chua:', persistPositionData)
        console.log('>>> debug kkk chua root:', elementRootRef.current)
        setPosition({
          x: posXPixel,
          y: posYPixel,
        })
        handleSetElementState(undefined, undefined, newScale)
      },
    }

    return () => {
      delete registry[elementId]
    }
  }, [elementControlRef, elementId])

  useEffect(() => {
    // Setup ResizeObserver to watch for print container size changes
    const container = containerForElementAbsoluteToRef.current
    if (!container) return
    const containerObserver = new ResizeObserver((entries) => {
      // stayElementVisualOnAllowedPrintArea()
    })
    containerObserver.observe(container)
    eventEmitter.on
    return () => {
      containerObserver.unobserve(container)
    }
  }, [elementId])

  useEffect(() => {
    const layer = elementLayers.find((l) => l.elementId === elementId)
    if (layer) {
      setZindex(layer.index)
    }
  }, [elementLayers])

  useEffect(() => {
    setupVisualData()
  }, [mountType, initialPosition?.x, initialPosition?.y, initialAngle, initialZoom, initialZindex])

  return {
    // forPinch: {
    //   ref: refForPinch,
    // },
    forRotate: {
      ref: refForRotate,
      isRotating,
      rotateButtonRef,
    },
    forZoom: {
      ref: refForZoom,
      isZooming,
      zoomButtonRef,
    },
    forDrag: {
      ref: refForDrag,
      dragButtonRef,
    },
    handleSetElementState,
    state: {
      position,
      angle,
      scale,
      zindex,
    },
  }
}
