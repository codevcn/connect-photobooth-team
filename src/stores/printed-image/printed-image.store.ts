import { TEditedImage } from '@/utils/types/global'
import { create } from 'zustand'

type TEditedImageContextValue = {
  printedImages: TEditedImage[]

  setPrintedImages: (printedImages: TEditedImage[]) => void
  clearAllPrintedImages: () => void
  resetData: () => void
}

export const usePrintedImageStore = create<TEditedImageContextValue>((set) => ({
  printedImages: [],

  resetData: () => {
    set({ printedImages: [] })
  },
  setPrintedImages: (printedImages) => set({ printedImages }),
  clearAllPrintedImages: () => {
    set({ printedImages: [] })
  },
}))
