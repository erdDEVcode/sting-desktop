import { useState, useCallback, useEffect } from 'react'

import { doInterval } from '../utils/timer'
import { Wallet, Network, TransactionsResult, TransactionOnChain } from '../types/all'

interface UseTransactionsResult {
  transactionsResult?: TransactionsResult,
  fetchTransactions: () => Promise<void>,
}

export const useTransactions = (wallet?: Wallet, network?: Network): UseTransactionsResult => {
  const [ transactionsResult, setTransactionsResult ] = useState<TransactionsResult>()

  const fetchTransactions = useCallback(async () => {
    if (wallet && network?.connection && !(network.failure)) {
      const address = wallet.address()
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
  }, [wallet, network])

  // wallet balance timer
  useEffect(() => {
    const timer = doInterval(async () => {
      fetchTransactions()
    }, { delayMs: 5000, executeImmediately: true })

    return () => clearInterval(timer)
  }, [fetchTransactions, wallet, network ])

  return { transactionsResult, fetchTransactions }
}

interface UseTrackTransactionResult {
  tx?: TransactionOnChain,
  error?: string,
}

export const useTrackTransaction = (network: Network, txHash: string): UseTrackTransactionResult => {
  const [ tx, setTx ] = useState<TransactionOnChain>()
  const [ error, setError ] = useState()

  useEffect(() => {
    const timer = doInterval(async () => {
      if (!network.connection || network.failure) {
      } else {
        try {
          setTx(await network.connection.getTransaction(txHash))
          setError(undefined)
        } catch (err) {
          console.warn(err)
          setTx(undefined)
          setError(err.message)
        }
      }
    }, { delayMs: 3000, executeImmediately: false /* give time for tx to show up on network */ })

    return () => clearInterval(timer)
  }, [setTx, network, txHash])

  return { tx, error }
}