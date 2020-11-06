import React, { useState, useMemo, useEffect } from 'react'

import { Wallet, Network, NetworkEndpoint } from '../types/all'
import { setupThemes } from '../themes'
import { setupCoreFonts } from '../fonts'
import { useNetwork, useWallets } from '../hooks'
import { deriveWalletFromMnemonic } from '../utils/erdWallet'
import { StorageProvider } from './storage'

// setup fonts
const font = setupCoreFonts()

// setup themes
const themes = setupThemes()

export interface GlobalContextValue {
  experimentalFeaturesEnabled: boolean,
  setExperimentalFeaturesEnabled: Function,
  theme: object,
  setThemeName: Function,
  network: Network | null,
  switchNetwork: (endpoint: NetworkEndpoint) => void,
  wallets: Wallet[],
  activeWallet?: Wallet,
  setActiveWallet: Function,
  addWallet: Function,
  removeWallet: Function,
}


const GlobalContext = React.createContext({} as GlobalContextValue)

export const GlobalProvider: React.FunctionComponent = ({ children }) => {
  const [ experimentalFeaturesEnabled, setExperimentalFeaturesEnabled ] = useState(
    !window.inProductionMode
  )
  const [ themeName, setThemeName ] = useState('light')
  const { network, switchNetwork } = useNetwork()
  const { wallets, addWallet, removeWallet, setActiveWallet, activeWallet } = useWallets()

  const theme = useMemo(() => {
    const r = themes.get(themeName)
    r.font = font
    return r
  }, [ themeName ])

  return (
    <GlobalContext.Provider value={{
      experimentalFeaturesEnabled,
      setExperimentalFeaturesEnabled,
      theme,
      setThemeName,
      network,
      switchNetwork,
      wallets,
      activeWallet,
      setActiveWallet,
      addWallet,
      removeWallet,
    }}>
      <StorageProvider wallet={activeWallet}>
        {children}
      </StorageProvider>
    </GlobalContext.Provider>
  )
}

export const GlobalConsumer = GlobalContext.Consumer
