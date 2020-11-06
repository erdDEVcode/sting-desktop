import { TransactionOnChain, SignedTransaction, NetworkConfig, ContractQueryParams, ContractQueryResult } from 'erdor'

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
  transactions: TransactionOnChain[],
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
  queryContract: (params: ContractQueryParams) => Promise<ContractQueryResult>,
  getTransactions: (address: string, offset: number = 0, limit: number = 50) => Promise<TransactionsResult>,
  sendSignedTransaction: (signedTx: SignedTransaction) => Promise<TransactionReceipt>,
  getTransaction: (txHash: string) => Promise<Transaction>,
}
