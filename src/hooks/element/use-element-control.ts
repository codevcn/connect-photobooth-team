import { useRotateElement } from '@/hooks/element/use-rotate-element'
import { usePinchElement } from '@/hooks/element/use-pinch-element'
import { useZoomElement } from '@/hooks/element/use-zoom-element'
import { useDragElement } from '@/hooks/element/use-drag-element'
import { useEffect, useState } from 'react'
import { createInitialConstants } from '@/utils/contants'
import {
  TElementMountType,
  TElementRelativeProps,
  TElementVisualBaseState,
} from '@/utils/types/global'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'
import { captureCurrentElementPosition } from '@/pages/edit/helpers'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { typeToObject } from '@/utils/helpers'

type TInitialParams = Partial<
  TElementVisualBaseState & {
    maxZoom: number
    minZoom: number
    mountType: TElementMountType
  }
>

type TElementControlReturn = {
  forPinch: {
    ref: React.RefObject<HTMLElement | null>
  }
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

export const useElementControl = (
  elementId: string,
  elementRootRef: React.RefObject<HTMLElement | null>,
  printAreaAllowedRef: React.RefObject<HTMLDivElement | null>,
  containerForElementAbsoluteToRef: React.RefObject<HTMLDivElement | null>,
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
  const elementLayers = useElementLayerStore((s) => s.elementLayers)
  const [position, setPosition] = useState<TElementVisualBaseState['position']>({
    x: initialPosition?.x || createInitialConstants<number>('ELEMENT_X'),
    y: initialPosition?.y || createInitialConstants<number>('ELEMENT_Y'),
  })
  const [scale, setScale] = useState<TElementVisualBaseState['scale']>(initialZoom)
  const [angle, setAngle] = useState<TElementVisualBaseState['angle']>(initialAngle)
  const [zindex, setZindex] = useState<TElementVisualBaseState['zindex']>(initialZindex)
  const { ref: refForPinch } = usePinchElement({
    maxScale: maxZoom,
    minScale: minZoom,
    currentScale: scale,
    setCurrentScale: setScale,
    currentRotation: angle,
    setCurrentRotation: setAngle,
    currentPosition: position,
    setCurrentPosition: setPosition,
  })
  const {
    rotateButtonRef,
    containerRef: refForRotate,
    isRotating,
  } = useRotateElement({
    currentRotation: angle,
    setCurrentRotation: setAngle,
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

  const { ref: refForDrag } = useDragElement({
    disabled: isRotating || isZooming,
    currentPosition: position,
    setCurrentPosition: setPosition,
    postFunctionDrag: () => {
      const element = elementRootRef.current
      if (!element) return
      const container = containerForElementAbsoluteToRef.current
      if (!container) return
      captureCurrentElementPosition(element, container)
    },
  })

  const validateInputValueAndSet = (
    value: string | number,
    type: 'posX' | 'posY' | 'scale' | 'angle' | 'zindex'
  ) => {
    let parsedValue: number | string = value
    switch (type) {
      case 'posX':
        setPosition((prev) => ({ ...prev, x: value as number }))
        break
      case 'posY':
        setPosition((prev) => ({ ...prev, y: value as number }))
        break
      case 'scale':
        if (minZoom) {
          if ((value as number) < minZoom) {
            parsedValue = minZoom
          }
        }
        if (maxZoom) {
          if ((value as number) > maxZoom) {
            parsedValue = maxZoom
          }
        }
        setScale(parsedValue as number)
        break
      case 'angle':
        setAngle(parsedValue as number)
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
      console.log('>>> zindex:', zindex)
      useElementLayerStore.getState().updateElementLayerIndex(elementId, zindex)
    }
  }

  const onElementLayersChange = () => {
    const elementLayerIndex = elementLayers.findIndex((layer) => layer.elementId === elementId)
    if (elementLayerIndex < 0) return
    // element layer zindex starts from 11
    setZindex((elementLayerIndex + 1) * createInitialConstants<number>('ELEMENT_ZINDEX_STEP') + 1)
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
    console.log('>>> [uuu] setupVisualData parsedScale:', { initialPosition })
    handleSetElementState(
      initialPosition?.x,
      initialPosition?.y,
      parsedScale,
      initialAngle,
      initialZindex
    )
  }

  const dragAndScaleElementOnAllowedPrintAreaChange = () => {
    const elementRootRect = elementRootRef.current?.getBoundingClientRect()
    if (!elementRootRect) return
    const allowedPrintAreaRect = printAreaAllowedRef.current?.getBoundingClientRect()
    if (!allowedPrintAreaRect) return
    const printAreaContainerRect = containerForElementAbsoluteToRef.current?.getBoundingClientRect()
    if (!printAreaContainerRect) return

    const relativeData = elementRootRef.current?.getAttribute('data-element-relative-props')
    if (!relativeData) return
    const parsedData = JSON.parse(relativeData) as TElementRelativeProps
    console.log('>>> [uuu] parsed data:', {
      parsedData,
      allowedPrintAreaRect,
      printAreaContainerRect,
      printAreaContainer: containerForElementAbsoluteToRef.current,
      printAreaAllowed: printAreaAllowedRef.current,
    })

    const { element } = parsedData

    const newX = element.left + allowedPrintAreaRect.left - printAreaContainerRect.left
    const newY = element.top + allowedPrintAreaRect.top - printAreaContainerRect.top

    //>>> còn thiếu phát hiện va chạm với biên của vùng in allowedPrintAreaRect
    console.log('>>> [uuu] drag & scale:', { newX, newY })
    setPosition((pre) => {
      if (pre.x !== newX || pre.y !== newY) {
        return {
          x: newX,
          y: newY,
        }
      }
      return pre
    })
  }

  const captureElementRelativeProperties = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const allowedPrintAreaRect = printAreaAllowedRef.current?.getBoundingClientRect()
        if (!allowedPrintAreaRect) return
        const root = elementRootRef.current
        if (!root) return
        const rootRect = root.getBoundingClientRect()
        console.log('>>> [uuu] capture rects:', { rootRect, allowedPrintAreaRect })
        root.setAttribute(
          'data-element-relative-props',
          JSON.stringify(
            typeToObject<TElementRelativeProps>({
              element: {
                left: rootRect.left - allowedPrintAreaRect.left,
                top: rootRect.top - allowedPrintAreaRect.top,
              },
            })
          )
        )
        // dragAndScaleElementOnAllowedPrintAreaChange()
      })
    })
  }

  const dragElementAlongWithPrintContainer = () => {
    const elementRoot = elementRootRef.current
    if (!elementRoot) return
    const container = containerForElementAbsoluteToRef.current
    if (!container) return
    const leftPercent = parseFloat(elementRoot.dataset.leftPercent || '')
    const topPercent = parseFloat(elementRoot.dataset.topPercent || '')
    if (!isNaN(leftPercent) && !isNaN(topPercent)) {
      const containerRect = container.getBoundingClientRect()
      const newX = (leftPercent / 100) * containerRect.width
      const newY = (topPercent / 100) * containerRect.height
      console.log('>>> [uuu] drag:', { newX, newY })
      setPosition({
        x: newX,
        y: newY,
      })
    }
  }

  useEffect(() => {
    captureElementRelativeProperties()
  }, [position.x, position.y, angle, scale, zindex])

  useEffect(() => {
    eventEmitter.on(
      EInternalEvents.ELEMENTS_OUT_OF_BOUNDS_CHANGED,
      dragAndScaleElementOnAllowedPrintAreaChange
    )
    return () => {
      eventEmitter.off(
        EInternalEvents.ELEMENTS_OUT_OF_BOUNDS_CHANGED,
        dragAndScaleElementOnAllowedPrintAreaChange
      )
    }
  }, [])

  useEffect(() => {
    // Setup ResizeObserver to watch for print container size changes
    const container = containerForElementAbsoluteToRef.current
    if (!container) return
    const containerObserver = new ResizeObserver((entries) => {
      dragElementAlongWithPrintContainer()
    })
    containerObserver.observe(container)
    eventEmitter.on
    return () => {
      containerObserver.unobserve(container)
    }
  }, [elementId])

  useEffect(() => {
    onElementLayersChange()
  }, [elementLayers])

  useEffect(() => {
    setupVisualData()
  }, [mountType, initialPosition?.x, initialPosition?.y, initialAngle, initialZoom, initialZindex])

  return {
    forPinch: {
      ref: refForPinch,
    },
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
