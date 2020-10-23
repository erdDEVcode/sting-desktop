import { Transaction, SignedTransaction } from './transaction'
import { NetworkConfig } from './network'

export interface AddressResult {
  address: string,
  nonce: number,
  balance: string,
  code: string,
  codeHash: string | null,
}

export interface DelegationResult {
  claimableRewards: string,
  userActiveStake: string,
  userWaitingStake: string,
}

export interface TransactionsResult {
  transactions: Transaction[],
  offset: number,
  limit: number,
  count: number,
}

export interface NetworkConfigResult {
  erd_chain_id: string,
  erd_start_time: number,
}

export interface NetworkProxyApi {
  getConfig: () => NetworkConfig | undefined,
  getRawConfig: () => any,
  assertConnected: () => Promise<void>,
  getAddress: (address: string) => Promise<AddressResult>,
  getDelegation: (address: string) => Promise<DelegationResult>,
  getVMValue: (contractAddress: string, funcName: string, funcArgs: string[], valueType: VMValueType) => Promise<any>,
  getTransactions: (address: string, offset: number = 0, limit: number = 50) => Promise<TransactionsResult>,
  sendTransaction: (signedTx: SignedTransaction) => Promise<string>,
  simulateTransaction: (signedTx: SignedTransaction) => Promise<any>,
  getTransaction: (txHash: string) => Promise<Transaction>,
}
