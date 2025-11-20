import { usePrintArea } from '@/hooks/use-print-area'
import { TBaseProduct } from '@/utils/types/global'
import { useEffect, useMemo } from 'react'
import { PrintAreaOverlay } from './PrintAreaOverlay'
import { hardCodedPrintTemplates } from '@/configs/data/print-template'

type TDisplayedImage = {
  surfaceId: TBaseProduct['printAreaList'][number]['id']
  variantId: TBaseProduct['variants'][number]['id']
  imageURL: string
  altText: string
}

type TLivePreviewProps = {
  pickedProduct: TBaseProduct
  editedVariantId: TBaseProduct['variants'][number]['id']
  editedPrintSurfaceId: TBaseProduct['printAreaList'][number]['id']
}

export const LivePreview = ({
  pickedProduct,
  editedVariantId,
  editedPrintSurfaceId,
}: TLivePreviewProps) => {
  const {
    printAreaRef,
    containerElementRef: printAreaContainerRef,
    initializePrintArea,
  } = usePrintArea()
  console.log('>>> picked product:', pickedProduct)
  const displayedImage = useMemo<TDisplayedImage>(() => {
    const variantSurface = pickedProduct.variantSurfaces.find(
      (variantSurface) =>
        variantSurface.variantId === editedVariantId &&
        variantSurface.surfaceId === editedPrintSurfaceId
    )
    return {
      surfaceId: editedPrintSurfaceId,
      variantId: editedVariantId,
      imageURL: variantSurface?.imageURL || pickedProduct.url,
      altText: pickedProduct.name,
    }
  }, [pickedProduct, editedVariantId, editedPrintSurfaceId])

  const printAreaInfo = useMemo(() => {
    return pickedProduct.printAreaList.find((printArea) => printArea.id === editedPrintSurfaceId)!
  }, [pickedProduct, editedPrintSurfaceId])

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
      ref={printAreaContainerRef}
      className="NAME-main-img min-h-full max-h-full w-full h-full overflow-hidden bg-gray-100 border border-gray-400/30 relative"
    >
      <img
        src={displayedImage.imageURL}
        alt={displayedImage.altText}
        crossOrigin="anonymous"
        className="NAME-product-image min-h-full max-h-full w-full h-full object-contain relative z-4"
      />
      <PrintAreaOverlay
        printTemplate={hardCodedPrintTemplates('1-square')}
        printAreaRef={printAreaRef}
        isOutOfBounds={false}
      />
    </div>
  )
}
