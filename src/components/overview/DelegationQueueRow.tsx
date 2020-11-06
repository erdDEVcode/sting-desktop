import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Contract, ContractQueryResultDataType, parseQueryResult } from 'erdor' 
import styled from '@emotion/styled'

import { useDelegationData } from './hooks'
import { Delegation, Network, Wallet, Provider, Rate } from '../../types/all'
import BalanceValueRow from './BalanceValueRow'
import ActionButton from './ActionButton'
import ErrorBox from '../ErrorBox'
import LoadingIcon from '../LoadingIcon'
import { AssetValue, AssetValueNumberStyle } from '../../utils/number'

const Container = styled.div``

const MinStakeText = styled.p`
  ${(p: any) => p.theme.font('body', 'normal', 'italic')};
  color: ${(p: any) => p.theme.overview.actionBox.metaText.color};
  font-size: 0.7rem;
  margin-top: 1rem;
`

interface Props {
  network: Network,
  provider: Provider,
  wallet: Wallet,
  rate?: Rate,
  delegation?: Delegation,
}

const DelegationQueueRow: React.FunctionComponent<Props> = ({ network, delegation, provider, wallet, rate }) => {
  const {
    waitingStake,
  } = useDelegationData(network, delegation)

  const [ loading, setLoading ] = useState<boolean>(true)
  const [ minStake, setMinStake ] = useState<number>()
  const [ minStakeDisplay, setMinStakeDisplay ] = useState<string>()
  const [ loadingError, setLoadingError ] = useState<string>()

  const contract = useMemo(() => {
    return Contract.at(network.endpoint.delegationContract, {
      provider,
      sender: wallet!.address()
    })
  }, [network.endpoint.delegationContract, provider, wallet])

  useEffect(() => {
    (async () => {
      setLoading(true)
      setLoadingError(undefined)
      setMinStake(undefined)

      try {
        const minStake = parseQueryResult(await contract.query('getMinimumStake', []), {
          type: ContractQueryResultDataType.INT
        })

        setMinStake(minStake as number)
        setMinStakeDisplay(AssetValue.fromTokenAmount(network.endpoint.primaryToken, minStake).toString({ 
          showSymbol: true, 
          numberStyle: AssetValueNumberStyle.RAW_SCALED
        }))
      } catch (err) {
        console.error(err)
        setLoadingError(`Error fetching staking info: ${err.message}`)
      } finally {
        setLoading(false)
      }
    })()
  }, [contract, network.endpoint.primaryToken])

  const delegate = useCallback(async () => {
    try {
      await contract.callFunction('stake', [], {
        gasLimit: 250000000,
        meta: {
          displayOptions: {
            minValue: minStake,
          }
        }
      })
    } catch (err) {
      console.warn(err)
    }
  }, [contract, minStake])

  return (
    <BalanceValueRow 
      label='Delegation queue'
      balance={waitingStake} 
      rate={rate} 
    >
      {() => (
        <Container>
          {loading ? <LoadingIcon /> : null}
          {loadingError ? (
            <ErrorBox>{loadingError}</ErrorBox>
          ) : (
            <React.Fragment>
              <ActionButton onClick={delegate}>Delegate to queue</ActionButton>
              <MinStakeText>Minimum amount: {minStakeDisplay}</MinStakeText>
            </React.Fragment>
          )}
        </Container>
      )}
    </BalanceValueRow>
  )
}


export default DelegationQueueRow