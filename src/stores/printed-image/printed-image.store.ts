import { TEditedImageContextValue } from '@/utils/types/global'
import { create } from 'zustand'

export const usePrintedImageStore = create<TEditedImageContextValue>((set) => ({
  printedImages: [],
  setPrintedImages: (printedImages) => set({ printedImages }),
  clearAllPrintedImages: () => {
    set({ printedImages: [] })
  },
}))
