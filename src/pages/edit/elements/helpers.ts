import { TPosition, TSizeInfo } from '@/utils/types/global'

export const snapshotPersistElementPosition = (printAreaContainer: HTMLElement) => {
  console.log('>>> [fx] start func snapshotPersistElementPosition:', printAreaContainer)
  for (const ele of printAreaContainer.querySelectorAll<HTMLElement>('.NAME-root-element')) {
    const persistData = ele.getAttribute('data-persist-position')
    const elementId = ele.getAttribute('data-root-element-id')
    
    if (persistData) {
      const parsed = JSON.parse(persistData)
      console.log('>>> [fx] BEFORE snapshot - persistData:', { 
        elementId,
        persistData, 
        parsed,
        elementXPercent: parsed.elementXPercent 
      })
      
      // Copy ngay lập tức
      ele.setAttribute('data-persist-position-snapshot', persistData)
      
      // Verify sau khi set
      const snapshotData = ele.getAttribute('data-persist-position-snapshot')
      const parsedSnapshot = snapshotData ? JSON.parse(snapshotData) : null
      console.log('>>> [fx] AFTER snapshot - snapshotData:', { 
        elementId,
        snapshotData,
        parsedSnapshot,
        elementXPercent: parsedSnapshot?.elementXPercent,
        isEqual: persistData === snapshotData
      })
      
      // Kiểm tra xem data-persist-position có bị thay đổi không
      const persistDataAfter = ele.getAttribute('data-persist-position')
      if (persistData !== persistDataAfter) {
        console.warn('>>> [fx] ⚠️ WARNING: data-persist-position CHANGED during snapshot!', {
          elementId,
          before: persistData,
          after: persistDataAfter
        })
      }
    }
  }
}

const calculateElementPositionRelativeToPrintArea = (
  element: HTMLElement,
  allowedPrintArea: HTMLElement,
  elementXPercent: number,
  elementYPercent: number
): TPosition => {
  console.log('>>> [fx][2] start func calculateElementPositionRelativeToPrintArea:', {
    element,
    allowedPrintArea,
    elementXPercent,
    elementYPercent,
  })
  // Lấy bounding rect của B
  const rectB = allowedPrintArea.getBoundingClientRect()

  // Lấy scale factor của A
  // const styleA = window.getComputedStyle(element)
  // const matrix = new DOMMatrix(styleA.transform)
  // const scale = matrix.a // scale đồng đều nên chỉ cần matrix.a

  // Lấy kích thước của A sau khi scale
  const rectA = element.getBoundingClientRect()
  console.log('>>> [fx][2] rects:', { rectA, rectB })

  // Tính kích thước gốc và scale offset
  const originalWidth = element.offsetWidth
  const originalHeight = element.offsetHeight
  console.log('>>> [fx][2] original sizes:', { originalWidth, originalHeight })
  const scaleOffsetX = (rectA.width - originalWidth) / 2
  const scaleOffsetY = (rectA.height - originalHeight) / 2
  console.log('>>> [fx][2] scale offsets:', { scaleOffsetX, scaleOffsetY })

  // Lấy vị trí CSS của B
  // const styleB = window.getComputedStyle(allowedPrintArea)
  // const bCssLeft = parseFloat(styleB.left) || 0
  // const bCssTop = parseFloat(styleB.top) || 0
  const bCssLeft = allowedPrintArea.offsetLeft
  const bCssTop = allowedPrintArea.offsetTop
  console.log('>>> [fx][2] allowedPrintArea offsets:', { bCssLeft, bCssTop })

  // Tính offset mong muốn theo pixel
  const offsetX = (elementXPercent / 100) * rectB.width
  const offsetY = (elementYPercent / 100) * rectB.height
  console.log('>>> [fx][2] offsets:', { offsetX, offsetY, elementXPercent, elementYPercent })

  // Vị trí thực tế mong muốn (vị trí hiển thị của góc top-left A)
  const targetActualLeft = bCssLeft + offsetX
  const targetActualTop = bCssTop + offsetY
  console.log('>>> [fx][2] target actuals:', { targetActualLeft, targetActualTop })

  // Compensate cho scale offset để tính CSS left/top
  // Vì transform-origin: center, element "lùi lại" khi scale
  const targetCssLeft = targetActualLeft + scaleOffsetX
  const targetCssTop = targetActualTop + scaleOffsetY
  console.log('>>> [fx][2] target css:', { targetCssLeft, targetCssTop })

  // Set vị trí CSS
  // element.style.left = `${targetCssLeft}px`
  // element.style.top = `${targetCssTop}px`
  // console.log('>>> [fx][2] targets final:', {
  //   targetCssLeft,
  //   targetCssTop,
  // })
  // handleSetElementPosition(targetCssLeft, targetCssTop)
  return {
    x: targetCssLeft,
    y: targetCssTop,
  }
}

const calculateElementScaleRelativeToPrintArea = (
  printArea: HTMLElement,
  prePrintAreaSize: TSizeInfo
) => {
  console.log('>>> [fx] start func calculateElementScaleRelativeToPrintArea:', {
    printArea,
    prePrintAreaSize,
  })
  const rectPrintArea = printArea.getBoundingClientRect()
  console.log('>>> [fx] current rect PrintArea:', { rectPrintArea })
  const rectPrintAreaWidth = rectPrintArea.width
  const rectPrintAreaHeight = rectPrintArea.height
  const prePrintAreaWidth = prePrintAreaSize.width
  const prePrintAreaHeight = prePrintAreaSize.height
  const prePrintAreaRatio = prePrintAreaWidth / prePrintAreaHeight
  if (prePrintAreaRatio > rectPrintAreaWidth / rectPrintAreaHeight) {
    const newPrePrintAreaHeight = rectPrintAreaWidth / prePrintAreaRatio
    const scaleFactor = newPrePrintAreaHeight / prePrintAreaHeight
    console.log('>>> [fx] scale Factor return:', {
      scaleFactor,
      newPrePrintAreaHeight,
      prePrintAreaHeight,
    })
    return scaleFactor
  }
  const newPrePrintAreaWidth = rectPrintAreaHeight * prePrintAreaRatio
  const scaleFactor = newPrePrintAreaWidth / prePrintAreaWidth
  console.log('>>> [fx] scale Factor return:', {
    scaleFactor,
    newPrePrintAreaWidth,
    prePrintAreaWidth,
  })
  return scaleFactor
}

type TPersistElementPositionPayload = {
  [elementId: string]: {
    posXPixel: number
    posYPixel: number
    scale: number
  }
}

export const stayElementsRelativeToPrintArea = (
  printAreaContainer: HTMLElement,
  allowedPrintArea: HTMLElement,
  callback: (persistElementPositionPayloads: TPersistElementPositionPayload) => void
) => {
  console.log('>>> [fx] start func stayElementsRelativeToPrintArea:', {
    printAreaContainer,
    allowedPrintArea,
  })
  const elements = printAreaContainer.querySelectorAll<HTMLElement>('.NAME-root-element')
  // console.log('>>> [fx] elements:', elements)
  const persistElementPositionPayloads: TPersistElementPositionPayload = {}
  for (const ele of elements) {
    const elementId = ele.getAttribute('data-root-element-id')
    if (!elementId) continue
    const persistData = ele.getAttribute('data-persist-position-snapshot')
    // console.log('>>> [fx] ele:', { ele, persistData })
    if (!persistData) continue
    const parsedPersistData = JSON.parse(persistData) as TPersistElementPositionReturn
    console.log('>>> [fx] parsed Persist snapshot:', { ele, parsedPersistData })
    const {
      elementXPercent,
      elementYPercent,
      elementScale,
      allowedPrintAreaHeight,
      allowedPrintAreaWidth,
    } = parsedPersistData
    const newPos = calculateElementPositionRelativeToPrintArea(
      ele,
      allowedPrintArea,
      elementXPercent,
      elementYPercent
    )
    persistElementPositionPayloads[elementId] = {
      posXPixel: newPos.x,
      posYPixel: newPos.y,
      scale: calculateElementScaleRelativeToPrintArea(allowedPrintArea, {
        width: allowedPrintAreaWidth,
        height: allowedPrintAreaHeight,
      }),
    }
  }
  callback(persistElementPositionPayloads)
}

type TPersistElementPositionReturn = {
  elementXPercent: number
  elementYPercent: number
  elementScale: number
  allowedPrintAreaHeight: number
  allowedPrintAreaWidth: number
}

export const persistElementPositionToPrintArea = (
  rootElement: HTMLElement | null,
  allowedPrintArea: HTMLElement | null,
  elementScale: number
): TPersistElementPositionReturn => {
  console.log('>>> [fx] start func persistElementPositionToPrintArea:', {
    rootElement,
    allowedPrintArea,
    elementScale,
  })
  if (!rootElement || !allowedPrintArea) {
    return {
      elementXPercent: 0,
      elementYPercent: 0,
      elementScale: 1,
      allowedPrintAreaHeight: 0,
      allowedPrintAreaWidth: 0,
    }
  }

  const rectA = rootElement.getBoundingClientRect()
  const rectB = allowedPrintArea.getBoundingClientRect()

  // Lấy scale factor (vì scale đồng đều nên chỉ cần lấy 1 giá trị)
  // const styleA = window.getComputedStyle(rootElement)
  // const matrix = new DOMMatrix(styleA.transform)
  // const scale = matrix.a // hoặc matrix.d, vì scale đồng đều

  // Lấy vị trí CSS gốc
  // const cssLeft = parseFloat(styleA.left) || 0
  // const cssTop = parseFloat(styleA.top) || 0
  const cssLeft = rootElement.offsetLeft
  const cssTop = rootElement.offsetTop
  // console.log('>>> [fx] css:', {
  //   cssLeft,
  //   cssTop,
  // })

  // Kích thước gốc (trước scale)
  const originalWidth = rootElement.offsetWidth
  const originalHeight = rootElement.offsetHeight
  // console.log('>>> [fx] orig:', { originalWidth, originalHeight, rectA })

  // Scale offset (do transform-origin: center)
  const scaleOffsetWidth = (rectA.width - originalWidth) / 2
  const scaleOffsetHeight = (rectA.height - originalHeight) / 2
  // console.log('>>> [fx] scaleOffset:', { scaleOffsetWidth, scaleOffsetHeight })

  // Vị trí thực tế hiển thị của góc top-left
  const actualLeft = cssLeft - scaleOffsetWidth
  const actualTop = cssTop - scaleOffsetHeight
  // console.log('>>> [fx] act:', {
  //   actualLeft,
  //   actualTop,
  // })

  // Vị trí của B
  // const styleB = window.getComputedStyle(allowedPrintArea)
  // const bCssLeft = parseFloat(styleB.left) || 0
  // const bCssTop = parseFloat(styleB.top) || 0
  const bCssLeft = allowedPrintArea.offsetLeft
  const bCssTop = allowedPrintArea.offsetTop
  // console.log('>>> [fx] par:', {
  //   bCssLeft,
  //   bCssTop,
  //   allowedPrintArea,
  // })

  // Delta
  const deltaX = actualLeft - bCssLeft
  const deltaY = actualTop - bCssTop
  // console.log('>>> [fx] dels:', {
  //   deltaX,
  //   deltaY,
  // })

  return {
    elementXPercent: (deltaX / rectB.width) * 100,
    elementYPercent: (deltaY / rectB.height) * 100,
    elementScale,
    allowedPrintAreaHeight: rectB.height,
    allowedPrintAreaWidth: rectB.width,
  }
}
