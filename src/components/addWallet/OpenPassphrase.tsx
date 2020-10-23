import React, { useState, useEffect } from 'react'
import styled from '@emotion/styled'
import { flex } from 'emotion-styled-utils'

import ResolvedAccount from './ResolvedAccount'
import TextArea from '../TextArea'
import { deriveAccountFromMnemonic } from '../../utils/erdWallet'

const Container = styled.div`
  ${flex({ direction: 'column', justify: 'center', align: 'center' })}
`

const StyledTextArea = styled(TextArea)`
  height: 140px;
  width: 400px;
`

const StyledResolvedAccount = styled(ResolvedAccount)`
  margin-top: 2rem;
  max-width: 400px;
`

interface Props {
  renderSuccess: Function
}

const OpenPassphrase: React.FunctionComponent<Props> = ({ renderSuccess }) => {
  const [account, setAccount] = useState<any>()
  const [value, setValue] = useState('')

  useEffect(() => {
    const checkTimer = setTimeout(() => {
      if (value) {
        const account = deriveAccountFromMnemonic(value)
        if (account) {
          setAccount(account)
          return
        }
      }

      setAccount(undefined)
    }, 250)

    return () => clearTimeout(checkTimer)
  }, [ value ])

  return (
    <Container>
      <h2>Enter seed phrase below</h2>
      <StyledTextArea
        placeholder="Enter seed phrase here..."
        value={value}
        onChange={setValue}
      />
      <StyledResolvedAccount account={account} />
      {account ? renderSuccess(account) : null}
    </Container>
  )
}

export default OpenPassphrase