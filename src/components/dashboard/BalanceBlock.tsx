import React from 'react'
import styled from '@emotion/styled'
import { flex } from 'emotion-styled-utils'

import Data from '../../data'
import { Balance, Rate } from '../../types/all'
import BalanceValue from '../BalanceValue'
import BalanceCurrencyValue from '../BalanceCurrencyValue'

const Container = styled.div`
`

const RateInfo = styled.div`
  ${flex({ direction: 'row', justify: 'center', align: 'flex-end' })};
  margin-top: 1em;
  color: ${(p: any) => p.theme.overview.balanceRate.textColor};
`

const StyledBalanceValue = styled(BalanceValue)`
  display: block;
  font-size: 500%;
`

const StyledBalanceCurrencyValue = styled(BalanceCurrencyValue)`
  display: block;
  font-size: 130%;
`

const BalanceInfo = styled.div`
  ${flex({ direction: 'row', justify: 'center', align: 'flex-end' })};
`

const TokenSymbol = styled.span`
  ${(p: any) => p.theme.font('header')};
  padding-bottom: 1.5em;
  margin-right: 0.8em;
`

const CurrencySymbol = styled.span`
  ${(p: any) => p.theme.font('header')};
  text-transform: uppercase;
  padding-bottom: 0.1em;
  margin-right: 0.5em;
`

interface Props {
  className?: string,
  token: string,
  balance?: Balance,
  rate?: Rate,
}

const BalanceBlock: React.FunctionComponent<Props> = props => {
  const { className, token, balance, rate } = props

  return (
    <Container className={className}>
      <BalanceInfo>
        <TokenSymbol>{Data.getToken(token).symbol}</TokenSymbol>
        <StyledBalanceValue balance={balance} />
      </BalanceInfo>
      {Data.getToken(token).rateApiName ? (
        <RateInfo>
          <CurrencySymbol>{rate ? Data.getCurrency(rate.currency).symbol : null}</CurrencySymbol>
          <StyledBalanceCurrencyValue balance={balance} rate={rate} />
        </RateInfo>
      ) : null}
    </Container>
  )
}

export default BalanceBlock