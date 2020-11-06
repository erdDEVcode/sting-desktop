import React from 'react'

import { useBalances, useDelegations, useRates } from '../hooks'
import { Wallet, Network, Balances, Delegation, Rates, TransactionsResult } from '../types/all'

export interface WalletContextValue {
  wallet?: Wallet,
  balances: Balances,
  delegation?: Delegation,
  rates: Rates,
  transactionsResult?: TransactionsResult,
  fetchTransactions: () => Promise<void>,
}

const WalletContext = React.createContext({} as WalletContextValue)

interface Props {
  activeWallet?: Wallet,
  network?: Network | null,
}

export const WalletProvider: React.FunctionComponent<Props> = ({ children, activeWallet, network }) => {
  const { balances } = useBalances(activeWallet, network || undefined)
  const { delegation } = useDelegations(activeWallet, network || undefined)
  const { rates } = useRates()
  const { transactionsResult, fetchTransactions } = /*useTransactions(activeWallet, network || undefined)*/ {
    transactionsResult: undefined,
    fetchTransactions: async () => {}
  }

  return (
    <WalletContext.Provider value={{
      wallet: activeWallet,
      balances,
      delegation,
      rates,
      transactionsResult,
      fetchTransactions,
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export const WalletConsumer = WalletContext.Consumer

