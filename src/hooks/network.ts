import { useEffect, useState, useCallback } from 'react'

import Data from '../data'
import { ErdProxy } from '../utils/erdProxy'
import { Network, NetworkEndpoint } from '../types/all'
import { doInterval } from '../utils/timer'

interface UseNetworkResult {
  network: Network | null,
  switchNetwork: (endpoint: NetworkEndpoint) => void,
}

const testConnection = async (connection: ErdProxy, setFailure: Function) => {
  try {
    await connection.assertConnected()
    setFailure() // clear previous failure flag
  } catch (err) {
    setFailure(`Failed to connect: ${err.message}`)
  }
}

export const useNetwork = (): UseNetworkResult => {
  const [endpoint, setEndpoint] = useState<NetworkEndpoint>()
  const [connection, setConnection] = useState<ErdProxy>()
  const [failure, setFailure] = useState<string>()

  // switch endpoint
  const switchNetwork = useCallback((endpoint: NetworkEndpoint) => {
    (async () => {
      if (endpoint) {
        const tmpProxy = new ErdProxy(endpoint)
        await testConnection(tmpProxy, setFailure)
        setEndpoint(endpoint)
        setConnection(tmpProxy)
      }
    })()
  }, [])

  // set initial endpoint
  useEffect(() => switchNetwork(Data.getEndpoints()[0]), [switchNetwork])

  // continous check
  useEffect(() => {
    const timer = doInterval(async () => {
      if (connection) {
        await testConnection(connection, setFailure)
      }
    }, { delayMs: 10000, executeImmediately: true })

    return () => clearInterval(timer)
  },[ connection ])

  return {
    network: (connection && endpoint) ? {
      endpoint: endpoint!,
      config: connection!.getConfig(),
      connection: connection!,
      failure,
      ...connection!.getConfig(),
    } : null,
    switchNetwork
  }
}