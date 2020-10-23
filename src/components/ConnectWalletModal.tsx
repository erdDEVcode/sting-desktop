import React, { useMemo, useCallback } from 'react'
import styled from '@emotion/styled'
import { flex } from 'emotion-styled-utils'

import Modal from './Modal'
import ValueBox from './ValueBox'
import Button from './Button'
import { Dapp } from '../types/all'

const StyledModal = styled(Modal)`
  background-color: ${(p: any) => p.theme.aboutModal.bgColor};
  color: ${(p: any) => p.theme.aboutModal.textColor};
`

const Container = styled.div`
  ${flex({ direction: 'column', justify: 'space-around', align: 'center' })};
  padding: 2rem;
`

const DappInfo = styled(ValueBox)`
  font-size: 1.2rem;
  word-break: break-all;
  text-align: center;
`

const DappTitle = styled.p``
const DappId = styled.p`
  ${(p: any) => p.theme.font('body', 'normal', 'italic')};
  font-size: 70%;
  margin-top: 1rem;
`

const Text = styled.p`
  ${(p: any) => p.theme.font('body', 'normal')};
  font-size: 1.3rem;
  margin: 2rem 0;
`

const AllowButton = styled(Button)`
  margin: 3rem 0 1rem;
`

const Footnote = styled.div`
  ${(p: any) => p.theme.font('body', 'normal', 'italic')};
  color: ${(p: any) => p.theme.connectWalletModal.footnote.textColor};
  font-size: 0.7rem;
`

interface Props {
  isOpen: boolean,
  address?: string,
  onAllow?: Function,
  onDisallow?: Function,
  dapp?: Dapp,
}

const ConnectWalletModal: React.FunctionComponent<Props> = ({ isOpen, onAllow, onDisallow, dapp }) => {
  const allow = useCallback(() => {
    if (onAllow) {
      onAllow() 
    }
  }, [ onAllow ])

  const disallow = useCallback(() => {
    if (onDisallow) {
      onDisallow()
    }
  }, [onDisallow])

  return (
    <StyledModal isOpen={isOpen} width='640px' height='430px' onRequestClose={disallow}>
      <Container>
        <Text>This dapp would like to see your wallet</Text>
        <DappInfo>
          {dapp?.title ? <DappTitle>{dapp.title}</DappTitle> : null}
          <DappId>{dapp?.id}</DappId>
        </DappInfo>
        <AllowButton onClick={allow}>Allow</AllowButton>
        <Footnote>(You can disallow disallow this later via browser settings)</Footnote>
      </Container>
    </StyledModal>
  )
}

export default ConnectWalletModal
