import { createContext, useContext } from 'react'
import type { AppStore } from './store'

export const StoreContext = createContext<AppStore | undefined>(undefined)

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
