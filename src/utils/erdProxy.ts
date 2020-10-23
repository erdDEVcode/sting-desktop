import _ from './lodash'
import { AddressResult, NetworkProxyApi, NetworkConfig, TransactionsResult, DelegationResult, SignedTransaction, Transaction, NetworkEndpoint } from '../types/all'
import { ApiBase } from './apiBase'
import { addressToHexString } from './erdWallet'
import { AssetValue, vmIntValueToHexString } from './number'

enum TransactionStatus {
  SUCCESS = 1,
  FAILURE,
}

const _toTransaction = (tx: any): Transaction => {
  return {
    raw: tx,
    ...tx,
    status: (tx.status === 'Success' ? TransactionStatus.SUCCESS : TransactionStatus.FAILURE),
    timestamp: new Date(tx.timestamp * 1000)
  }
}

const _parseResponse = (data: any, errorMsg: string): any => {
  if (data.error || (data.code !== 'successful')) {
    throw new Error(`${errorMsg}: ${data.error || data.code || 'internal error'}`)
  }

  if (undefined === data.data) {
    throw new Error(`${errorMsg}: no data returned`)
  }

  return data.data
}

export class ErdProxy extends ApiBase implements NetworkProxyApi {
  _endpoint: NetworkEndpoint
  _rawConfig?: any
  _config?: NetworkConfig | undefined
  
  constructor(endpoint: NetworkEndpoint) {
    super(endpoint.url, { alwaysViaBackend: true })
    this._endpoint = endpoint
  }

  getConfig (): (NetworkConfig | undefined) {
    return this._config
  }

  getRawConfig (): any {
    return this._rawConfig
  }

  async assertConnected (): Promise<void> {
    const data = await this._call(`/network/config`)

    const rawConfig = _.get(data, 'data.config')

    const cfg = {
      version: _.get(rawConfig, 'erd_latest_tag_software_version'),
      chainId: _.get(rawConfig, 'erd_chain_id'),
      started: new Date(_.get(rawConfig, 'started', 0) * 1000),
      gasPerDataByte: _.get(rawConfig, 'erd_gas_per_data_byte'),
      gasMinPrice: _.get(rawConfig, 'erd_min_gas_price'),
      gasMinLimit: _.get(rawConfig, 'erd_min_gas_limit'),
    }

    if (cfg.chainId && cfg.started) {
      this._rawConfig = rawConfig
      this._config = cfg
    }
  }

  async getAddress (address: string): Promise<AddressResult> {
    const ret = await this._call(`/address/${address}`)

    const { account } = _parseResponse(ret, 'Error fetching address info')

    return account
  }

  async getVMValue(contractAddress: string, funcName: string, funcArgs: string[], valueType: string): Promise<any> {
    const ret = await this._call(`/vm-values/${valueType}`, {
      method: 'POST',
      body: JSON.stringify({
        scAddress: contractAddress,
        funcName,
        args: funcArgs,
      })
    })

    const { data } = _parseResponse(ret, `Error calling getVMValue[${valueType}]`)

    return data
  }

  async getDelegation (address: string): Promise<DelegationResult> {
    const { delegationContract } = this._endpoint

    if (!delegationContract) {
      throw new Error('No delegation contract set')
    }

    const args = [ addressToHexString(address) ]

    const data1 = await this.getVMValue(
      delegationContract,
      'getUserStakeByType',
      args,
      'query'
    )
    /*
      0 => WithdrawOnly
      1 => Waiting
      2 => Active
      3 => UnStaked
      4 => DeferredPayment
    */
    const [, waitingStake, activeStake] = _.get(data1, 'ReturnData', ['0', '0', '0'])
  
    const data2 = await this.getVMValue(
      delegationContract,
      'getClaimableRewards',
      args,
      'int'
    )

    return {
      claimableRewards: data2,
      userActiveStake: this._decodeVmIntValue(activeStake),
      userWaitingStake: this._decodeVmIntValue(waitingStake),
    }
  }

  async getTransactions(address: string, offset: number = 0, limit: number = 50): Promise<TransactionsResult> {
    const [ t ] = await Promise.all([
      this._call(`/transactions?from=${offset}&size=${limit}&sender=${address}&receiver=${address}`),
      // TODO: got cors issues
      // this._get(`/count?sender=${address}&receiver=${address}`),
    ])

    if (t.message) {
      throw new Error(`Error fetching transactions: ${t.message}`)
    }

    const transactions = t.map(_toTransaction)

    // if (!count) {
    //   throw new Error(`Error fetching transaction count`)
    // }

    return {
      limit,
      offset,
      transactions,
      count: -1,
    }
  }

  async sendTransaction(signedTx: SignedTransaction): Promise<string> {
    const ret = await this._call(`/transaction/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(signedTx)
    })

    const { txHash } = _parseResponse(ret, 'Error sending tx')

    return txHash
  }

  async simulateTransaction(signedTx: SignedTransaction): Promise<any> {
    const ret = await this._call(`/transaction/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(signedTx)
    })

    return _parseResponse(ret, 'Error simulating transaction')
  }

  async getTransaction(txHash: string): Promise<Transaction> {
    const ret = await this._call(`/transaction/${txHash}`, {
      method: 'GET',
    })

    const { transaction: txData } = _parseResponse(ret, 'Error fetching transaction')

    if (!txData) {
      throw new Error(`Transaction not found`)
    }

    return _toTransaction(txData)
  }

  _decodeVmIntValue (v: any) {
    return AssetValue.fromTokenAmount(this._endpoint.primaryToken, vmIntValueToHexString(v)).toString()
  }
}
