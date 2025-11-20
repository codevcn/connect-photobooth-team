import { TBaseProduct, TClientProductVariant, TPrintedImage } from '@/utils/types/global'
import { ProductGallery } from './ProductGallery'
import { ProductDetails } from './product/ProductDetails'
import { Customize } from './customize/Customize'
import { LivePreview } from './live-preview/Live-Preview'
import { useEffect, useState } from 'react'
import { hardCodedPrintTemplates } from '@/configs/data/print-template'
import { useTemplateStore } from '@/stores/ui/template.store'

type TEditPageProps = {
  products: TBaseProduct[]
  printedImages: TPrintedImage[]
}

export default function EditPage({ products, printedImages }: TEditPageProps) {
  const { initializeTemplates, addImageToFrame } = useTemplateStore()
  const [pickedProduct, setPickedProduct] = useState<TBaseProduct>(products[8])
  const [pickedVariant, setPickedVariant] = useState<TClientProductVariant>(products[8].variants[0])
  const [pickedSurface, setPickedSurface] = useState<TBaseProduct['printAreaList']>(
    products[8].printAreaList
  )

  useEffect(() => {
    initializeTemplates(hardCodedPrintTemplates())
    if (printedImages.length > 0) {
      addImageToFrame(printedImages[0])
    }
  }, [])

  return (
    <div className="font-sans grid grid-cols-[1fr_6fr] h-screen gap-4">
      <ProductGallery products={products} printedImages={printedImages} />
      <div className="NAME-main-parent grid grid-cols-[3fr_2fr] gap-4 h-screen">
        <LivePreview
          pickedProduct={pickedProduct}
          editedVariantId={pickedVariant.id}
          editedPrintSurfaceId={pickedSurface[0].id}
        />
        <div className="flex flex-col space-y-2 p-4 pl-2 min-h-full max-h-full overflow-y-auto gallery-scroll border border-gray-400/30">
          <ProductDetails pickedProduct={pickedProduct} pickedVariant={pickedVariant} />
          <Customize />
        </div>
      </div>
    </div>
  )
}
