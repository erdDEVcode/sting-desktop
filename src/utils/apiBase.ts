import axios, { AxiosInstance } from 'axios'

import { callUrl } from './ipc'

export interface ApiOptions {
  alwaysViaBackend?: boolean
}

export interface ApiCallOptions {
  viaBackend?: boolean
  timeout?: number,
  responseType?: string,
  headers?: Record<string, string>,
  body?: string,
  method?: "GET" | "POST",
}

export class ApiBase {
  _axios: AxiosInstance
  _baseUrl: string
  _options: ApiOptions

  constructor(baseUrl: string, options: ApiOptions = {}) {
    this._baseUrl = baseUrl
    this._options = options

    this._axios = axios.create({
      baseURL: baseUrl,
    })
  }

  async _call (urlPath: string, options: ApiCallOptions = {}) {
    let ret: any

    const finalOpts = {
      timeout: options.timeout || 3000,
      reponseType: options.responseType || 'json',
      headers: options.headers || {},
      body: options.body || undefined,
      method: options.method || 'GET',
    }

    if (options.viaBackend || this._options.alwaysViaBackend) {
      ret = await callUrl({
        url: `${this._baseUrl}${urlPath}`,
        ...finalOpts,

      })
    } else {
      ret = await this._axios({
        url: urlPath,
        ...finalOpts,
      })
    }

    return this._responseTransformer(ret)
  }

  async _responseTransformer(ret: any): Promise<any> {
    const { data, error } = ret

    if (error) {
      // TODO: alert user
      throw new Error(error.message)
    }

    return data || ret
  }
}
