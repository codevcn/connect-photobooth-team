import { generateUniqueId } from '@/utils/helpers'
import {
  TBaseProduct,
  TElementsVisualState,
  TElementType,
  TPrintedImageVisualState,
  TStickerVisualState,
  TTextVisualState,
} from '@/utils/types/global'
import { create } from 'zustand'
import { useElementLayerStore } from '../ui/element-layer.store'

type TSelectedElement = {
  elementId: string
  elementType: TElementType
  elementURL?: string
}

type TSavedElementVisualState = Partial<TElementsVisualState> & {
  productId: TBaseProduct['id']
}

type TUseElementStore = {
  selectedElement: TSelectedElement | null
  stickerElements: TStickerVisualState[]
  textElements: TTextVisualState[]
  printedImages: TPrintedImageVisualState[]
  printedImagesBuildId: string | null
  savedElementsVisualStates: TSavedElementVisualState[]

  // Actions
  selectElement: (elementId: string, elementType: TElementType, elementURL?: string) => void
  cancelSelectingElement: () => void
  updateSelectedElement: (updatedElement: Partial<TSelectedElement>) => void
  addStickerElement: (stickers: TStickerVisualState[]) => void
  removeStickerElement: (stickerId: string) => void
  addTextElement: (textElements: TTextVisualState[]) => void
  removeTextElement: (textElementId: string) => void
  resetData: (resetAll?: boolean) => void
  setStickerElements: (stickers: TStickerVisualState[]) => void
  setTextElements: (textElements: TTextVisualState[]) => void
  setPrintedImageElements: (printedImages: TPrintedImageVisualState[]) => void
  addPrintedImageElements: (printedImages: TPrintedImageVisualState[]) => void
  removePrintedImageElement: (printedImageId: string) => void
  initBuiltPrintedImageElements: (printedImages: TPrintedImageVisualState[]) => void
  resetPrintedImagesBuildId: () => void
  addSavedElementVisualState: (elementVisualState: TSavedElementVisualState) => void
  recoverSavedElementsVisualStates: (productId: TBaseProduct['id']) => void
  checkSavedElementsVisualStateExists: (productId: TBaseProduct['id']) => boolean
  getSavedElementsVisualState: (productId: TBaseProduct['id']) => TSavedElementVisualState | null
}

export const useEditedElementStore = create<TUseElementStore>((set, get) => ({
  selectedElement: null,
  stickerElements: [],
  textElements: [],
  printedImages: [],
  printedImagesBuildId: null,
  savedElementsVisualStates: [],

  getSavedElementsVisualState: (productId) => {
    const { savedElementsVisualStates } = get()
    return savedElementsVisualStates.find((evs) => evs.productId === productId) || null
  },
  checkSavedElementsVisualStateExists: (productId) => {
    const { savedElementsVisualStates } = get()
    return savedElementsVisualStates.some((evs) => evs.productId === productId)
  },
  addSavedElementVisualState: (elementVisualState) => {
    if (!elementVisualState.productId) return
    const savedElementsVisualStates = get().savedElementsVisualStates
    if (savedElementsVisualStates.some((evs) => evs.productId === elementVisualState.productId)) {
      set({
        savedElementsVisualStates: savedElementsVisualStates.map((evs) =>
          evs.productId === elementVisualState.productId ? { ...evs, ...elementVisualState } : evs
        ),
      })
    } else {
      set({
        savedElementsVisualStates: [...savedElementsVisualStates, elementVisualState],
      })
    }
  },
  recoverSavedElementsVisualStates: (productId) => {
    const savedElementsVisualState = get().getSavedElementsVisualState(productId)
    if (!savedElementsVisualState) return
    const printedImages = savedElementsVisualState.printedImages || []
    const stickerElements = savedElementsVisualState.stickers || []
    const textElements = savedElementsVisualState.texts || []
    set({
      printedImages: printedImages.map((img) => ({ ...img, mountType: 'from-saved' })),
      stickerElements: stickerElements.map((sticker) => ({ ...sticker, mountType: 'from-saved' })),
      textElements: textElements.map((text) => ({ ...text, mountType: 'from-saved' })),
    })
    useElementLayerStore.getState().addElementLayersOnRestore(
      printedImages
        .map((text) => ({
          elementId: text.id,
          index: text.zindex,
          elementType: 'text' as TElementType,
        }))
        .concat(
          printedImages.map((printedImage) => ({
            elementId: printedImage.id,
            index: printedImage.zindex,
            elementType: 'printed-image' as TElementType,
            isLayoutImage: printedImage.isInitWithLayout,
          }))
        )
        .concat(
          stickerElements.map((sticker) => ({
            elementId: sticker.id,
            index: sticker.zindex,
            elementType: 'sticker' as TElementType,
          }))
        )
    )
  },
  initBuiltPrintedImageElements: (printedImages) => {
    set({
      printedImages: [
        ...get().printedImages.filter((img) => !img.isInitWithLayout),
        ...printedImages,
      ],
    })
  },
  resetPrintedImagesBuildId: () => {
    set({
      printedImagesBuildId: generateUniqueId(),
    })
  },
  removePrintedImageElement: (printedImageId) => {
    const { printedImages, selectedElement } = get()
    // Chỉ set selectedElement = null nếu printed image đang xóa chính là printed image đang được chọn
    const shouldClearSelection = selectedElement?.elementId === printedImageId
    set({
      printedImages: printedImages.filter((printedImage) => printedImage.id !== printedImageId),
      ...(shouldClearSelection ? { selectedElement: null } : {}),
    })
  },
  setPrintedImageElements: (printedImages) => {
    set({ printedImages })
  },
  addPrintedImageElements: (printedImages) => {
    const { printedImages: existingPrintedImages } = get()
    set({ printedImages: [...existingPrintedImages, ...printedImages] })
  },
  setStickerElements: (stickers) => {
    set({ stickerElements: stickers })
  },
  setTextElements: (textElements) => {
    set({ textElements })
  },
  updateSelectedElement: (updatedElement) => {
    const { selectedElement } = get()
    if (!selectedElement) return
    set({ selectedElement: { ...selectedElement, ...updatedElement } })
  },
  resetData: (resetAll = false) => {
    if (resetAll) {
      set({
        selectedElement: null,
        stickerElements: [],
        textElements: [],
        printedImages: [],
        printedImagesBuildId: null,
        savedElementsVisualStates: [],
      })
    } else {
      set({
        selectedElement: null,
        stickerElements: [],
        textElements: [],
        printedImages: [],
        printedImagesBuildId: null,
      })
    }
  },
  addTextElement: (addedTextElements) => {
    const { textElements } = get()
    set({ textElements: [...textElements, ...addedTextElements] })
  },
  removeTextElement: (textElementId) => {
    const { textElements, selectedElement } = get()
    // Chỉ set selectedElement = null nếu text element đang xóa chính là element đang được chọn
    const shouldClearSelection = selectedElement?.elementId === textElementId
    set({
      textElements: textElements.filter((textElement) => textElement.id !== textElementId),
      ...(shouldClearSelection && { selectedElement: null }),
    })
  },
  addStickerElement: (stickers) => {
    const { stickerElements } = get()
    set({ stickerElements: [...stickerElements, ...stickers] })
  },
  removeStickerElement: (stickerId) => {
    const { stickerElements, selectedElement } = get()
    // Chỉ set selectedElement = null nếu sticker đang xóa chính là sticker đang được chọn
    const shouldClearSelection = selectedElement?.elementId === stickerId
    set({
      stickerElements: stickerElements.filter((sticker) => sticker.id !== stickerId),
      ...(shouldClearSelection ? { selectedElement: null } : {}),
    })
  },
  selectElement: (elementId, elementType, elementURL) => {
    set({ selectedElement: { elementType, elementId, elementURL } })
  },
  cancelSelectingElement: () => {
    set({ selectedElement: null })
  },
}))
