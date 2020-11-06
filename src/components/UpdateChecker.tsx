import React, { useCallback, useState, useEffect } from 'react'
import styled from '@emotion/styled'

import { version } from '../../package.json'
import { timeAgo } from '../utils/date'
import { openExternalUrl } from '../utils/ipc'
import Modal from './Modal'
import Button from './Button'
import { useUpdates } from '../hooks'
import { WalletConsumer, WalletContextValue } from '../contexts'
import Markdown from './Markdown'

const HEIGHT = '640px'

const StyledModal = styled(Modal)`
`

const Container = styled.div`
  padding: 2rem;
  overflow-y: scroll;
  height: 100%;

  h1 {
    margin: 0 0 2rem;
  }

  p {
    margin: 0.5rem 0;

    strong {
      ${(p: any) => p.theme.font('body', 'bold')};
    }

    em {
      ${(p: any) => p.theme.font('body', 'normal', 'italic')};
    }
  }
`

const DownloadButton = styled(Button)`
  margin: 1rem 0 2rem;
`

const Changelog = styled(Markdown)`
`

const UpdateCheckerModal: React.FunctionComponent = () => {
  const { latestRelease } = useUpdates()
  const [ showModal, setShowModal ] = useState(false)

  useEffect(() => {
    setShowModal(!!latestRelease)
  }, [ latestRelease ])

  const onRequestClose = useCallback(() => {
    setShowModal(false)
  }, [])

  const download = useCallback(() => {
    if (latestRelease) {
      openExternalUrl('https://sting.erd.dev')
    }
  }, [ latestRelease ])

  return (
    <StyledModal isOpen={showModal} width='640px' height={HEIGHT} onRequestClose={onRequestClose}>
      {latestRelease ? (
        <Container>
          <h1>A new version is available!</h1>
          <p>Your version: <strong>{version}</strong></p>
          <p>Latest version: <strong>{latestRelease.version}</strong> <em>(published {timeAgo(latestRelease.published)} ago)</em></p>
          <DownloadButton onClick={download}>Download</DownloadButton>
          <Changelog>{latestRelease.changelog}</Changelog>
        </Container>
      ) : null}
    </StyledModal>
  )
}

const UpdateChecker: React.FunctionComponent = () => {
  return (
    <WalletConsumer>
      {(props: WalletContextValue) => (
        (props.wallet) ? (
          <UpdateCheckerModal />
        ) : null
      )}
    </WalletConsumer>
  )
}


export default UpdateChecker

