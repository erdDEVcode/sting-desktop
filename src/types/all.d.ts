export * from './network'
export * from './transaction'
export * from './api'

export interface Dapp {
  id: string,
  title?: string,
}

export interface AllowedDapp extends Dapp {
  date: number,
}

export interface Storage {
  allowDapp: (dapp: Dapp) => Promise<void>,
  disallowDapp: (dapp: Dapp) => Promise<void>,
  isDappAllowed: (dapp: Dapp) => Promise<boolean>,
  getAllowedDapps: () => Promise<any[]>,
}

export interface Rate {
  token: string,
  currency: string,
  value: number,
}

export type Rates = Record<string, Rate>

export interface Balance {
  token: string,
  amount: string,
}

export type Balances = Record<string, Balance>

export interface Delegation {
  claimable: string,
  activeStake: string,
  waitingStake: string,
}

export interface Network {
  endpoint: NetworkEndpoint,
  connection: NetworkProxyApi,
  config?: NetworkConfig,
  failure?: string,
}

export interface Account {
  address: () => string,
  sign: Function,
  isLedger?: boolean,
}

export interface RawTokenAsset {
  symbol: string,
  name: string,
  rateApiName?: string,
  rateMultiplier?: number
  decimals?: number,
}

export type RawTokenAssetRecord = Record<string, RawTokenAsset>

export interface TokenAsset extends RawTokenAsset {
  id: string,
  decimals: number,
}

export type TokenAssetRecord = Record<string, TokenAsset>
