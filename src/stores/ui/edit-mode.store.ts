import { TEditMode } from '@/utils/types/global'
import { create } from 'zustand'

type TProductUIDataStore = {
  editMode: TEditMode

  setEditMode: (mode: TEditMode) => void
}

export const useEditModeStore = create<TProductUIDataStore>((set, get) => ({
  editMode: 'with-template',

  setEditMode: (mode: TEditMode) => {
    set({ editMode: mode })
  },
}))
