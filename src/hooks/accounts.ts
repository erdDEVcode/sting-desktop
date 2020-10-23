import { useState, useCallback } from 'react'

import { Account } from '../types/all'

interface UseAccountsResult {
  accounts: Account[],
  activeAccount?: Account,
  setActiveAccount: (a: Account) => void,
  addAccount: (a: Account) => void,
  removeAccount: (a: Account) => void,
}

const getAccountIndex = (accounts: Account[], acc: Account) => accounts.findIndex((a: Account) => a.address() === acc.address())

export const useAccounts = (): UseAccountsResult => {
  const [accounts, setAccounts] = useState([])
  const [activeAccount, setActiveAccount] = useState<Account>()

  // add account
  const addAccount = useCallback(a => {
    const pos = getAccountIndex(accounts, a)
    if (0 > pos) {
      setAccounts(accounts.concat(a))
      setActiveAccount(a)
    }
  }, [accounts])

  // remove account
  const removeAccount = useCallback(a => {
    const pos = getAccountIndex(accounts, a)
    if (0 <= pos) {
      accounts.splice(pos, 1)
      setAccounts(accounts.concat([]))
      const newActivePos = (0 < pos ? pos - 1 : accounts.length - 1)
      setActiveAccount(accounts[newActivePos])
    }
  }, [accounts])

  return { accounts, addAccount, removeAccount, activeAccount, setActiveAccount }
}
