import { createInitialConstants } from '@/utils/contants'
import { create } from 'zustand'

type TUseEditAreaStore = {
  editAreaScaleValue: number

  setEditAreaScaleValue: (scaleValue: number) => void
  resetData: () => void
}

export const useEditAreaStore = create<TUseEditAreaStore>((set) => ({
  editAreaScaleValue: createInitialConstants<number>('ELEMENT_ZOOM'),

  resetData: () => {
    set({ editAreaScaleValue: createInitialConstants<number>('ELEMENT_ZOOM') })
  },
  setEditAreaScaleValue: (scaleValue) => set({ editAreaScaleValue: scaleValue }),
}))
