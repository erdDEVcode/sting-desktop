import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from '@emotion/styled'

import { Wallet, Balances, Delegation, Rates, Network, Transaction, Provider } from '../../types/all'
import {
  ChainConsumer,
  GlobalConsumer,
  GlobalContextValue,
  WalletConsumer,
  WalletContextValue,
} from '../../contexts'
import {
  AssetValue,
  AssetValueNumberStyle,
  isValidGasLimit,
  isValidGasPrice,
  isValidValue,
} from '../../utils/number'
import LoadingIcon from '../LoadingIcon'
import SlidingPanels from '../SlidingPanels'
import PreviewForm from './PreviewForm'
import ConfirmForm from './ConfirmForm'
import CompletedForm from './CompletedForm'
import { signTx } from '../../utils/erdWallet'
import { DisplayOptions } from './interfaces'

const Container = styled.div`
  background-color: ${(p: any) => p.theme.content.bgColor};
  color: ${(p: any) => p.theme.content.textColor};
  padding: 2rem;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
`

const StyledConfirmForm = styled(ConfirmForm)`
  padding: 4rem 2rem 0;
`

interface SendInitialValues {
  panel ?: number,
  toValue ?: string,
  cryptoValue ?: string,
  dataValue ?: string,
  gasPriceValue ?: string,
  gasLimitValue ?: string,
}

interface SendFormProps {
  network: Network,
  provider: Provider,
  wallet: Wallet,
  balances: Balances,
  delegation?: Delegation,
  rates: Rates,
  className?: string,
  onError?: (err: any) => {},
  onComplete?: (txHash: string) => {},
  initialValues?: SendInitialValues,
  displayOptions?: DisplayOptions,
}

const SendForm: React.FunctionComponent<SendFormProps> = ({
  className, provider, wallet, network, balances, rates, initialValues, onComplete, displayOptions,
}) => {
  const primaryToken = useMemo(() => network.endpoint.primaryToken, [network])

  const [ txId, setTxId ] = useState('')
  const [activePanel, setActivePanel] = useState(displayOptions?.skipPreview ? 1 : 0)
  const [toValue, setToValue] = useState('')
  const [dataValue, setDataValue] = useState('')
  const [cryptoValue, setCryptoValue] = useState('')
  const [ fiatValue, setFiatValue ] = useState('')
  const [valueError, setValueError] = useState('')
  const [gasPriceValue, setGasPriceValue] = useState('')
  const [gasLimitValue, setGasLimitValue] = useState('')
  const [ totalGasValue, setTotalGasValue ] = useState('')
  const [ totalGasCurrencyValue, setTotalGasCurrencyValue ] = useState('')
  const [ totalValue, setTotalValue ] = useState('')
  const [ totalCurrencyValue, setTotalCurrencyValue ] = useState('')
  const [totalError, setTotalError] = useState('')

  const minValue = useMemo(() => {
    return displayOptions?.minValue
  }, [displayOptions])

  const minValueString = useMemo(() => {
    return minValue ? AssetValue.fromTokenAmount(network.endpoint.primaryToken, minValue).toString({
      showSymbol: true,
      numberStyle: AssetValueNumberStyle.RAW_SCALED
    }) : ''
  }, [minValue, network.endpoint.primaryToken])

  const balanceDec = useMemo(() => {
    if (balances[primaryToken]) {
      return AssetValue.fromBalance(balances[primaryToken])
    } else {
      return null
    }
  }, [balances, primaryToken])

  const rate = useMemo(() => {
    const r = rates[primaryToken]
    return (r && !Number.isNaN(r.value)) ? r : null
  }, [rates, primaryToken])

  const gasCostDec = useMemo(() => {
    if (isValidGasPrice(gasPriceValue) && isValidGasLimit(gasLimitValue)) {
      return AssetValue.fromTokenScaledAmount(primaryToken, gasPriceValue).mul(gasLimitValue)
    } else {
      return null
    }
  }, [gasPriceValue, gasLimitValue, primaryToken ])

  const transferValueDec = useMemo(() => {
    if (isValidValue(cryptoValue)) {
      return AssetValue.fromTokenScaledAmount(primaryToken, cryptoValue)
    } else {
      return null
    }
  }, [cryptoValue, primaryToken])

  const gasPriceValueDec = useMemo(() => {
    if (isValidGasPrice(gasPriceValue)) {
      return AssetValue.fromTokenScaledAmount(primaryToken, gasPriceValue)
    } else {
      return null
    }
  }, [gasPriceValue, primaryToken])

  const showPreview = useCallback(() => {
    setActivePanel(0)
  }, [])

  const showConfirmation = useCallback(() => {
    setActivePanel(1)
  }, [])

  const showCompleted = useCallback(() => {
    setActivePanel(2)
  }, [])

  const resetGasLimit = useCallback(() => {
    setGasLimitValue(initialValues?.gasLimitValue || `${network.config?.minGasLimit}`)
  }, [initialValues, network])

  const resetGasPrice = useCallback(() => {
    setGasPriceValue(
      AssetValue.fromTokenAmount(primaryToken, initialValues?.gasPriceValue || network.config?.minGasPrice).toString({ numberStyle: AssetValueNumberStyle.RAW_SCALED })
    )
  }, [ initialValues, primaryToken, network])

  const onLoad = useCallback(() => {
    setTxId('')
    setToValue(initialValues?.toValue || '')
    setDataValue(initialValues?.dataValue || '')
    setCryptoValue(initialValues?.cryptoValue || '')
    setValueError('')
    setFiatValue('')
    resetGasPrice()
    resetGasLimit()
    setTotalGasValue('')
    setTotalGasCurrencyValue('')
    setTotalValue('')
    setTotalCurrencyValue('')
    setTotalError('')
  }, [initialValues, resetGasLimit, resetGasPrice])

  // setup initial values on load
  useEffect(() => {
    onLoad()
  }, [onLoad])

  // reset to start phase
  const onReset = useCallback(() => {
    showPreview()
    onLoad()
  }, [onLoad, showPreview])

  const send = useCallback(async (tx: Transaction) => {
    if (wallet && network && network.config) {
      const signedTx = await signTx(wallet, network, tx)

      const { hash } = await provider.sendSignedTransaction(signedTx)

      setTxId(hash)

      if (!displayOptions?.skipCompleted) {
        showCompleted()
      }

      if (onComplete) {
        onComplete(hash)
      }
    } else {
      throw new Error('Wallet and/or network not available')
    }
  }, [wallet, network, provider, displayOptions, onComplete, showCompleted])

  const props = {
    txId,
    wallet,
    primaryToken,
    gasPerDataByte: network.config?.gasPerDataByte,
    minGasLimit: network.config?.minGasLimit,
    minGasPrice: network.config?.minGasPrice,
    fromValue: wallet.address(),
    toValue, setToValue,
    balanceDec, gasCostDec, transferValueDec,
    minValue, minValueString,
    cryptoValue, setCryptoValue,
    valueError, setValueError,
    fiatValue, setFiatValue,
    dataValue, setDataValue,
    rate,
    gasLimitValue, setGasLimitValue, resetGasLimit,
    gasPriceValue, setGasPriceValue, resetGasPrice,
    gasPriceValueDec,
    totalGasValue, setTotalGasValue,
    totalGasCurrencyValue, setTotalGasCurrencyValue,
    totalValue, setTotalValue,
    totalCurrencyValue, setTotalCurrencyValue,
    totalError, setTotalError,
  }

  return (
    <Container className={className}>
      <SlidingPanels active={activePanel}>
        <PreviewForm props={props} displayOptions={displayOptions} onNext={showConfirmation} />
        <StyledConfirmForm props={props} displayOptions={displayOptions} onPrevious={showPreview} onSend={send} />
        <CompletedForm props={props} onReset={onReset} />
      </SlidingPanels>
    </Container>
  )
}

export interface Props {
  isActive: boolean,
  className?: string,
  onComplete?: (txHash: string) => {},
  initialValues?: SendInitialValues,
  displayOptions?: DisplayOptions,
}

const Send: React.FunctionComponent<Props> = ({ isActive, className, onComplete, initialValues, displayOptions }) => {
  if (!isActive) {
    return null
  }

  return (
    <GlobalConsumer>
      {({ network }: GlobalContextValue) => (
        <WalletConsumer>
          {(props: WalletContextValue) => (
            (props.wallet && network) ? (
              <ChainConsumer>
                {(provider: Provider) => (
                  <SendForm
                    {...props}
                    wallet={props.wallet!}
                    network={network!}
                    provider={provider}
                    className={className}
                    onComplete={onComplete}
                    initialValues={initialValues}
                    displayOptions={displayOptions}
                  />
                )}
              </ChainConsumer>
            ) : <LoadingIcon />
          )}
        </WalletConsumer>
      )}
    </GlobalConsumer>
  )
}

export default Send