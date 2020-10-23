import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from '@emotion/styled'

import { Account, Balances, Delegation, Rates, NewTransaction, Network } from '../../types/all'
import {
  GlobalConsumer,
  GlobalContextValue,
  AccountConsumer,
  AccountContextValue,
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
import { signAndSendTx } from '../../utils/erdWallet'

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
  account: Account,
  balances: Balances,
  delegation?: Delegation,
  rates: Rates,
  className?: string,
  onComplete?: () => {},
  initialValues?: SendInitialValues,
}

const SendForm: React.FunctionComponent<SendFormProps> = ({
  className, account, network, balances, rates, initialValues, onComplete,
}) => {
  const primaryToken = useMemo(() => network.endpoint.primaryToken, [network])

  const [ txId, setTxId ] = useState('')
  const [activePanel, setActivePanel] = useState(0)
  const [toValue, setToValue] = useState('')
  const [dataValue, setDataValue] = useState('')
  const [cryptoValue, setCryptoValue] = useState('')
  const [ fiatValue, setFiatValue ] = useState('')
  const [gasPriceValue, setGasPriceValue] = useState('')
  const [gasLimitValue, setGasLimitValue] = useState('')
  const [ totalGasValue, setTotalGasValue ] = useState('')
  const [ totalGasCurrencyValue, setTotalGasCurrencyValue ] = useState('')
  const [ totalValue, setTotalValue ] = useState('')
  const [ totalCurrencyValue, setTotalCurrencyValue ] = useState('')
  const [totalError, setTotalError] = useState('')

  const balanceDec = useMemo(() => {
    if (balances[primaryToken]) {
      return AssetValue.fromBalance(balances[primaryToken])
    } else {
      return null
    }
  }, [balances, primaryToken])

  const rate = useMemo(() => {
    const r = rates[primaryToken]
    return (r && !Number.isNaN(r.value)) ? r : undefined
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

  const resetGasLimit = useCallback(() => {
    setGasLimitValue(initialValues?.gasLimitValue || `${network.config?.gasMinLimit}`)
  }, [initialValues, network])

  const resetGasPrice = useCallback(() => {
    setGasPriceValue(
      initialValues?.gasPriceValue
      || AssetValue.fromTokenAmount(primaryToken, network.config?.gasMinPrice).toString({ numberStyle: AssetValueNumberStyle.RAW_SCALED })
    )
  }, [ initialValues, primaryToken, network])

  const onReset = useCallback(() => {
    setTxId('')
    setToValue(initialValues?.toValue || '')
    setDataValue(initialValues?.dataValue || '')
    setCryptoValue(initialValues?.cryptoValue || '')
    setFiatValue('')
    resetGasPrice()
    resetGasLimit()
    setTotalGasValue('')
    setTotalGasCurrencyValue('')
    setTotalValue('')
    setTotalCurrencyValue('')
    setTotalError('')
    setActivePanel(0)
  }, [ initialValues, resetGasLimit, resetGasPrice ])

  // setup initial values on load
  useEffect(() => {
    onReset()
  }, [ onReset ])

  const send = useCallback(async (tx: NewTransaction) => {
    if (account && network && network.config) {
      setTxId(await signAndSendTx(account, network, tx))
    } else {
      throw new Error('Account and/or network not available')
    }
    setActivePanel(2)
  }, [ account, network ])

  const props = {
    txId,
    account,
    primaryToken,
    gasPerDataByte: network.config?.gasPerDataByte,
    gasMinLimit: network.config?.gasMinLimit,
    gasMinPrice: network.config?.gasMinPrice,
    fromValue: account.address(),
    toValue, setToValue,
    balanceDec, gasCostDec, transferValueDec,
    cryptoValue, setCryptoValue,
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
        <PreviewForm props={props} onNext={showConfirmation} />
        <StyledConfirmForm props={props} onPrevious={showPreview} onSend={send} />
        <CompletedForm props={props} onReset={onReset} />
      </SlidingPanels>
    </Container>
  )
}

export interface Props {
  isActive: boolean,
  className?: string,
  onComplete?: () => {},
  initialValues?: SendInitialValues,
}

const Send: React.FunctionComponent<Props> = ({ isActive, className, onComplete, initialValues }) => {
  if (!isActive) {
    return null
  }

  return (
    <GlobalConsumer>
      {({ network }: GlobalContextValue) => (
        <AccountConsumer>
          {(props: AccountContextValue) => (
            (props.account && network) ? (
              <SendForm
                {...props}
                account={props.account!}
                network={network!}
                className={className}
                onComplete={onComplete}
                initialValues={initialValues}
              />
            ) : <LoadingIcon />
          )}
        </AccountConsumer>
      )}
    </GlobalConsumer>
  )
}

export default Send