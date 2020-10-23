export interface NetworkEndpoint {
  name: string,
  url: string,
  primaryToken: string,
  delegations?: boolean,
  auctionContract?: string,
  stakingContract?: string,
  delegationContract?: string,
}

export interface NetworkConfig {
  version: string,
  chainId: string,
  started: Date,
  gasMinLimit: number,
  gasMinPrice: number,
  gasPerDataByte: number,
}

