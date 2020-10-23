import React from 'react'

import Send, { Props as SendProps } from './send/Send'
import Modal from './Modal'

const DUMMY_CLOSE = () => {}

interface Props extends SendProps {
  onRequestClose?: () => {},
}

const SendModal: React.FunctionComponent<Props> = ({ onRequestClose, ...props }) => {
  return (
    <Modal isOpen={props.isActive} width='640px' height={'600px'} onRequestClose={onRequestClose || DUMMY_CLOSE}>
      <Send {...props} />
    </Modal>
  )
}

export default SendModal
