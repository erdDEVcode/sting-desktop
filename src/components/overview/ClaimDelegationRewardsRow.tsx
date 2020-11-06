import React, { useCallback } from 'react'
import { Contract } from 'erdor' 
import styled from '@emotion/styled'

import { useDelegationData } from './hooks'
import { Delegation, Network, Wallet, Provider, Rate } from '../../types/all'
import BalanceValueRow from './BalanceValueRow'
import ActionButton from './ActionButton'

const NoRewardsYet = styled.em`
  display: block;
  ${(p: any) => p.theme.font('body', 'normal', 'italic')};
`

interface Props {
  network: Network,
  provider: Provider,
  wallet: Wallet,
  rate?: Rate,
  delegation?: Delegation,
}

const ClaimDelegationRewardsRow: React.FunctionComponent<Props> = ({ network, delegation, provider, wallet, rate }) => {
  const { 
    delegationsTotal,
    claimableRewards,
    hasClaimableRewards,
  } = useDelegationData(network, delegation)

  const claimRewards = useCallback(async () => {
    const c = Contract.at(network.endpoint.delegationContract, {
      provider,
      sender: wallet!.address()
    })

    try {
      await c.callFunction('claimRewards', [], {
        gasLimit: 250000000,
        meta: {
          displayOptions: {
            excludeAmount: true,
            skipPreview: true,
          }
        }
      })
    } catch (err) {
      console.warn(err)
    }
  }, [network.endpoint.delegationContract, provider, wallet])

  return delegationsTotal ? (
    <BalanceValueRow 
      label='Delegation/Staking' 
      balance={claimableRewards} 
      rate={rate} 
    >
      {hasClaimableRewards ? () => (
        <ActionButton onClick={claimRewards}>Claim rewards</ActionButton>
      ) : undefined}
    </BalanceValueRow>
  ) : null
}


export default ClaimDelegationRewardsRow