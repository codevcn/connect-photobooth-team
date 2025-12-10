import { TBaseProduct, TPrintAreaInfo, TPrintedImage } from '@/utils/types/global'
import { PrintAreaOverlayPreview } from './live-preview/PrintAreaOverlay'
import { usePrintArea } from '@/hooks/use-print-area'
import { usePrintedImageStore } from '@/stores/printed-image/printed-image.store'
import { useEffect, useState } from 'react'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { buildDefaultLayout } from './customize/print-layout/builder'
import { TPrintLayout } from '@/utils/types/print-layout'
import { hardCodedLayoutData } from '@/configs/print-layout/print-layout-data'
import { useLayoutStore } from '@/stores/ui/print-layout.store'
import { PreviewImage } from './customize/print-layout/PreviewImage'
import { createInitialConstants } from '@/utils/contants'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'
import { useEditedElementStore } from '@/stores/element/element.store'
import { useVisualStatesCollector } from '@/hooks/use-visual-states-collector'
import { fillQueryStringToURL } from '@/utils/helpers'
import { LocalStorageHelper } from '@/utils/localstorage'
import { useKeyboardStore } from '@/stores/keyboard/keyboard.store'
import { useProductStore } from '@/stores/product/product.store'
import { useEditAreaStore } from '@/stores/ui/edit-area.store'
import { useEditModeStore } from '@/stores/ui/edit-mode.store'
import { useElementStylingStore } from '@/stores/element/element-styling.store'

type TProductProps = {
  product: TBaseProduct
  firstPrintAreaInProduct: TPrintAreaInfo
  onPickProduct: (
    product: TBaseProduct,
    initialLayout: TPrintLayout,
    firstPrintAreaInProduct: TPrintAreaInfo
  ) => void
  isPicked: boolean
  onInitFirstProduct: (
    product: TBaseProduct,
    initialLayout: TPrintLayout,
    firstPrintAreaInProduct: TPrintAreaInfo
  ) => void
  printedImages: TPrintedImage[]
}

const Product = ({
  product,
  onPickProduct,
  isPicked,
  onInitFirstProduct,
  firstPrintAreaInProduct,
  printedImages,
}: TProductProps) => {
  const [initialLayout, setInitialLayout] = useState<TPrintLayout>()
  // const previewPrintAreaRef = useRef<HTMLDivElement | null>(null)
  // const previewPrintAreaContainerRef = useRef<HTMLDivElement | null>(null)

  const buildInitialLayout = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!printAreaContainerRef.current || !printAreaRef.current) return
        const { layout } = buildDefaultLayout(
          printAreaContainerRef.current,
          printAreaRef.current,
          printedImages,
          2
        )
        const initialLayout: TPrintLayout = {
          ...hardCodedLayoutData(layout.type)[0],
          printedImageElements: layout.elements,
        }
        setInitialLayout(initialLayout)
        onInitFirstProduct(product, initialLayout, firstPrintAreaInProduct)
      })
    })
  }

  const { printAreaRef, printAreaContainerRef } = usePrintArea(
    firstPrintAreaInProduct,
    buildInitialLayout
  )

  useEffect(() => {
    buildInitialLayout()
  }, [product.id])

  return (
    <div
      ref={(node) => {
        // previewPrintAreaContainerRef.current = node
        printAreaContainerRef.current = node
      }}
      data-product-id={product.id}
      data-is-picked={isPicked}
      className={`${
        isPicked ? 'outline-2 outline-main-cl' : 'outline-0'
      } NAME-gallery-product spmd:w-full spmd:h-auto h-[100px] aspect-square cursor-pointer mobile-touch outline-0 hover:outline-2 hover:outline-main-cl relative rounded-xl border border-gray-200`}
      onClick={() => {
        if (initialLayout) onPickProduct(product, initialLayout, firstPrintAreaInProduct)
      }}
    >
      <img
        src={firstPrintAreaInProduct.imageUrl || '/images/placeholder.svg'}
        alt={product.name}
        className="NAME-product-image min-h-full max-h-full w-full h-full object-contain rounded-xl"
      />
      <PrintAreaOverlayPreview
        registerPrintAreaRef={(node) => {
          printAreaRef.current = node
          // previewPrintAreaRef.current = node
        }}
      />
      {initialLayout?.printedImageElements.map((printedImageVisualState) => (
        <PreviewImage
          key={printedImageVisualState.id}
          printedImageVisualState={printedImageVisualState}
        />
      ))}
    </div>
  )
}

type TProductGalleryProps = {
  products: TBaseProduct[]
  printedImages: TPrintedImage[]
}

type TConfirmExitModalProps = {
  show: boolean
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmExitModal = ({ show, onConfirm, onCancel }: TConfirmExitModalProps) => {
  if (!show) return null

  return (
    <div className="5xl:text-2xl fixed inset-0 z-999 flex items-center justify-center bg-black/50 animate-pop-in p-4">
      <div onClick={onCancel} className="absolute inset-0"></div>
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full relative z-10 p-4">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-main-cl p-3 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-triangle-alert-icon lucide-triangle-alert text-white w-6 h-6 5xl:w-12 5xl:h-12"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="5xl:text-[1em] text-xl font-bold text-gray-800 text-center mb-3">
          Bạn có thực sự muốn rời khỏi khu vực chỉnh sửa?
        </h3>

        {/* Description */}
        <p className="5xl:text-[0.8em] font-medium text-gray-600 text-center mb-6 text-sm">
          Tất cả chỉnh sửa của bạn sẽ bị xóa và không thể khôi phục.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg active:scale-95 transition"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-main-cl hover:bg-dark-main-cl text-white font-bold py-3 px-4 rounded-lg active:scale-95 transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

export const ProductGallery = ({ products }: TProductGalleryProps) => {
  const printedImages = usePrintedImageStore((s) => s.printedImages)
  const pickedProduct = useProductUIDataStore((s) => s.pickedProduct)
  const allLayouts = useLayoutStore((s) => s.allLayouts)
  const mockupId = useSearchParams()[0].get('mockupId')
  const [firstProduct, setFirstProduct] = useState<[TBaseProduct, TPrintLayout, TPrintAreaInfo]>()
  const { collectMockupVisualStates } = useVisualStatesCollector()
  const navigate = useNavigate()
  const [showExitModal, setShowExitModal] = useState(false)

  const resetAllStores = () => {
    // Reset tất cả stores
    useEditedElementStore.getState().resetData(true)
    useElementLayerStore.getState().resetData()
    useProductUIDataStore.getState().resetData(true)
    useLayoutStore.getState().resetData()
    useKeyboardStore.getState().resetData()
    useProductStore.getState().resetData()
    usePrintedImageStore.getState().resetData()
    useEditAreaStore.getState().resetData()
    useEditModeStore.getState().resetData()
    useElementStylingStore.getState().resetData()

    // Clear localStorage
    LocalStorageHelper.clearAllMockupData()
  }

  const handleConfirmExit = () => {
    resetAllStores()
    navigate('/qr' + fillQueryStringToURL())
  }

  const handleCancelExit = () => {
    setShowExitModal(false)
  }

  const handleBackButtonClick = () => {
    setShowExitModal(true)
  }

  const handlePickProduct = (
    product: TBaseProduct,
    initialLayout: TPrintLayout,
    firstPrintAreaInProduct: TPrintAreaInfo
  ) => {
    if (!pickedProduct) return
    if (pickedProduct.id === product.id) return
    const elementsVisualState = collectMockupVisualStates()
    const { resetData, checkSavedElementsVisualStateExists, addSavedElementVisualState } =
      useEditedElementStore.getState()
    resetData()
    useElementLayerStore.getState().resetData()
    addSavedElementVisualState({
      productId: pickedProduct.id,
      ...elementsVisualState,
    })
    if (checkSavedElementsVisualStateExists(product.id)) {
      useProductUIDataStore.getState().handlePickProduct(product, firstPrintAreaInProduct)
      useEditedElementStore.getState().recoverSavedElementsVisualStates(product.id)
    } else {
      useProductUIDataStore
        .getState()
        .handlePickProduct(product, firstPrintAreaInProduct, initialLayout)
    }
  }

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

  const initFirstProduct = () => {
    if (!mockupId) {
      if (allLayouts.length > 0 && firstProduct && firstProduct.length === 3) {
        useProductUIDataStore
          .getState()
          .handlePickFirstProduct(firstProduct[0], firstProduct[1], firstProduct[2])
      }
    }
  }

  const handleSetFirstProduct = (
    firstProductInList: TBaseProduct,
    initialLayout: TPrintLayout,
    initialSurface: TPrintAreaInfo
  ) => {
    if (firstProductInList.id === products[0].id) {
      setFirstProduct([firstProductInList, initialLayout, initialSurface])
    }
  }

  useEffect(() => {
    initFirstProduct()
  }, [allLayouts.length, firstProduct?.length, firstProduct?.map((item) => item.id).join('-')])

  useEffect(() => {
    scrollToPickedProduct()
  }, [pickedProduct?.id])

  return (
    <div className="spmd:pb-3 spmd:h-screen spmd:w-auto md:text-base text-sm w-full h-fit pb-1 flex flex-col bg-white border-r border-r-gray-200">
      <ConfirmExitModal
        show={showExitModal}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
      <button
        onClick={handleBackButtonClick}
        className="flex gap-3 cursor-pointer mobile-touch items-center justify-center font-bold w-full py-2 px-1 border-b border-gray-300 bg-main-cl text-white"
      >
        {/* <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-move-left-icon lucide-move-left w-6 h-6 5xl:w-9 5xl:h-9 text-white"
        >
          <path d="M6 8L2 12L6 16" />
          <path d="M2 12H22" />
        </svg> */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#fff"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-arrow-big-left-icon lucide-arrow-big-left w-6 h-6 5xl:w-8 5xl:h-8 text-white"
        >
          <path d="M13 9a1 1 0 0 1-1-1V5.061a1 1 0 0 0-1.811-.75l-6.835 6.836a1.207 1.207 0 0 0 0 1.707l6.835 6.835a1 1 0 0 0 1.811-.75V16a1 1 0 0 1 1-1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z" />
        </svg>
        <span className="text-xl">Quay về</span>
      </button>
      <h2 className="5xl:text-[1.3em] text-[1em] py-2 w-full text-center font-bold text-gray-800 flex items-center justify-center gap-2">
        Gian hàng sản phẩm
      </h2>
      <div className="NAME-products-gallery spmd:overflow-y-auto spmd:max-h-full spmd:flex-col smpd:px-1.5 px-3 py-2 overflow-x-auto gallery-scroll w-full h-fit flex items-center gap-3">
        {products &&
          products.length > 0 &&
          products.map((product) => {
            const firstPrintArea = product.printAreaList[0]
            return (
              <Product
                key={product.id}
                product={product}
                firstPrintAreaInProduct={firstPrintArea}
                isPicked={product.id === pickedProduct?.id}
                onPickProduct={handlePickProduct}
                onInitFirstProduct={handleSetFirstProduct}
                printedImages={printedImages}
              />
            )
          })}
      </div>
    </div>
  )
}
