import _ from '../../utils/lodash'
import { Wallet, ContractQueryParams, Network, Transaction, SignedTransaction, Storage } from '../../types/all'
import { ERD_PROVIDER_CALL, META_CALL } from '../../common/constants/ipcWebViewTasks'
import { HandlerHelper } from './interfaces'

/**
 * Handles calls for Dapp browser WebView calls.
 */
export class WebViewCallHandler {
  _wallet: Wallet
  _network: Network
  _storage: Storage

  constructor(wallet: Wallet, network: Network, storage: Storage) {
    this._wallet = wallet
    this._network = network
    this._storage = storage
  }

  async execute(helper: HandlerHelper, task: string, params: any) {
    switch (task) {
      case ERD_PROVIDER_CALL:
        return this._executeErdProviderCall(helper, params)
      case META_CALL:
        return this._executeMetaCall(helper, params)
      default:
        throw new Error(`Unrecognized task: ${task}`)
    }
  }

  async _executeMetaCall(helper: HandlerHelper, params: any) {
    const { method } = params
    
    switch (method) {
      case 'getNetworkId': {
        return this._network.config?.chainId
      }
      case 'getAccountAddress': {
        const dapp = helper.getDapp()

        if (!dapp) {
          throw new Error('No dapp detected')
        }

        let isAllowed = await this._storage.isDappAllowed(dapp)

        // if not allowed then ask user for permission
        if (!isAllowed) {
          isAllowed = await helper.askUserToAllowDappToSeeTheirWalletAddress(this._wallet.address())

          if (isAllowed) {
            await this._storage.allowDapp(dapp)
          }
        }

        if (!isAllowed) {
          throw new Error('User disallowed access')
        }
        
        return this._wallet.address()
      }
      default:
        throw new Error(`Unrecognized method: ${method}`)
    }
  }

  _parseArg (args: any, name: string) {
    const v = _.get(args, '0')
    if (undefined === v) {
      throw new Error(`Argument not found: ${name}`)
    }
    return v
  }

  async _executeErdProviderCall(helper: HandlerHelper, params: any) {
    const { method, args } = params 

    switch (method) {
      case 'getNetworkConfig': {
        return this._network.connection.getNetworkConfig()
      }
      case 'getAccount': {
        const address: string = this._parseArg(args, 'address')
        return await this._network.connection.getAddress(address)
      }
      case 'queryContract': {
        const params: ContractQueryParams = this._parseArg(args, 'params')
        return await this._network.connection.queryContract(params)
      }
      case 'signAndSendTransaction': {
        const tx: Transaction = this._parseArg(args, 'tx')
        
        // remove meta since this is for Sting internal use only
        delete tx.meta

        return await helper.signAndSendTransaction(tx)
      }
      case 'sendSignedTransaction': {
        const signedTx: SignedTransaction = this._parseArg(args, 'signedTx')
        
        // remove meta since this is for Sting internal use only
        delete signedTx.meta

        return await this._network.connection.sendSignedTransaction(signedTx)
      }
      case 'getTransaction': {
        const txHash: string = this._parseArg(args, 'txHash')
        const ret = await this._network.connection.getTransaction(txHash)
        const raw = _.get(ret, 'raw')
        if (!raw) {
          throw new Error('Transaction not found')
        }
        return raw
      }
      default:
        throw new Error(`Unrecognized method: ${method}`)
    }
  }
}
