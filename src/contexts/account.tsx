import React from 'react'

import { useBalances, useDelegations, useRates, useTransactions } from '../hooks'
import { Account, Network, Balances, Delegation, Rates, TransactionsResult } from '../types/all'

export interface AccountContextValue {
  account?: Account,
  balances: Balances,
  delegation?: Delegation,
  rates: Rates,
  transactionsResult?: TransactionsResult,
  fetchTransactions: () => Promise<void>,
}

const AccountContext = React.createContext({} as AccountContextValue)

interface Props {
  activeAccount?: Account,
  network?: Network | null,
}

export const AccountProvider: React.FunctionComponent<Props> = ({ children, activeAccount, network }) => {
  const { balances } = useBalances(activeAccount, network || undefined)
  const { delegation } = useDelegations(activeAccount, network || undefined)
  const { rates } = useRates()
  const { transactionsResult, fetchTransactions } = /*useTransactions(activeAccount, network || undefined)*/ {
    transactionsResult: undefined,
    fetchTransactions: async () => {}
  }

  return (
    <AccountContext.Provider value={{
      account: activeAccount,
      balances,
      delegation,
      rates,
      transactionsResult,
      fetchTransactions,
    }}>
      {children}
    </AccountContext.Provider>
  )
}

export const AccountConsumer = AccountContext.Consumer

