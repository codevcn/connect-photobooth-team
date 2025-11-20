import { TGlobalContextValue, TLoadedTextFontContextValue } from '@/utils/types/global'
import { createContext, useContext } from 'react'

export const GlobalContext = createContext<TGlobalContextValue>({
  pickedElementRoot: null,
  elementType: null,
  sessionId: null,
  preSentMockupImageLinks: [],
  addPreSentMockupImageLink: () => {},
})

export const useGlobalContext = () => useContext(GlobalContext)

export const LoadedTextFontContext = createContext<TLoadedTextFontContextValue>({
  availableFonts: [],
  setAvailableFonts: () => {},
})

export const useLoadedTextFontContext = () => useContext(LoadedTextFontContext)
