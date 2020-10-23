import React from 'react'
import styled from '@emotion/styled'

import { Account } from '../../types/all'
import ValueBox from '../ValueBox'

const Container = styled(ValueBox)`
`

const Text = styled.div`
  font-size: 1.1rem;
  word-break: break-all;

  label {
    ${(p: any) => p.theme.font('body', 'light')};
    display: block;
    font-style: italic;
    font-size: 70%;
    margin-right: 0.2em;
  }
`

interface Props {
  account?: Account,
  className?: string,
}

const ResolvedAccount: React.FunctionComponent<Props> = ({ account, className }) => {
  return account ? (
    <Container className={className}>
      <Text><label>Address:</label> {account.address()}</Text>
    </Container>
  ) : null
}


export default ResolvedAccount