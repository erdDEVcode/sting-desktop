import { useEffect, useState } from 'react'

import { doInterval } from '../utils/timer'
import { Wallet, Network, Delegation } from '../types/all'

interface UseDelegationsResult {
  delegation?: Delegation,
}

export const useDelegations = (wallet?: Wallet, network?: Network): UseDelegationsResult => {
  const [delegation, setDelegation] = useState<Delegation | undefined>()

  useEffect(() => {
    const timer = doInterval(async () => {
      if (wallet && network?.connection && !(network.failure)) {
        if (!network?.endpoint.delegations) {
          setDelegation(undefined)
        } else {
          const address = wallet.address()
          
          try {
            const ret = await network.connection.getDelegation(address)
            setDelegation({
              claimable: ret.claimableRewards,
              activeStake: ret.userActiveStake,
              waitingStake: ret.userWaitingStake,
            })
          } catch (err) {
            console.error(`Error fetching delegation: ${err.message}`)
            // TODO: notify user somehow
          }
        }
      }
    }, { delayMs: 5000, executeImmediately: true })

    return () => clearInterval(timer)
  }, [wallet, network])

  return { delegation }
}
