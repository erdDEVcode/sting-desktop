import React, { useState, useMemo, useCallback } from 'react'
import styled from '@emotion/styled'
import { flex } from 'emotion-styled-utils'

import { Network, Account, Balances, Delegation, Rates } from '../../types/all'
import {
  GlobalConsumer,
  GlobalContextValue,
  AccountConsumer,
  AccountContextValue,
} from '../../contexts'
import { AssetValue } from '../../utils/number'
import LoadingIcon from '../LoadingIcon'
import QrCodeModal from '../QrCodeModal'
import { ViewAddressInExplorer, ViewInExplorerContext } from '../ViewInExplorer'
import IconButton from '../IconButton'
import CopyToClipboardButton from '../CopyToClipboardButton'
import BalanceBlock from '../dashboard/BalanceBlock'
import ValueBox from '../ValueBox'

const Container = styled.div`
  ${flex({ direction: 'column', justify: 'center', align: 'center' })};
  background-color: ${(p: any) => p.theme.content.bgColor};
  color: ${(p: any) => p.theme.content.textColor};
  height: 100%;
  width: 100%;
`

const AddressContainer = styled.div`
  ${(p: any) => p.theme.font('data')};
  font-size: 0.8rem;
  margin: 0 0 5rem;
  ${flex({ direction: 'row', justify: 'center', align: 'center', basis: 0 })};

  button {
    margin-left: 0.5rem;
  }
`

const AddressValueBox = styled(ValueBox)``

const ValuesContainer = styled.div`
  ${flex({ direction: 'column', justify: 'center', align: 'center', basis: 0 })};
  margin: 0;
  font-size: 1rem;
`

const TotalContainer = styled.div`
  position: relative;
  padding: 3em;
  border-radius: 12em;
  ${flex({ direction: 'column', justify: 'center', align: 'center' })};
  background-color: ${(p: any) => p.theme.overview.totalContainer.bgColor};
  width: 30em;
  max-height: 20em;
  margin-bottom: 1rem;
`

const SubValuesContainer = styled.div`
  ${flex({ direction: 'row', justify: 'center', align: 'center' })};
`

const BalanceContainer = styled.div`
  font-size: 70%;
  margin: 0 1rem;
  width: 30em;
  height: 17em;
  position: relative;
  padding: 3em 0;
  border-radius: 12em;
  ${flex({ direction: 'column', justify: 'flex-start', align: 'center' })};
  background-color: ${(p: any) => p.theme.overview.balanceContainer.bgColor};

  h2 {
    margin: 0 0 1rem;
  }
`

const NoDelegations = styled.em`
  display: block;
  ${(p: any) => p.theme.font('body', 'normal', 'italic')};
  font-size: 0.8rem;
  margin-top: 1rem;
`

const DelegatedContainer= styled(BalanceContainer)`
`

interface DataProps {
  network: Network,
  account: Account,
  balances: Balances,
  delegation?: Delegation,
  rates: Rates,
  fetchTransactions: () => Promise<any>,
}

const OverviewData: React.FunctionComponent<DataProps> = props => {
  const { balances, delegation, rates, account, network } = props

  const delegationsSupported = useMemo(() => !!(network?.endpoint?.delegations), [ network ])

  const primaryToken = useMemo(() => network.endpoint.primaryToken, [ network ])

  const [ showQrCode, setShowQrCode ] = useState(false)

  const balance = useMemo(() => balances[primaryToken], [ balances, primaryToken ])

  const rate = useMemo(() => {
    const r = rates[primaryToken]
    return (r && !Number.isNaN(r.value)) ? r : undefined
  }, [rates, primaryToken])

  const delegationsTotal = useMemo(() => {
    if (!delegationsSupported || !delegation) {
      return undefined
    }

    const aActiveStake = AssetValue.fromTokenAmount(primaryToken, delegation.activeStake || '0')
    const aWaitingStake = AssetValue.fromTokenAmount(primaryToken, delegation.waitingStake || '0')
    const aClaimable = AssetValue.fromTokenAmount(primaryToken, delegation.claimable || '0')

    return aActiveStake.add(aWaitingStake).add(aClaimable).toBalance()
  }, [ primaryToken, delegationsSupported, delegation ])

  const total = useMemo(() => {
    if (balance) {
      const aBalance = AssetValue.fromBalance(balance)

      if (delegationsSupported && delegationsTotal) {
        const aDelegations = AssetValue.fromBalance(delegationsTotal)
        return aBalance.add(aDelegations).toBalance()
      } else {
        return aBalance.toBalance()
      }
    } else {
      return undefined
    }
  }, [ balance, delegationsSupported, delegationsTotal ])

  const toggleQrCode = useCallback(() => {
    setShowQrCode(!showQrCode)
  }, [showQrCode ])

  return (
    <Container>
      <AddressContainer>
        <AddressValueBox>{account.address()}</AddressValueBox>
        <CopyToClipboardButton value={account.address()} />
        <IconButton icon='qrcode' tooltip='View QR code' onClick={toggleQrCode} />
        <ViewAddressInExplorer address={account.address()}>
          {({ onClick }: ViewInExplorerContext) => <IconButton icon='open-external' tooltip='View in explorer' onClick={onClick}/>}
        </ViewAddressInExplorer>
        <QrCodeModal
          title='Your account address'
          value={account.address()}
          onRequestClose={toggleQrCode}
          isOpen={showQrCode}
        />
      </AddressContainer>
      <ValuesContainer>
        <TotalContainer>
          <BalanceBlock
            token={primaryToken}
            balance={total}
            rate={rate}
          />
        </TotalContainer>
        <SubValuesContainer>
          <BalanceContainer>
            <h2>Balance</h2>
            <BalanceBlock
              token={primaryToken}
              balance={balance}
              rate={rate}
            />
          </BalanceContainer>
          <DelegatedContainer>
            <h2>Delegations</h2>
            {delegationsSupported ? (
              <BalanceBlock
                token={primaryToken}
                balance={delegationsTotal}
                rate={rate}
              />
            ) : (
              <NoDelegations>Not supported yet!</NoDelegations>
            )}
          </DelegatedContainer>
        </SubValuesContainer>
      </ValuesContainer>
    </Container>
  )
}

interface Props {
  isActive: boolean,
  className?: string,
}

const Overview: React.FunctionComponent<Props> = ({ isActive }) => {
  if (!isActive) {
    return null
  }

  return (
    <GlobalConsumer>
      {({ network }: GlobalContextValue) => (
        <AccountConsumer>
          {(props: AccountContextValue) => (
            (network && props.account) ? (
              <OverviewData {...props} account={props.account!} network={network!} />
            ) : <LoadingIcon />
          )}
        </AccountConsumer>
      )}
    </GlobalConsumer>
  )
}

export default Overview