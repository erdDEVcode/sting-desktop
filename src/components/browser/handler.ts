import { Account, Network, Storage } from '../../types/all'
import { ERD_PROVIDER_CALL, META_CALL } from '../../common/constants/ipcWebViewTasks'
import { HandlerHelper } from './interfaces'

/**
 * Handles calls for Dapp browser WebView calls.
 */
export class WebViewCallHandler {
  _account: Account
  _network: Network
  _storage: Storage

  constructor(account: Account, network: Network, storage: Storage) {
    this._account = account
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
        
        if (isAllowed) {
          return this._account.address()
        } else {
          return null
        }
      }
      case 'requestAccountAccess': {
        const dapp = helper.getDapp()
        
        if (!dapp) {
          throw new Error('No dapp detected')
        }

        let isAllowed = await this._storage.isDappAllowed(dapp)

        // if not allowed then ask user for permission
        if (!isAllowed) {
          isAllowed = await helper.askUserToAllowDappToSeeTheirAccountAddress(this._account.address())

          if (isAllowed) {
            await this._storage.allowDapp(dapp)
          }
        }

        if (!isAllowed) {
          throw new Error('User disallowed access')
        }

        break
      }
      default:
        throw new Error(`Unrecognized method: ${method}`)
    }
  }

  async _executeErdProviderCall(helper: HandlerHelper, params: any) {
    const { method, args } = params 

    switch (method) {
      case 'getNetworkConfig': {
        return this._network.connection.getRawConfig()
      }
      case 'getAccount': {
        const { address } = args
        return await this._network.connection.getAddress(address)
      }
      case 'getBalance': {
        const { address } = args
        const ret = await this._network.connection.getAddress(address)
        return ret.balance
      }
      case 'getNonce': {
        const { address } = args
        const ret = await this._network.connection.getAddress(address)
        return ret.nonce
      }
      case 'getVMValueString': {
        const { contractAddress, funcName, funcArgs } = args
        return await this._network.connection.getVMValue(contractAddress, funcName, funcArgs || [], 'string')
      }
      case 'getVMValueInt': {
        const { contractAddress, funcName, funcArgs } = args
        return await this._network.connection.getVMValue(contractAddress, funcName, funcArgs || [], 'int')
      }
      case 'getVMValueHex': {
        const { contractAddress, funcName, funcArgs } = args
        return await this._network.connection.getVMValue(contractAddress, funcName, funcArgs || [], 'hex')
      }
      case 'getVMValueQuery': {
        const { contractAddress, funcName, funcArgs } = args
        return await this._network.connection.getVMValue(contractAddress, funcName, funcArgs || [], 'query')
      }
      case 'sendTransaction': {
        const { signedTx } = args
        return await this._network.connection.sendTransaction(signedTx)
      }
      case 'simulateTransaction': {
        const { signedTx } = args
        return await this._network.connection.simulateTransaction(signedTx)
      }
      case 'getTransaction': {
        const { txHash } = args
        const ret = await this._network.connection.getTransaction(txHash)
        return ret ? ret.raw : null
      }
      case 'getTransactionStatus': {
        const { txHash } = args
        const ret = await this._network.connection.getTransaction(txHash)
        return ret ? ret.raw.status : null
      }
      default:
        throw new Error(`Unrecognized method: ${method}`)
    }
  }
}
