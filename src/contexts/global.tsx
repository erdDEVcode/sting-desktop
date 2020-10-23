import React, { useState, useMemo, useEffect } from 'react'

import { Account, Network, NetworkEndpoint } from '../types/all'
import { setupThemes } from '../themes'
import { setupCoreFonts } from '../fonts'
import { useNetwork, useAccounts } from '../hooks'
import { deriveAccountFromMnemonic } from '../utils/erdWallet'
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
  accounts: Account[],
  activeAccount?: Account,
  setActiveAccount: Function,
  addAccount: Function,
  removeAccount: Function,
}


const GlobalContext = React.createContext({} as GlobalContextValue)

export const GlobalProvider: React.FunctionComponent = ({ children }) => {
  const [ experimentalFeaturesEnabled, setExperimentalFeaturesEnabled ] = useState(
    !window.inProductionMode
  )
  const [ themeName, setThemeName ] = useState('light')
  const { network, switchNetwork } = useNetwork()
  const { accounts, addAccount, removeAccount, setActiveAccount, activeAccount } = useAccounts()

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
      accounts,
      activeAccount,
      setActiveAccount,
      addAccount,
      removeAccount,
    }}>
      <StorageProvider account={activeAccount}>
        {children}
      </StorageProvider>
    </GlobalContext.Provider>
  )
}


export const GlobalConsumer = GlobalContext.Consumer

