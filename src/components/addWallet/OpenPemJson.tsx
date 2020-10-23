import React, { useCallback, useState, useEffect } from 'react'
import styled from '@emotion/styled'
import { flex } from 'emotion-styled-utils'

import ResolvedAccount from './ResolvedAccount'
import TextArea from '../TextArea'
import TextInput from '../TextInput'
import FileInput from '../FileInput'
import { deriveAccountFromJsonKeyFileString, deriveAccountFromPemFileString } from '../../utils/erdWallet'
import { isJson } from '../../utils/string'

const Container = styled.div`
  ${flex({ direction: 'column', justify: 'center', align: 'center' })}
`

const StyledTextArea = styled(TextArea)`
  height: 80px;
  width: 400px;
`

const PasswordInput = styled(TextInput)`
  margin-top: 1rem;
`

const StyledResolvedAccount = styled(ResolvedAccount)`
  margin-top: 2rem;
  max-width: 400px;
`

const StyledFileInput = styled(FileInput)`
  margin-bottom: 1rem;
`

const Label = styled.label`
  display: block;
  margin-top: 1.5rem;
  ${(p: any) => p.theme.font('header')};
`

interface Props {
  renderSuccess: Function
}

const OpenPemJson: React.FunctionComponent<Props> = ({ renderSuccess }) => {
  const [account, setAccount] = useState<any>()
  const [value, setValue] = useState<string>('')
  const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false)
  const [password, setPassword] = useState<string>('')

  const updateValue = useCallback(txt => {
    setValue(txt)
    setPassword('')
    setShowPasswordInput(isJson(txt))
  }, [])

  useEffect(() => {
    const checkTimer = setTimeout(() => {
      if (value) {
        let account

        try {
          if (isJson(value)) {
            account = deriveAccountFromJsonKeyFileString(value, password)
          } else {
            account = deriveAccountFromPemFileString(value)
          }
        } catch (err) {
          // not valid
        }

        if (account) {
          setAccount(account)
          return
        }
      }

      setAccount(undefined)
    }, 250)

    return () => clearTimeout(checkTimer)
  }, [ value, password ])

  return (
    <Container>
      <StyledFileInput
        buttonContent='Open JSON or PEM file'
        accept=".json, .pem"
        onLoad={updateValue}
      />
      <StyledTextArea
        placeholder="Paste JSON or PEM contents here..."
        value={value}
        onChange={updateValue}
        rows={7}
      />
      {showPasswordInput ? (
        <React.Fragment>
          <Label>Enter password:</Label>
          <PasswordInput type="password" value={password} onChange={setPassword} placeholder="Password..." />
        </React.Fragment>
      ) : null}
      <StyledResolvedAccount account={account} />
      {account ? renderSuccess(account) : null}
    </Container>
  )
}

export default OpenPemJson