import { format } from 'date-fns'
import React, { useCallback, useState, useEffect } from 'react'
import styled from '@emotion/styled'
import { flex } from 'emotion-styled-utils'

import ResolvedWallet from './ResolvedWallet'
import Button from '../Button'
import IconButton from '../IconButton'
import TextInput from '../TextInput'
import { generateMnemonic, deriveWalletFromMnemonic } from '../../utils/erdWallet'

const Container = styled.div`
  ${flex({ direction: 'column', justify: 'center', align: 'center' })}
`

const Mnemonic = styled.div`
  ${(p: any) => p.theme.font('data')};
  padding: 2rem;
  border: 1px dashed ${(p: any) => p.theme.createPassphrase.mnemonic.borderColor};
  border-radius: 10px;
  line-height: 1.4em;
  width: 80%;
  position: relative;
`

const RefreshButton = styled(IconButton)`
  font-size: 0.6rem;
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
`

const StyledResolvedWallet = styled(ResolvedWallet)`
  margin-top: 2rem;
  max-width: 400px;
`

const TestButton = styled(Button)`
  margin-top: 1rem;
`

const TestInstructions = styled.p`
  margin-bottom: 1rem;

  em {
    font-weight: bolder;
    font-size: 1.3em;
    padding: 0 0.1rem;
  }
`

const Words = styled.div`
  ${flex({ direction: 'row', justify: 'center', align: 'center' })};
  flex: 0;
`

const WordInput = styled(TextInput)`
  margin: 0 0.5rem;
  width: 150px;
`

const TryAgainButton = styled(Button)`
  margin-top: 1rem;
  font-size: 0.8rem;
`

interface Props {
  renderSuccess: Function
}

const istr = (n: number): string => {
  return format(new Date(2000, 1, n), 'do')
}

const CreatePassphrase: React.FunctionComponent<Props> = ({ renderSuccess }) => {
  const [words, setWords] = useState<string[]>([])
  const [testMode, setTestMode] = useState<number[]>([])
  const [wallet, setWallet] = useState<any>()
  const [mnemonic, setMnemonic] = useState<string[]>(generateMnemonic())

  const generate = useCallback(() => {
    setMnemonic(generateMnemonic())
  }, [])

  const testUser = useCallback(() => {
    const testMode: number[] = []

    while (testMode.length < 3) {
      const a = (~~(Math.random() * 23) + 1)
      if (!testMode.includes(a)) {
        testMode.push(a)
      }
    }

    testMode.sort((a, b) => a < b ? -1 : 1)

    setWords([])
    setTestMode(testMode)
  }, [])

  const onChangeWord = useCallback((i: number, v: string) => {
    words.splice(i, 1, v)
    setWords(words.slice(0))
  }, [ words ])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (testMode.length && words.length === 3) {
        // all good?
        let allOk = true
        for (let i = 0; 3 > i; i++) {
          allOk = allOk && (words[i] === mnemonic[testMode[i] - 1])
        }

        if (allOk) {
          const account = deriveWalletFromMnemonic(mnemonic.join(' '))
          if (account) {
            setWallet(account)
            return
          }
        }
      }

      setWallet(undefined)
    }, 250)

    return () => clearTimeout(timer)
  }, [ words, testMode, mnemonic ])

  const tryAgain = useCallback(() => {
    setWords([])
    setTestMode([])
    generate()
  }, [ generate ])

  return (
    <Container>
      {(testMode.length === 3) ? (
        <React.Fragment>
          <TestInstructions>
            Enter the <em>{istr(testMode[0])}</em>, <em>{istr(testMode[1])}</em> and <em>{istr(testMode[2])}</em> words:
          </TestInstructions>
          <Words>
            {[0, 1, 2].map(i => (
              <WordInput key={i} onChange={v => onChangeWord(i, v)} placeholder={`${istr(testMode[i])} word...`} />
            ))}
          </Words>
          {wallet ? null : (
            <TryAgainButton onClick={tryAgain} icon='undo'>Try again</TryAgainButton>
          )}
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Mnemonic>
            {mnemonic.join(' ')}
            <RefreshButton title='Re-generate' onClick={generate} icon='refresh' />
          </Mnemonic>
          <TestButton onClick={testUser}>I have written this down offline</TestButton>
        </React.Fragment>
      )}
      <StyledResolvedWallet wallet={wallet} />
      {wallet ? renderSuccess(wallet) : null}
    </Container>
  )
}

export default CreatePassphrase