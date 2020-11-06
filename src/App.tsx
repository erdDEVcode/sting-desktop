import React from 'react'
import { ThemeProvider } from 'emotion-theming'

import GlobalStyles from './components/GlobalStyles'
import Layout from './components/Layout'
import UpdateChecker from './components/UpdateChecker'
import {
  GlobalProvider,
  GlobalConsumer,
  GlobalContextValue,
  WalletProvider,
  ChainProvider,
  NotificationsProvider
} from './contexts'

import Dashboard from './dashboard'

require('./utils/ipc')


const Bootstrap: React.FunctionComponent = () => {
  return (
    <GlobalConsumer>
      {({ theme = {}, activeWallet, network }: GlobalContextValue) => (
        <WalletProvider activeWallet={activeWallet} network={network}>
          <ThemeProvider theme={theme}>
            <GlobalStyles />
            <Layout>
              <NotificationsProvider>
                <ChainProvider network={network}>
                  <Dashboard />
                  <UpdateChecker />
                </ChainProvider>
              </NotificationsProvider>
            </Layout>
          </ThemeProvider>
        </WalletProvider>
      )}
    </GlobalConsumer>
  )
}

export default class App extends React.Component {
  componentDidCatch (error: Error, info: React.ErrorInfo) {
    // toast.error(`Sorry, there was unexpected page rendering error!`)
    console.error(error, info)
    this.setState({ error }) // trigger the error page
  }

  render() {
    return (
      <GlobalProvider>
        <Bootstrap {...this.props} />
      </GlobalProvider>
    )
  }
}
