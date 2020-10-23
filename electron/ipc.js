const { shell, ipcMain: ipc } = require('electron')
const axios = require('axios')
const TransportNodeHid = require('@ledgerhq/hw-transport-node-hid').default
const ElrondLedgerApp = require('@elrondnetwork/hw-app-elrond').default

const _ = require('./lodash')
const BACKEND_TASKS = require('../common/constants/ipcBackendTasks')
const IPC = require('../common/constants/ipc')
const Windows = require('./windows')

const log = require('./logger').create('BackendIpc')


const _try = async fn => {
  try {
    return await fn()
  } catch (err) {
    console.error(err)

    return {
      error: {
        message: err.message,
      }
    }
  }
}

const _withLedger = async (fn) => {
  try {
    log.debug('Creating Ledger transport ...')

    const ledgerTransport = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Cannot write'))
      }, 1000)

      TransportNodeHid.create()
        .then(t => {
          clearTimeout(timer)
          resolve(t)
        })
        .catch(reject)
    })

    log.debug('Creating Elrond account ...')

    return await fn(new ElrondLedgerApp(ledgerTransport))
  } catch (err) {
    log.error(err.message)

    const msg = err.message.toLowerCase()

    const notOpenError =
      msg.includes('cannot write')
      || msg.includes('cannot open')
      || msg.includes('is busy')
      || msg.includes('0x6e')

    if (notOpenError) {
      throw new Error('Please ensure that your Ledger is connected and that the Elrond app is open')
    } else if (msg.includes('0x6985')) {
      throw new Error('The transaction was rejected on the Ledger')
    } else {
      throw err
    }
  }
}


class BackendIpc {
  constructor() {
    ipc.handle(IPC.BACKEND_TASK, this._onBackendTask.bind(this))
  }

  async _onBackendTask({ sender }, data) {
    const { task, params } = data

    switch (task) {
      case BACKEND_TASKS.LEDGER_SIGN_TRANSACTION: {
        log.info(`Task: Sign tx with Ledger`)

        return _try(async () => {
          const { tx } = params

          return _withLedger(async ledgerAccount => {
            log.debug('Signing transaction ...')

            const rawTx = Buffer.from(tx, 'base64')

            return {
              data: {
                signedTransaction: await ledgerAccount.signTransaction(rawTx)
              }
            }
          })
        })
      }

      case BACKEND_TASKS.LEDGER_IS_SUPPORTED: {
        log.info(`Task: Is Ledger supported?`)

        return _try(async () => {
          return {
            data: {
              supported: await TransportNodeHid.isSupported()
            }
          }
        })
      }

      case BACKEND_TASKS.LEDGER_GET_ACCOUNT: {
        log.info(`Task: Get Ledger account`)

        return _try(async () => {
          return _withLedger(async ledgerAccount => {
            log.debug('Fetching Elrond account info ...')

            return {
              data: await ledgerAccount.getAddress()
            }
          })          
        })
      }

      case BACKEND_TASKS.SET_WINDOW_ID: {
        log.info(`Task: Set window id: ${sender.id}`)
        Windows.getMainWindow().setId(sender.id)
        break
      }

      case BACKEND_TASKS.OPEN_EXTERNAL_URL: {
        const { url } = params

        log.info(`Task: Open external url: ${url}`)

        shell.openExternal(url)
        break
      }

      case BACKEND_TASKS.CALL_URL: {
        const { url, timeout, responseType, headers, method, body } = params

        log.info(`Task: Call url: ${url}`)

        return axios({
          url,
          method: method || 'GET',
          timeout,
          responseType,
          headers: {
            pragma: 'no-cache',
            ...headers,
          },
          data: body,
        }).then(response => {
          if (response.status >= 400) {
            const e = new Error(response.statusText)
            e.code = response.status
            throw e
          }

          return { data: response.data }
        }).catch(err => {
          console.log(err)
          
          return {
            error: {
              code: err.response ? err.response.status : -1,
              message: _.get(err, 'response.data.error') || _.get(err, 'response.data.code') || err.toString(),
            }
          }
        })
      }

      default:
        log.error(`Unrecognized task: ${task}`)
    }
  }
}


module.exports = BackendIpc



/* Old code for scraping rate from coingecko */
// const { Scraper, Root, CollectContent } = require('nodejs-web-scraper')
// const getRate = async (coin) => {
//   return new Promise((resolve, reject) => {
//     const config = {
//       baseSiteUrl: `https://www.coingecko.com/`,
//       startUrl: `https://www.coingecko.com/en/coins/${coin}`,
//       timeout: 20000,
//     }

//     const scraper = new Scraper(config)
//     const root = new Root()
//     const price = new CollectContent('.text-3xl span[data-target="price.price"]', {
//       getElementContent: (elem) => {
//         resolve(parseFloat(elem.substr(1)))
//       }
//     })
//     root.addOperation(price)

//     scraper.scrape(root)
//       .catch(reject)
//       .then(() => {
//         reject(new Error('Not found'))
//       })
//   })
// }