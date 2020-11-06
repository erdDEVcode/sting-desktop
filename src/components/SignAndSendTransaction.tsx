import React, { Component } from 'react'

import _ from '../utils/lodash'
import Modal from './Modal'
import Send from './send/Send'
import { Transaction } from '../types/all'
import { DisplayOptions } from './send/interfaces'

interface Props {
}

interface SendModalState {
  onRequestClose: () => {},
  onComplete: (txHash: string) => {},
  initialValues: object,
}

interface State {
  showSendModal?: SendModalState,
}

export interface SignAndSendTransactionInterface {
  execute: (tx: Transaction) => Promise<any>
}

export default class SignAndSendTransaction extends Component<Props> implements SignAndSendTransactionInterface {
  state: State = {}

  /* render */

  render () {
    const isActive = !!this.state.showSendModal
    const { onRequestClose, ...otherProps } = this.state.showSendModal || {}

    return (
      <Modal 
        isOpen={isActive} 
        width='800px' 
        height='700px'
        onRequestClose={onRequestClose}
      >
        <Send isActive={isActive} {...otherProps} />
      </Modal>
    )
  }

  async execute(tx: Transaction) {
    return new Promise((resolve, reject) => {
      let txHash: any = undefined

      this.setState({
        showSendModal: {
          onRequestClose: () => {
            this.setState({ showSendModal: null })
            if (txHash) {
              resolve(txHash)
            } else {
              reject(new Error('User cancelled the process'))
            }
          },
          onComplete: (_txHash: string) => {
            txHash = _txHash
            resolve(txHash)
          },
          initialValues: {
            toValue: tx.receiver,
            dataValue: tx.data,
            cryptoValue: tx.value,
            gasLimitValue: tx.gasLimit,
            gasPriceValue: tx.gasPrice,
          },
          displayOptions: (_.get(tx, 'meta.displayOptions') as DisplayOptions),
        }
      })
    }).finally(() => {
      this.setState({ showSendModal: null })
    })
  }
}