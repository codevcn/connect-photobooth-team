import {
  TPrintAreaInfo,
  TPrintAreaShapeType,
  TPrintedImage,
  TPrintTemplate,
  TSizeInfo,
} from '@/utils/types/global'
import { PrintAreaOverlay, PrintAreaOverlayPreview } from './live-preview/PrintAreaOverlay'
import { usePrintArea } from '@/hooks/use-print-area'
import { hardCodedPrintTemplates } from '@/configs/data/print-template'
import { diffPrintedImageOnRectType } from '@/utils/helpers'
import { getInitialContants } from '@/utils/contants'
import { usePrintedImageStore } from '@/stores/printed-image/printed-image.store'
import { useEffect } from 'react'

const assignTemplatesToPrintArea = (printAreaSize: TSizeInfo) => {
  const { width, height } = printAreaSize
  if (width === height) {
    const templates = [
      hardCodedPrintTemplates('2-vertical'), // ưu tiên: ảnh dọc, ảnh vuông
      hardCodedPrintTemplates('2-horizon'), // ưu tiên: ảnh ngang, ảnh vuông
      hardCodedPrintTemplates('1-square'), // cái nào cũng được
    ]
    return templates
  }
}

const detectPrintAreaShape = (width: number, height: number): TPrintAreaShapeType => {
  if (width === height) return 'square'
  if (width > height) return 'landscape'
  return 'portrait'
}

const initTemplatesByAreaShapeType = (shapeType: TPrintAreaShapeType): TPrintTemplate[] => {
  switch (shapeType) {
    case 'square':
      return [
        hardCodedPrintTemplates('2-vertical'), // ưu tiên: ảnh dọc, ảnh vuông
        hardCodedPrintTemplates('2-horizon'), // ưu tiên: ảnh ngang, ảnh vuông
        hardCodedPrintTemplates('1-square'), // cái nào cũng được
      ]
    case 'landscape':
      return [
        hardCodedPrintTemplates('1-square'), // ưu tiên: ảnh ngang, ảnh vuông
        hardCodedPrintTemplates('2-vertical'), // ưu tiên: ảnh vuông
        hardCodedPrintTemplates('4-vertical'), // ưu tiên: ảnh vuông
      ]
    case 'portrait':
      return [
        hardCodedPrintTemplates('1-square'), // ưu tiên: ảnh dọc, ảnh vuông
        hardCodedPrintTemplates('2-horizon'), // ưu tiên: ảnh vuông
        hardCodedPrintTemplates('4-horizon'),
      ]
  }
}

const displayProductImageByTemplate = (
  printAreaInfo: TPrintAreaInfo,
  printedImages: TPrintedImage[],
  productImageURL?: string
): TPrintTemplate => {
  const { area } = printAreaInfo
  const templates = initTemplatesByAreaShapeType(detectPrintAreaShape(area.printW, area.printH))
  let found = false
  let arrayIndexOfFrame = -1,
    arrayIndexOfTemplate = -1
  const imgHolder = {
    img: printedImages[0],
    diff: Infinity,
    frameIndexInArray: -1,
    templateIndexInArray: -1,
  }
  for (const template of templates) {
    arrayIndexOfTemplate++
    for (const frame of template.frames) {
      arrayIndexOfFrame++
      for (const img of printedImages) {
        const diff = diffPrintedImageOnRectType(frame.rectType, {
          height: img.height,
          width: img.width,
        })
        console.log('>>> diff:', diff)
        if (diff === 0) {
          frame.placedImage = {
            id: img.id,
            imgURL: img.url,
            placementState: {
              frameIndex: frame.index,
              objectFit: getInitialContants('PLACED_IMG_OBJECT_FIT'),
              squareRotation: getInitialContants('PLACED_IMG_SQUARE_ROTATION'),
              zoom: getInitialContants('PLACED_IMG_ZOOM'),
            },
          }
          found = true
          break // Chỉ lấy 1 hình phù hợp nhất
        } else {
          if (imgHolder.diff > diff) {
            imgHolder.img = img
            imgHolder.diff = diff
            imgHolder.frameIndexInArray = arrayIndexOfFrame
            imgHolder.templateIndexInArray = arrayIndexOfTemplate
          }
        }
      }
    }
    if (found) {
      console.log('>>> found template:', template)
      return template
    }
  }
  // Nếu không tìm thấy hình phù hợp hoàn hảo, lấy hình gần đúng nhất
  const frame = templates[imgHolder.templateIndexInArray]?.frames[imgHolder.frameIndexInArray]
  if (frame) {
    frame.placedImage = {
      id: imgHolder.img.id,
      imgURL: imgHolder.img.url,
      placementState: {
        frameIndex: imgHolder.frameIndexInArray + 1,
        objectFit: getInitialContants('PLACED_IMG_OBJECT_FIT'),
        squareRotation: getInitialContants('PLACED_IMG_SQUARE_ROTATION'),
        zoom: getInitialContants('PLACED_IMG_ZOOM'),
      },
    }
  }
  console.log('>>> return first template:', templates[0])
  return templates[0] // Trả về template đầu tiên nếu không tìm thấy hình phù hợp
}

type TProductProps = {
  product: {
    id: number // productId
    url: string // productAvatarURL
  }
  printAreaInfo: TPrintAreaInfo
  printedImages: TPrintedImage[]
}

const Product = ({ product, printAreaInfo, printedImages }: TProductProps) => {
  const {
    printAreaRef,
    containerElementRef: printAreaContainerRef,
    initializePrintArea,
  } = usePrintArea()

  // Cập nhật vùng in khi sản phẩm thay đổi
  useEffect(() => {
    if (printAreaContainerRef.current) {
      const imageElement = printAreaContainerRef.current.querySelector(
        '.NAME-product-image'
      ) as HTMLImageElement

      if (!imageElement) return

      const updatePrintAreaWhenImageLoaded = () => {
        if (printAreaContainerRef.current) {
          initializePrintArea(printAreaInfo.area, printAreaContainerRef.current)
        }
      }

      // Nếu ảnh đã load xong
      if (imageElement.complete && imageElement.naturalWidth > 0) {
        // Delay nhỏ để đảm bảo DOM đã render xong
        const timeoutId = setTimeout(updatePrintAreaWhenImageLoaded, 50)
        return () => clearTimeout(timeoutId)
      } else {
        // Nếu ảnh chưa load, đợi event load
        imageElement.addEventListener('load', updatePrintAreaWhenImageLoaded)
        return () => imageElement.removeEventListener('load', updatePrintAreaWhenImageLoaded)
      }
    }
  }, [initializePrintArea, printAreaInfo])

  // Theo dõi resize của container
  useEffect(() => {
    if (!printAreaContainerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          const imageElement = printAreaContainerRef.current?.querySelector(
            '.NAME-product-image'
          ) as HTMLImageElement

          if (imageElement && imageElement.complete && imageElement.naturalWidth > 0) {
            setTimeout(() => {
              if (printAreaContainerRef.current) {
                initializePrintArea(printAreaInfo.area, printAreaContainerRef.current)
              }
            }, 100)
          }
        }
      }
    })

    resizeObserver.observe(printAreaContainerRef.current)
    return () => resizeObserver.disconnect()
  }, [initializePrintArea, printAreaInfo.area])

  return (
    <div
      key={product.id}
      ref={printAreaContainerRef}
      className={`NAME-product w-full aspect-square relative rounded-xl transition duration-200 border border-gray-200`}
      data-url={product.url}
    >
      <img
        src={product.url || '/placeholder.svg'}
        alt="Overlay"
        className="NAME-product-image w-full aspect-square rounded-xl"
      />
      <PrintAreaOverlay
        printTemplate={displayProductImageByTemplate(printAreaInfo, printedImages, product.url)}
        printAreaRef={printAreaRef}
        isOutOfBounds={false}
      />
    </div>
  )
}

type TGalleryProduct = {
  id: number // productId
  url: string // productAvatarURL
  printAreaList: TPrintAreaInfo[] // productPrintAreaInfo
}

type TProductGalleryProps = {
  products: TGalleryProduct[]
  printedImages: TPrintedImage[]
}

export const ProductGallery = ({ products }: TProductGalleryProps) => {
  const { printedImages } = usePrintedImageStore()

  return (
    <div className="md:h-screen h-fit flex flex-col bg-white py-3 border border-gray-200">
      <h2 className="text-base w-full text-center font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
        Gian hàng sản phẩm
      </h2>
      <div className="overflow-y-auto px-1.5">
        <div className="flex md:flex-col md:items-center gap-3 overflow-x-scroll p-2 pt-3 md:overflow-y-auto md:overflow-x-clip h-fit md:max-h-full spmd:max-h-full gallery-scroll">
          {products &&
            products.length > 0 &&
            products.map((product) => {
              return (
                <Product
                  key={product.id}
                  product={product}
                  printAreaInfo={product.printAreaList[0]}
                  printedImages={printedImages}
                />
              )
            })}
        </div>
      </div>
    </div>
  )
}
