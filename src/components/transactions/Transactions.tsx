import React from 'react'
import styled from '@emotion/styled'
import { flex } from 'emotion-styled-utils'

import { Network, Wallet, TransactionsResult } from '../../types/all'
import {
  GlobalConsumer,
  GlobalContextValue,
  WalletConsumer,
  WalletContextValue,
} from '../../contexts'
import LoadingIcon from '../LoadingIcon'
import TransactionList from './TransactionList'

const Container = styled.div`
  ${flex({ direction: 'column', justify: 'flex-start', align: 'stretch' })};
  background-color: ${(p: any) => p.theme.content.bgColor};
  color: ${(p: any) => p.theme.content.textColor};
  height: 100%;
  width: 100%;
`

const TransactionListLoadingIcon = styled(LoadingIcon)`
  font-size: 4rem;
  padding: 1rem;
`

interface DataProps {
  wallet: Wallet,
  network: Network,
  transactionsResult?: TransactionsResult,
  fetchTransactions: () => Promise<any>,
}

const OverviewData: React.FunctionComponent<DataProps> = props => {
  const { transactionsResult, wallet, network } = props

  return (
    <Container>
      {transactionsResult
        ? <TransactionList
            network={network}
            wallet={wallet}
            data={transactionsResult}
          />
        : <TransactionListLoadingIcon />
      }
    </Container>
  )
}

interface Props {
  isActive: boolean,
}

const Overview: React.FunctionComponent<Props> = ({ isActive }) => {
  if (!isActive) {
    return null
  }
  
  return (
    <GlobalConsumer>
      {({ network }: GlobalContextValue) => (
        <WalletConsumer>
          {(props: WalletContextValue) => (
            props.wallet ? (
              <OverviewData
                {...props}
                network={network!}
                wallet={props.wallet!}
              />
            ) : <LoadingIcon />
          )}
        </WalletConsumer>
      )}
    </GlobalConsumer>
  )
}

export default Overview