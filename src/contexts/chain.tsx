import React, { useCallback, useRef } from 'react'
import { useToasts } from 'react-toast-notifications'

import SignAndSendTransaction, { SignAndSendTransactionInterface } from '../components/SignAndSendTransaction'
import TrackTransactionToast from '../components/toasts/TrackTransactionToast'
import { Network, Provider, ContractQueryParams, Transaction, SignedTransaction } from '../types/all'

export interface ChainContextValue extends Provider {

}

const ChainContext = React.createContext({} as ChainContextValue)

interface Props {
  network: Network | null,
}

const ensureNetwork = (network: Network | null) => {
  if (network?.connection) {
    return
  } else {
    throw new Error('Not connected to Elrond network')
  }
}

export const ChainProvider: React.FunctionComponent<Props> = ({ network, children }) => {
  const signerRef = useRef(null)
  const { addToast } = useToasts()

  const trackTransaction = useCallback((txHash: string) => {
    addToast(<TrackTransactionToast txHash={txHash} />)
  }, [ addToast ])

  const getNetworkConfig = useCallback(async () => {
    ensureNetwork(network)
    return network?.config
  }, [ network ])

  const getAccount = useCallback(async (address: string) => {
    ensureNetwork(network)
    return await network?.connection.getAddress(address)
  }, [ network ])

  const queryContract = useCallback(async (params: ContractQueryParams) => {
    ensureNetwork(network)
    return await network?.connection.queryContract(params)
  }, [ network])

  const sendSignedTransaction = useCallback(async (signedTx: SignedTransaction) => {
    ensureNetwork(network)
    const ret = await network?.connection.sendSignedTransaction(signedTx)
    trackTransaction(ret.hash)
    return ret
  }, [network, trackTransaction])

  const signAndSendTransaction = useCallback(async (tx: Transaction) => {
    ensureNetwork(network)
    const signedTx = await (signerRef.current! as SignAndSendTransactionInterface).execute(tx)
    const ret = await sendSignedTransaction(signedTx)
    return ret
  }, [network, sendSignedTransaction])

  const getTransaction = useCallback(async (txHash: string) => {
    ensureNetwork(network)
    return await network?.connection.getTransaction(txHash)
  }, [network])

  return (
    <ChainContext.Provider value={{
      getNetworkConfig,
      getAccount,
      queryContract,
      sendSignedTransaction,
      signAndSendTransaction,
      getTransaction,
    }}>
      <SignAndSendTransaction ref={signerRef} />
      {children}
    </ChainContext.Provider>
  )
}

export const ChainConsumer = ChainContext.Consumer

