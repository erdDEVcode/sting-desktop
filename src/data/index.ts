import defaultSupportedCurrencies from './supportedCurrencies.json'
import defaultSupportedTokens from './supportedTokens.json'
import { NetworkEndpoint, RawTokenAssetRecord, TokenAsset, TokenAssetRecord } from '../types/all'

const NETWORKS = {
  mainnet: {
    primaryToken: 'egld',
    delegations: true,
    auctionContract: 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l',
    stakingContract: 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqllls0lczs7',
    delegationContract: 'erd1qqqqqqqqqqqqqpgqxwakt2g7u9atsnr03gqcgmhcv38pt7mkd94q6shuwt',
  },
  testnet: {
    primaryToken: 'xegld',
    auctionContract: 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l',
    stakingContract: 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqllls0lczs7',
    delegationContract: 'erd1qqqqqqqqqqqqqpgqp699jngundfqw07d8jzkepucvpzush6k3wvqyc44rx',
  }
}

export const ENDPOINTS = [
  {
    name: 'Mainnet',
    url: 'https://api.erd.dev',
    ...NETWORKS.mainnet,
  },
  {
    name: 'Testnet',
    url: 'https://api-testnet.elrond.com',
    ...NETWORKS.testnet,
  },
]

class Data {
  _supportedCurrencies: TokenAssetRecord = {}
  _supportedTokens: TokenAssetRecord = {}
  _endpoints: NetworkEndpoint[] = ENDPOINTS

  constructor () {
    this._loadCurrencies(defaultSupportedCurrencies)
    this._loadTokens(defaultSupportedTokens)
  }

  _loadCurrencies (data: RawTokenAssetRecord) {
    this._supportedCurrencies = Object.entries(data).reduce((m, [key, val]) => {
      const a: TokenAsset = {
        id: key,
        ...val,
        decimals: 0,
      }

      ;(m as TokenAssetRecord)[a.id] = a

      return m
    }, {})
  }

  _loadTokens(data: RawTokenAssetRecord) {
    this._supportedTokens = Object.entries(data).reduce((m, [key, val]) => {
      const a: TokenAsset = {
        id: key,
        decimals: val.decimals!,
        ...val,
      }

        ; (m as TokenAssetRecord)[a.id] = a

      return m
    }, {})
  }

  getTokens(): TokenAssetRecord {
    return Object.assign({}, this._supportedTokens)
  }

  getToken (id: string): TokenAsset {
    return this.getTokens()[id]
  }

  getTokenOrCurrency(id: string): TokenAsset {
    return this.getToken(id) || this.getCurrency(id)
  }

  getCurrency(id: string): TokenAsset {
    return this.getCurrencies()[id]
  }

  getCurrencies(): TokenAssetRecord {
    return Object.assign({}, this._supportedCurrencies)
  }

  getPrimaryCurrency(): string {
    return 'usd'
  }

  getEndpoints (): NetworkEndpoint[] {
    return this._endpoints
  }
}

export default new Data()