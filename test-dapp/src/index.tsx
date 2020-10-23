import React, { useMemo, useEffect, useState, useCallback } from 'react'
import ReactDOM from 'react-dom'
import styled from '@emotion/styled'
import { ThemeProvider } from 'emotion-theming'
import * as erdjs from '@elrondnetwork/erdjs'

import Layout from './components/Layout'
import GlobalStyles from './components/GlobalStyles'
import { setupThemes } from './themes'

const themes = setupThemes()

const Row = styled.div`
  margin-bottom: 2rem;

  pre {
    font-family: monospace;
    font-size: 80%;
    padding: 1em;
  }
`

const Value = styled.pre`
  background-color: ${(p: any) => p.theme.pre.value.bgColor};
  color: ${(p: any) => p.theme.pre.value.textColor};
`

const ErrorValue = styled.pre`
  background-color: ${(p: any) => p.theme.pre.error.bgColor};
  color: ${(p: any) => p.theme.pre.error.textColor};
`

const NoValue = styled.pre`
  background-color: ${(p: any) => p.theme.pre.undetermined.bgColor};
  color: ${(p: any) => p.theme.pre.undetermined.textColor};
`

const ADDRESSES = {
  delegationContract: 'erd1qqqqqqqqqqqqqpgqxwakt2g7u9atsnr03gqcgmhcv38pt7mkd94q6shuwt',
  auctionContract: 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l',
}

type UseResultHook = [
  any,
  any,
  (v: any) => void,
  (v: any) => void,
]

function useResult<T> (initialValue?: T): UseResultHook {
  const [ value, setValue ] = useState<T | undefined>(initialValue)
  const [ error, setError ] = useState()
  return [ value, error, setValue, setError ]
}

const RenderValue = (p: any) => {
  const { value, error } = p

  let content

  if (value) {
    content = <Value>{JSON.stringify(value, null, 2)}</Value>
  } else if (error) {
    content = <ErrorValue>{error.stack || error}</ErrorValue>
  } else {
    content = <NoValue>-</NoValue>
  }

  return content
}

const App = () => {
  const [accountAddress, accountAddressError, setAccountAddress, setAccountAddressError] = useResult<string>()
  const [networkId, networkIdError, setNetworkId, setNetworkIdError] = useResult<string>()

  const [networkConfig, networkConfigError, setNetworkConfig, setNetworkConfigError ] = useResult<erdjs.NetworkConfig>()
  const [accountInfo, accountInfoError, setAccountInfo, setAccountInfoError ] = useResult<erdjs.Account>()
  const [balance, balanceError, setBalance, setBalanceError ] = useResult<erdjs.Balance>()
  const [nonce, nonceError, setNonce, setNonceError ] = useResult<erdjs.Nonce>()
  const [transaction, transactionError, setTransaction, setTransactionError] = useResult<erdjs.Transaction>()
  const [transactionStatus, transactionStatusError, setTransactionStatus, setTransactionStatusError ] = useResult<erdjs.TransactionStatus>()
  const [delegation, delegationError, setDelegation, setDelegationError] = useResult<any>()

  const foundElrondInstance = useMemo(() => {
    return window.elrond && window.elrond.getProvider
  }, [])

  useEffect(() => {
    const onAccountChanged = () => setAccountAddress('')
    const onNetworkChanged = () => setNetworkId('')

    if (foundElrondInstance) {
      window.elrond.addListener('account-changed', onAccountChanged)
      window.elrond.addListener('network-changed', onNetworkChanged)
    }

    return () => {
      if (foundElrondInstance) {
        window.elrond.removeListener('account-changed', onAccountChanged)
        window.elrond.removeListener('network-changed', onNetworkChanged)
      }
    }
  }, [foundElrondInstance, setAccountAddress, setNetworkId])

  useEffect(() => {
    if (!accountAddress) {
      window.elrond.getAccountAddress().then(setAccountAddress).catch(setAccountAddressError)
    }
    if (!networkId) {
      window.elrond.getNetworkId().then(setNetworkId).catch(setNetworkIdError)
    }
  }, [accountAddress, networkId, setAccountAddress, setAccountAddressError, setNetworkId, setNetworkIdError])

  const connectWallet = useCallback(() => {
    if (!accountAddress) {
      window.elrond.requestAccountAccess()
        .then(() => window.elrond.getAccountAddress())
        .then(setAccountAddress)
        .catch(setAccountAddressError)
    }
  }, [accountAddress, setAccountAddress, setAccountAddressError])

  useEffect(() => {
    if (!accountAddress) {
      return
    }

    (async () => {
      const provider = window.elrond.getProvider(erdjs)

      const logError = console.error.bind(console)

      try {
        await Promise.all([
          provider.getNetworkConfig().then(setNetworkConfig).catch(setNetworkConfigError),
          provider.getAccount(accountAddress).then(setAccountInfo).catch(setAccountInfoError),
          provider.getBalance(accountAddress).then(setBalance).catch(setBalanceError),
          provider.getNonce(accountAddress).then(setNonce).catch(setNonceError),
        ])
      } catch (err) {
        logError(err)
      }
    })()
  }, [setAccountInfo, setAccountInfoError, setBalance, setBalanceError, setNetworkConfig, setNetworkConfigError, setNonce, setNonceError, setTransaction, setTransactionError, setTransactionStatus, setTransactionStatusError, accountAddress, setDelegation, setDelegationError])

  useEffect(() => {
    if (!accountAddress || !networkConfig) {
      return
    }

    const provider = window.elrond.getProvider(erdjs)

    const hex = erdjs.Address.fromBech32(accountAddress).hex()

    provider.getVMValueInt(ADDRESSES.delegationContract, 'getClaimableRewards', [hex])
      .then(setDelegation)
      .catch(setDelegationError)
  }, [accountAddress, networkConfig, setDelegation, setDelegationError])

  const claimRewards = useCallback(async () => {
    const provider = window.elrond.getProvider(erdjs)

    const sc = new erdjs.SmartContract({
      address: erdjs.Address.fromBech32(ADDRESSES.delegationContract)
    })

    const rawTx = sc.call({
      func: new erdjs.ContractFunction('claimRewards'),
      gasLimit: new erdjs.GasLimit(100000)
    })

    console.log(rawTx)

    // TODO: sign transaction
    // TODO: send it
  }, [])

  return (
    <ThemeProvider theme={themes.get('default')}>
      <GlobalStyles />
      <Layout> 
        <Row>
          window.elrond instance:
          <RenderValue value={foundElrondInstance ? 'exists' : null} error={foundElrondInstance ? null : 'does not exist'} />
        </Row>
        <Row>
          Network id:
          <RenderValue value={networkId} error={networkIdError} />
        </Row>
        <Row>
          User's account:
          <RenderValue value={accountAddress} error={accountAddressError} />
        </Row>
        {accountAddress ? (
          <React.Fragment>
            <Row>
              Provider.getNetworkConfig()
              <RenderValue value={networkConfig} error={networkConfigError} />
            </Row>
            <Row>
              Provider.getAccount()
              <RenderValue value={accountInfo} error={accountInfoError} />
            </Row>
            <Row>
              Provider.getBalance()
              <RenderValue value={balance} error={balanceError} />
            </Row>
            <Row>
              Provider.getNonce()
              <RenderValue value={nonce} error={nonceError} />
            </Row>
            <Row>
              Delegation claimable rewards:
              <RenderValue value={delegation} error={delegationError} />
            </Row>
            {transaction ? (
              <React.Fragment>
                <Row>
                  Provider.getTransaction()
                  <RenderValue value={transaction} error={transactionError} />
                </Row>
                <Row>
                  Provider.getTransactionStatus()
                  <RenderValue value={transactionStatus} error={transactionStatusError} />
                </Row>
              </React.Fragment>
            ) : (
              <button onClick={claimRewards}>Claim rewards</button>          
            )}
          </React.Fragment>
        ) : (
          <button onClick={connectWallet}>Connect wallet</button>          
        )}
      </Layout>
    </ThemeProvider>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)