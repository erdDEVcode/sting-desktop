import { useState, useCallback, useEffect } from 'react'

import { doInterval } from '../utils/timer'
import { Account, Network, TransactionsResult } from '../types/all'

interface UseTransactionsResult {
  transactionsResult?: TransactionsResult,
  fetchTransactions: () => Promise<void>,
}

export const useTransactions = (account?: Account, network?: Network): UseTransactionsResult => {
  const [ transactionsResult, setTransactionsResult ] = useState<TransactionsResult>()

  const fetchTransactions = useCallback(async () => {
    if (account && network?.connection && !(network.failure)) {
      const address = account.address()
      try {
        const ret = await network.connection.getTransactions(address)
        // console.log(ret)
        setTransactionsResult(ret)
      } catch (err) {
        console.error(`Error fetching transactions: ${err.message}`)
        setTransactionsResult(undefined)
        // TODO: notify user somehow
      }
    }
  }, [account, network])

  // account balance timer
  useEffect(() => {
    const timer = doInterval(async () => {
      fetchTransactions()
    }, { delayMs: 5000, executeImmediately: true })

    return () => clearInterval(timer)
  }, [fetchTransactions, account, network ])

  return { transactionsResult, fetchTransactions }
}
