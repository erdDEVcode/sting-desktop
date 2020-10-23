import { useMemo, useEffect, useState } from 'react'

import { doInterval } from '../utils/timer'
import { Account, Network, Balances } from '../types/all'

interface UseBalancesResult {
  balances: Balances,
}

export const useBalances = (account?: Account, network?: Network): UseBalancesResult => {
  const [balances, setBalances] = useState<Balances>({})

  const primaryToken = useMemo(() => network ? network.endpoint.primaryToken : null, [ network ])

  // account balance timer
  useEffect(() => {
    const timer = doInterval(async () => {
      if (account && primaryToken && network?.connection && !(network.failure)) {
        const address = account.address()
        try {
          const ret = await network.connection.getAddress(address)
          const { balance } = ret
          setBalances({
            [primaryToken]: {
              token: primaryToken,
              amount: balance,
            }
          })
        } catch (err) {
          console.error(`Error fetching balance: ${err.message}`)
          // TODO: notify user somehow
        }
      }
      // fetch latest balance for account
    }, { delayMs: 5000, executeImmediately: true })

    return () => clearInterval(timer)
  }, [account, network, primaryToken])

  return { balances }
}
