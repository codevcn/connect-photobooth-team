import { create } from 'zustand'

type TKeyboardStore = {
  visible: boolean

  // Actions
  setIsVisible: (visible: boolean) => void
  hideKeyboard: () => void
  resetData: () => void
}

export const useKeyboardStore = create<TKeyboardStore>((set) => ({
  visible: false,

  resetData: () => {
    set({ visible: false })
  },
  setIsVisible: (visible: boolean) => set(() => ({ visible })),
  hideKeyboard: () => set(() => ({ visible: false })),
}))
