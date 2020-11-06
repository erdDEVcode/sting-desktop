import { parseRawTransaction, TransactionReceipt, ContractQueryParams, ContractQueryResult, ContractQueryResultDataType, TransactionOnChain, parseQueryResult } from 'erdor'

import _ from './lodash'
import { AddressResult, NetworkProxyApi, NetworkConfig, TransactionsResult, DelegationResult, SignedTransaction, NetworkEndpoint } from '../types/all'
import { ApiBase } from './apiBase'
import { addressToHexString } from './erdWallet'
import { AssetValue } from './number'

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
      gasPerDataByte: _.get(rawConfig, 'erd_gas_per_data_byte'),
      minGasPrice: _.get(rawConfig, 'erd_min_gas_price'),
      minGasLimit: _.get(rawConfig, 'erd_min_gas_limit'),
      minTransactionVersion: _.get(rawConfig, 'erd_min_transaction_version', 1),
    }

    if (cfg.chainId && cfg.version) {
      this._rawConfig = rawConfig
      this._config = cfg
    }
  }

  async getAddress (address: string): Promise<AddressResult> {
    const ret = await this._call(`/address/${address}`)

    const { account } = _parseResponse(ret, 'Error fetching address info')

    return account
  }

  async queryContract(params: ContractQueryParams): Promise<ContractQueryResult> {
    const ret = await this._call(`/vm-values/query`, {
      method: 'POST',
      body: JSON.stringify({
        scAddress: params.contractAddress,
        funcName: params.functionName,
        args: params.args,
      })
    })

    const { data } = _parseResponse(ret, `Error calling queryContract`)

    return data
  }

  async getDelegation (address: string): Promise<DelegationResult> {
    const { delegationContract } = this._endpoint

    if (!delegationContract) {
      throw new Error('No delegation contract set')
    }

    const args = [ addressToHexString(address) ]

    const data1 = await this.queryContract({
      contractAddress: delegationContract,
      functionName: 'getUserStakeByType',
      args,
    })

    /*
      0 => WithdrawOnly
      1 => Waiting
      2 => Active
      3 => UnStaked
      4 => DeferredPayment
    */

    const waitingStake = parseQueryResult(data1, { index: 1, type: ContractQueryResultDataType.INT })
    const activeStake = parseQueryResult(data1, { index: 2, type: ContractQueryResultDataType.INT })
   
    const data2 = await this.queryContract({
      contractAddress: delegationContract,
      functionName: 'getClaimableRewards',
      args,
      })

    const claimable = parseQueryResult(data2, { type: ContractQueryResultDataType.INT })
    
    return {
      claimableRewards: String(claimable),
      userActiveStake: String(activeStake),
      userWaitingStake: String(waitingStake),
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

    const transactions = t.map(parseRawTransaction)

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

  async sendSignedTransaction(signedTx: SignedTransaction): Promise<TransactionReceipt> {
    const ret = await this._call(`/transaction/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(signedTx)
    })

    const { txHash: hash } = _parseResponse(ret, 'Error sending tx')

    return { signedTransaction: signedTx, hash }
  }

  async getTransaction(txHash: string): Promise<TransactionOnChain> {
    const ret = await this._call(`/transaction/${txHash}`, {
      method: 'GET',
    })

    const { transaction: txData } = _parseResponse(ret, 'Error fetching transaction')

    if (!txData) {
      throw new Error(`Transaction not found`)
    }

    return parseRawTransaction(txData)
  }
}
