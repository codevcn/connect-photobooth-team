import { TBaseProduct, TPrintedImage, TPrintTemplate } from '@/utils/types/global'
import { PrintAreaOverlayPreview } from './live-preview/PrintAreaOverlay'
import { usePrintArea } from '@/hooks/use-print-area'
import { usePrintedImageStore } from '@/stores/printed-image/printed-image.store'
import { initTheBestTemplateForPrintedImages } from './helpers'
import { useEffect } from 'react'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { useTemplateStore } from '@/stores/ui/template.store'

type TProductProps = {
  product: TBaseProduct
  initialTemplate: TPrintTemplate
  onPickProduct: (product: TBaseProduct, initialTemplate: TPrintTemplate) => void
  onInitFirstProduct: (prod: TBaseProduct, initialTemplate: TPrintTemplate) => void
  isPicked: boolean
}

const Product = ({
  product,
  initialTemplate,
  onPickProduct,
  onInitFirstProduct,
  isPicked,
}: TProductProps) => {
  const { printAreaRef, printAreaContainerRef } = usePrintArea(product.printAreaList[0])

  useEffect(() => {
    onInitFirstProduct(product, initialTemplate)
  }, [])

  return (
    <div
      key={product.id}
      ref={printAreaContainerRef}
      data-product-id={product.id}
      data-is-picked={isPicked}
      className={`${
        isPicked ? 'outline-2 outline-main-cl' : 'outline-0'
      } NAME-gallery-product spmd:w-full spmd:h-auto h-[100px] aspect-square cursor-pointer mobile-touch outline-0 hover:outline-2 hover:outline-main-cl relative rounded-xl transition-transform duration-200 border border-gray-200`}
      onClick={() => onPickProduct(product, initialTemplate)}
    >
      <img
        src={product.url || '/images/placeholder.svg'}
        alt={product.name}
        className="NAME-product-image min-h-full max-h-full w-full h-full object-contain rounded-xl"
      />
      <PrintAreaOverlayPreview printTemplate={initialTemplate} printAreaRef={printAreaRef} />
    </div>
  )
}

type TProductGalleryProps = {
  products: TBaseProduct[]
  printedImages: TPrintedImage[]
}

export const ProductGallery = ({ products }: TProductGalleryProps) => {
  const printedImages = usePrintedImageStore((s) => s.printedImages)
  const initFirstProduct = useProductUIDataStore((s) => s.initFirstProduct)
  const pickedProduct = useProductUIDataStore((s) => s.pickedProduct)
  const handlePickProduct = useProductUIDataStore((s) => s.handlePickProduct)
  const initializeAddingTemplates = useTemplateStore((s) => s.initializeAddingTemplates)

  const scrollToPickedProduct = () => {
    if (pickedProduct) {
      const productElement = document.body.querySelector<HTMLElement>(
        `.NAME-gallery-product[data-product-id="${pickedProduct.id}"]`
      )
      if (productElement && productElement.dataset.isPicked === 'true') {
        productElement.scrollIntoView({ behavior: 'instant', block: 'center' })
      }
    }
  }

  const handleInitFirstProduct = (
    prod: TBaseProduct,
    initialTemplate: TPrintTemplate,
    isFinal: boolean
  ) => {
    initFirstProduct(prod, initialTemplate)
    initializeAddingTemplates([initialTemplate], isFinal)
  }

  useEffect(() => {
    scrollToPickedProduct()
  }, [products, pickedProduct])

  return (
    <div className="spmd:py-3 spmd:pb-3 spmd:h-screen spmd:w-auto w-full h-fit pt-2 pb-1 flex flex-col bg-white border border-gray-200">
      <h2 className="text-base w-full text-center font-bold text-gray-800 flex items-center justify-center gap-2">
        Gian hàng sản phẩm
      </h2>
      <div className="spmd:overflow-y-auto spmd:max-h-full spmd:flex-col smpd:px-1.5 px-3 py-2 overflow-x-auto gallery-scroll w-full h-fit flex items-center gap-3">
        {products &&
          products.length > 0 &&
          products.map((product, index) => {
            const printArea = product.printAreaList[0].area
            return (
              <Product
                key={product.id}
                product={product}
                initialTemplate={initTheBestTemplateForPrintedImages(
                  {
                    height: printArea.printH,
                    width: printArea.printW,
                  },
                  printedImages
                )}
                onPickProduct={handlePickProduct}
                onInitFirstProduct={(prod, initialTemplate) =>
                  handleInitFirstProduct(prod, initialTemplate, index === products.length - 1)
                }
                isPicked={product.id === pickedProduct?.id}
              />
            )
          })}
      </div>
    </div>
  )
}
