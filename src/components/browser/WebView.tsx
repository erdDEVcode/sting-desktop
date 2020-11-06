import React, { Component } from 'react'
import styled from '@emotion/styled'

import _ from '../../utils/lodash'
import { KEY_COMMAND } from '../../common/constants/ipcWebViewTasks'
import ConnectWalletModal from '../ConnectWalletModal'
import { WEBVIEW_CONTEXT_EVENT, WEBVIEW_TASK, WEBVIEW_TASK_RESPONSE } from '../../common/constants/ipc'
import { ACCOUNT_CHANGED, NETWORK_CHANGED } from '../../common/constants/ipcWebViewContextEvents'
import { WebViewCallHandler } from './handler'
import { HandlerHelper } from './interfaces'
import { extractDappId } from '../../utils/url'
import { openExternalUrl } from '../../utils/ipc'
import { Wallet, Dapp, Network, Transaction } from '../../types/all'
import SignAndSendTransaction from '../SignAndSendTransaction'

const Container = styled.div`
  width: 100%;
  height: 100%;
`

const StyledWebView = styled('webview')`
  width: 100%;
  height: 100%;
`

interface Props {
  url: string,
  ctx: any,
  onLoading: Function,
  onLoaded: Function,
  onLoadingError: Function,
  onUrlChange: Function,
  onOpenNewWindow: Function,
  onTitleChange: Function,
  onUiTask: Function, 
  callHandler: WebViewCallHandler | null,
  wallet?: Wallet,
  network: Network | null,
}

interface ConnectWalletModalState {
  address: string,
}

interface WebViewState {
  showConnectWalletModal?: ConnectWalletModalState
}

export default class WebView extends Component<Props> implements HandlerHelper {
  webViewEventHandlers: Record<string, Function>
  webView: any
  signAndSendTransactionInterface: any
  state: WebViewState = {}
  
  constructor (props: any) {
    super(props)

    this.webViewEventHandlers = {
      'did-start-loading': this.onLoading,
      'did-get-redirect-request': this.onRedirect,
      'did-navigate': this.onNavigate,
      'did-stop-loading': this.onLoaded,
      'did-fail-load': this.onLoadingError,
      crashed: this.onLoadingError,
      'gpu-crashed': this.onLoadingError,
      'plugin-crashed': this.onLoadingError,
      'page-title-updated': this.onNewTitle,
      'new-window': this.onNewWindow,
      'ipc-message': this.onMessage
    }
  }
  
  /* lifecycle */

  componentWillUnmount() {
    Object.entries(this.webViewEventHandlers).forEach(([ e, f ]) => {
      this.webView.removeEventListener(e, f)
    })
  }

  componentDidMount() {
    Object.entries(this.webViewEventHandlers).forEach(([ e, f ]) => {
      this.webView.addEventListener(e, f)
    })
  }

  componentDidUpdate (prevProps: any) {
    if (_.get(prevProps, 'network.connection') !== _.get(this.props, 'network.connection')) {
      this.webView.send(WEBVIEW_CONTEXT_EVENT, { event: NETWORK_CHANGED })
    }

    if (_.get(prevProps, 'account') !== _.get(this.props, 'account')) {
      this.webView.send(WEBVIEW_CONTEXT_EVENT, { event: ACCOUNT_CHANGED })
    }
  }

  /* render */

  render() {
    const { url } = this.props

    return (
      <Container>
        <SignAndSendTransaction ref={this._onSignAndSendTxRef} />
        <ConnectWalletModal 
          isOpen={!!this.state.showConnectWalletModal} 
          dapp={this.getDapp()}
          {...this.state.showConnectWalletModal}
        />
        <StyledWebView
          ref={this._onWebViewRef}
          src={url}
          preload={`file://${window.preloadBasePath}/browserTab.js`}
        />
      </Container>
    )
  }

  /* event handlers */

  onLoading = () => {
    this.props.onLoading(this.props.ctx)
  }
  onLoaded = () => {
    this.props.onLoaded(this.props.ctx)
    this.props.onTitleChange(this.props.ctx, this.webView.getTitle())
  }
  onLoadingError = (e: any) => {
    const { isMainFrame, errorDescription } = e

    if (isMainFrame) {
      this.props.onLoadingError(this.props.ctx, errorDescription)
    }
  }
  onNavigate = (e: any) => {
    const { url } = e
    this._onChangeUrl(url)
  }
  onRedirect = (e: any) => {
    const { newURL, isMainFrame } = e
    if (isMainFrame) {
      this._onChangeUrl(newURL)
    }
  }
  _onChangeUrl = (url: string) => {
    this.props.onUrlChange(this.props.ctx, url)
    this.props.onTitleChange(this.webView.getTitle())
  }
  onNewWindow = (e: any) => {
    this.props.onOpenNewWindow(this.props.ctx, e.url)
  }
  onNewTitle = (e: any) => {
    this.props.onTitleChange(this.props.ctx, e.title)
  }

  onMessage = (e: any) => {
    if (e.channel !== WEBVIEW_TASK) {
      return
    }

    const { task, params, id } = _.get(e, 'args.0', {}) 

    switch (task) {
      case KEY_COMMAND: {
        this.props.onUiTask(this.props.ctx, _.get(params, 'uiTask'))
        break
      }
      default: {
        if (this.props.callHandler) {
          this.props.callHandler.execute(this, task, params)
            .then(data => {
              this.webView.send(WEBVIEW_TASK_RESPONSE, { id, data })
            })
            .catch(err => {
              this.webView.send(WEBVIEW_TASK_RESPONSE, { id, error: err.message })
            })
        } else {
          this.webView.send(WEBVIEW_TASK_RESPONSE, { id, error: 'Not connected to network' })
        }

        break
      }
    }
  }

  /* public methods */

  getDapp = (): Dapp | undefined => {
    return this.props.url ? {
      id: extractDappId(this.props.url),
      title: this.webView?.getTitle(),
    } : undefined
  }

  openUrl = (url: string) => {
    this.webView.loadURL(url)
  }

  goBack = () => {
    this.webView.goBack()
  }

  goForward = () => {
    this.webView.goForward()
  }

  refresh = () => {
    this.webView.reload()
  }

  toggleDevTools = () => {
    if (this.webView.isDevToolsOpened()) {
      this.webView.closeDevTools()
    } else {
      this.webView.openDevTools()
    }
  }

  openInExternalBrowser = () => {
    openExternalUrl(this.props.url)
  }

  async askUserToAllowDappToSeeTheirWalletAddress (address: string) {
    return new Promise((resolve, reject) => {
      this.setState({
        showConnectWalletModal: { 
          address,
          onAllow: () => resolve(true),
          onDisallow: () => resolve(false), 
          onError: reject,
        }
      })
    }).finally(() => {
      this.setState({ showConnectWalletModal: null })
    })
  }

  async signAndSendTransaction (tx: Transaction) {
    return this.signAndSendTransactionInterface.execute(tx)
  }

  /* internal */

  _onSignAndSendTxRef = (v: any) => {
    this.signAndSendTransactionInterface = v
  }

  _onWebViewRef = (v: any) => {
    this.webView = v
  }
}

