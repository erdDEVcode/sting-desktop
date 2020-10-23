import React from 'react'
import { ThemeProvider } from 'emotion-theming'

import GlobalStyles from './components/GlobalStyles'
import Layout from './components/Layout'
import UpdateChecker from './components/UpdateChecker'
import {
  GlobalProvider,
  GlobalConsumer,
  GlobalContextValue,
  AccountProvider
} from './contexts'

import Dashboard from './dashboard'

require('./utils/ipc')


const Bootstrap: React.FunctionComponent = () => {
  return (
    <GlobalConsumer>
      {({ theme = {}, activeAccount, network }: GlobalContextValue) => (
        <AccountProvider activeAccount={activeAccount} network={network}>
          <ThemeProvider theme={theme}>
            <GlobalStyles />
            <Layout>
              <Dashboard />
              <UpdateChecker />
            </Layout>
          </ThemeProvider>
        </AccountProvider>
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
