import React from 'react'
import styled from '@emotion/styled'

import Modal from './Modal'
import AddWallet from './AddWallet'

const HEIGHT = '640px'

const StyledModal = styled(Modal)`
`

interface Props {
  className?: string
  onRequestClose?: () => void,
  onComplete?: () => void,
}

const AddWalletModal: React.FunctionComponent<Props> = ({ onRequestClose, ...props }) => {
  return (
    <StyledModal isOpen={true} width='640px' height={HEIGHT} onRequestClose={onRequestClose}>
      <AddWallet {...props }/>
    </StyledModal>
  )
}

export default AddWalletModal

