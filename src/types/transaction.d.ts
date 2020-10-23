export enum TransactionStatus {
  SUCCESS = 1,
  FAILURE,
}

export interface Transaction {
  raw: object,
  data: string,
  gasLimit: number,
  gasPrice: number,
  gasUsed: number,
  id: string,
  miniBlockHash: string,
  nonce: number
  receiver: string,
  receiverShard: number,
  round: number,
  sender: string,
  senderShard: number,
  status: TransactionStatus,
  timestamp: Date,
  value: string,
}


export interface NewTransaction {
  sender: string,
  receiver: string,
  value: string,
  gasPrice: string,
  gasLimit: string,
  data: string,
}


export interface SignedTransaction {
  nonce: number,
  sender: string,
  receiver: string,
  value: string,
  gasPrice: number,
  gasLimit: number,
  data: string,
  chainID: string,
  version: number,
  signature: string,
}
