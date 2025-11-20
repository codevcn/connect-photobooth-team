import { TProductContextValue } from '@/utils/types/global'
import { create } from 'zustand'

export const useProductStore = create<TProductContextValue>((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
}))
