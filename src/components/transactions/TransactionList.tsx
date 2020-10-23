import React, { useMemo, useState, useCallback } from 'react'
import styled from '@emotion/styled'
import { flex } from 'emotion-styled-utils'

import { PROTOCOL } from '../../common/constants/app'
import { Network, Account, TransactionsResult, Transaction } from '../../types/all'
import Icon from '../Icon'
import TokenValueStatic from '../TokenValueStatic'
import TransactionDetails from './TransactionDetails'
import Button from '../Button'
import ErrorBox from '../ErrorBox'
import { ViewTransactionInExplorer, ViewAddressInExplorer, ViewInExplorerContext } from '../ViewInExplorer'
import { timeAgo } from '../../utils/date'
import LoadingIcon from '../LoadingIcon'

const Container = styled.ul`
  display: block;
  align-self: stretch;
  ${flex({ direction: 'column', justify: 'flex-start', align: 'stretch' })};
`

const ItemContainer = styled.li`
  border-top: 1px solid ${(p: any) => p.theme.transactionItem.borderColor};
`

const NoItemContainer = styled(ItemContainer)`
  text-align: center;
  font-size: 1rem;
  padding: 2rem;
`

const Summary = styled.div`
  ${flex({ direction: 'row', justify: 'space-between', align: 'center' })};
  padding: 2rem;

  &:hover {
    background-color: ${(p: any) => p.theme.transactionItem.hover.bgColor};
  }
`

const SummaryLeft = styled.div`
  ${flex({ direction: 'row', justify: 'flex-start', align: 'stretch' })};
`

const SummaryRight = styled.div`
  ${flex({ direction: 'row', justify: 'flex-end', align: 'stretch' })};
`

const MainIcon = styled.div`
  font-size: 2rem;
  color: ${(p: any) => p.theme.transactionItem.type[p.type].textColor};
`

const SummaryMeta = styled.div`
  margin-left: 1rem;
`

const Subject = styled.p`
  font-size: 1rem;
`
const Prefix = styled.span`
  ${(p: any) => p.theme.font('body', 'bold')};
  font-size: 70%;
`
const Description = styled.p`
  ${(p: any) => p.theme.font('body', 'normal', 'italic')}
  font-size: 0.9rem;
  color: ${(p: any) => p.theme.transactionItem.description.textColor};
  margin-top: 0.5rem;
`

const StyledTokenValueStatic = styled(TokenValueStatic)`
  font-size: 1.2rem;
  color: ${(p: any) => p.theme.transactionItem.type[p.type].textColor};
`

const DetailsBar = styled.div`
  ${flex({ direction: 'column', justify: 'center', align: 'center' })};
  position: relative;
  background-color: ${(p: any) => p.theme.transactionItem.details.bgColor};
`

const DetailsBarIcon = styled(Icon)`
  font-size: 2rem;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  color: 1px dashed ${(p: any) => p.theme.transactionItem.details.borderColor};
`

const StyledTransactionDetails = styled(TransactionDetails)`
  border-top: 1px dashed ${(p: any) => p.theme.transactionItem.details.borderColor};
  margin: 0 2rem;
  padding: 2rem 0;
  font-size: 0.9rem;
`

const ViewInExplorerButton = styled(Button)`
  margin-bottom: 1rem;
`

const LastItemContainer = styled(ItemContainer)`
  ${flex({ direction: 'column', justify: 'center', align: 'center' })};
  padding: 1rem;
`

const FailedBox = styled(ErrorBox)`
  display: inline-block;
  min-width: 15em;
`


interface ItemProps {
  network: Network,
  account: Account,
  tx: Transaction
}

const Item: React.FunctionComponent<ItemProps> = ({ tx, account, network }) => {
  const [ expanded, setExpanded ] = useState(false)
  const { id, receiver, sender, status, timestamp, value } = tx

  const primaryToken = useMemo(() => network.endpoint.primaryToken, [network])

  const when = useMemo(() => timeAgo(timestamp), [ timestamp ])

  const accountAddress = useMemo(() => {
    return account.address()
  }, [ account ])

  const isStakePayment = useMemo(() => (
    `${sender}` === `${PROTOCOL.META_SHARD_ID}` && receiver === accountAddress
  ), [sender, receiver, accountAddress ])

  const isOutbound = useMemo(() => (
    sender === account.address()
  ), [ sender, account ])

  const isContractCall = useMemo(() => false/*isOutbound && !!data*/, [/*data, isOutbound*/])

  const isFailed = useMemo(() => (status !== 1 && status !== 2), [ status ])
  const isPending = useMemo(() => (status == 2), [status])

  const { prefix, subject, icon, description, type } = useMemo(() => {
    let ret

    if (isContractCall) {
      ret = {
        prefix: 'To',
        subject: receiver,
        icon: 'code',
        description: `${isPending ? 'Calling' : 'Called'} smart contract function`,
        type: 'contract',
      }
    } else if (isStakePayment) {
      ret = {
        prefix: 'From',
        subject: 'Metashard',
        icon: 'receiveArrow',
        description: `${isPending ? 'Receiving' : 'Received'} staking payment`,
        type: 'earn',
      }
    } else if (isOutbound) {
      ret = {
        prefix: 'To',
        subject: receiver,
        icon: 'sendArrow',
        description: `${isPending ? 'Sending' : 'Sent'} assets`,
        type: 'send',
      }
    } else {
      ret = {
        prefix: 'From',
        subject: sender,
        icon: 'receiveArrow',
        description: `${isPending ? 'Receiving' : 'Received'} assets`,
        type: 'receive',
      }
    }

    if (isFailed) {
      ret.type = 'failed'
    }

    return ret
  }, [isStakePayment, isOutbound, isContractCall, isFailed, isPending, sender, receiver ])

  const finalValueStr = useMemo(() => {
    return value || '0'
  }, [ value ])

  const valueSign = useMemo(() => {
    return isOutbound ? '- ' : '+ '
  }, [isOutbound ])

  const toggle = useCallback(() => {
    setExpanded(!expanded)
  }, [ expanded ])

  return (
    <ItemContainer>
      <Summary onClick={toggle}>
        <SummaryLeft>
          <MainIcon title={description} type={type}>
            {isPending ? <LoadingIcon /> : <Icon name={icon} />}
          </MainIcon>
          <SummaryMeta>
            <Subject>
              <Prefix>{prefix}:</Prefix> {subject}
            </Subject>
            <Description>- {description}{isPending ? null : ` ${when} ago`}</Description>
            {isFailed ? <FailedBox error='Transaction failed' /> : null}
          </SummaryMeta>
        </SummaryLeft>
        <SummaryRight>
          <StyledTokenValueStatic
            token={primaryToken}
            amount={finalValueStr}
            showSymbol={true}
            prefix={valueSign}
            type={type}
          />
        </SummaryRight>
      </Summary>
      {expanded ? (
        <DetailsBar>
          <StyledTransactionDetails tx={tx} />
          <DetailsBarIcon name='downChevron' />
          <ViewTransactionInExplorer id={id}>
            {({ onClick }: ViewInExplorerContext) => (
              <ViewInExplorerButton icon='open-external' onClick={onClick}>
                View in explorer
              </ViewInExplorerButton>
            )}
          </ViewTransactionInExplorer>
        </DetailsBar>
      ) : null}
    </ItemContainer>
  )
}

interface TransactionListProps {
  className?: string,
  account: Account,
  network: Network,
  data: TransactionsResult,
}

const TransactionList: React.FunctionComponent<TransactionListProps> = ({ className, data, account, network }) => {
  return (
    <Container className={className}>
      {data.transactions.length ? (
        <React.Fragment>
          {data.transactions.map(tx => (
            <Item key={tx.id} tx={tx} account={account} network={network} />
          ))}
          <LastItemContainer>
            <ViewAddressInExplorer address={account.address()}>
              {({ onClick }: ViewInExplorerContext) => (
                <Button onClick={onClick} icon='open-external'>View all transactions</Button>
              )}
            </ViewAddressInExplorer>
          </LastItemContainer>
        </React.Fragment>
      ) : (
        <NoItemContainer>No transactions yet ;)</NoItemContainer>
      )}
    </Container>
  )
}

export default TransactionList

