import React, { useMemo } from 'react'
import styled from '@emotion/styled'
import { flex } from 'emotion-styled-utils'

import { Transaction, TransactionOnChain } from '../../types/all'
import { formatDateIso } from '../../utils/date'
import { shortenHash } from '../../utils/address'

const Container = styled.div`
`

const Line = styled.div`
  margin-bottom: 0.5em;

  strong {
    display: inline-block;
    width: 10em;
    text-align: right;
    ${(p: any) => p.theme.font('body', 'bold')};
    margin-right: 2em;
    font-size: 80%;
  }

  span {
    ${(p: any) => p.theme.font('data')};
  }
`

const Columns = styled.div`
  ${flex({ direction: 'row', justify: 'center', align: 'stretch' })};
  margin-top: 2rem;
`

const Column = styled.div`
  font-size: 90%;
  margin-right: 1rem;

  &:last-of-type {
    margin-right: 0;
  }
`

interface Props {
  tx: TransactionOnChain,
  className?: string,
}

const TransactionDetails: React.FunctionComponent<Props> = ({ tx, className }) => {
  const when = useMemo(() => formatDateIso(tx.timestamp), [ tx.timestamp ])

  return (
    <Container className={className}>
      <Line>
        <strong>date:</strong><span>{when}</span>
      </Line>
      <Line>
        <strong>sender:</strong><span>{tx.sender}</span>
      </Line>
      <Line>
        <strong>receiver:</strong><span>{tx.receiver}</span>
      </Line>
      <Columns>
        <Column>
          <Line>
            <strong>fromShard:</strong><span>{tx.sourceShard}</span>
          </Line>
          <Line>
            <strong>toShard:</strong><span>{tx.destinationShard}</span>
          </Line>
          <Line>
            <strong>round:</strong><span>{tx.round}</span>
          </Line>
          <Line>
            <strong>nonce:</strong><span>{tx.nonce}</span>
          </Line>
        </Column>
        <Column>
          <Line>
            <strong>gasPrice:</strong><span>{tx.gasPrice}</span>
          </Line>
          <Line>
            <strong>gasLimit:</strong><span>{tx.gasLimit}</span>
          </Line>
          <Line>
            <strong>value:</strong><span>{tx.value}</span>
          </Line>
          <Line>
            <strong>data:</strong><span>{tx.data ? shortenHash(tx.data) : '(empty)'}</span>
          </Line>
        </Column>
        <Column>
          <Line>
            <strong>status:</strong><span>{tx.status}</span>
          </Line>
        </Column>
      </Columns>
    </Container>
  )
}

export default TransactionDetails