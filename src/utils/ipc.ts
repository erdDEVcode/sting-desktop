import BACKEND_TASKS from '../common/constants/ipcBackendTasks'
import IPC from '../common/constants/ipc'

// handle frontend <-> backend message comms
class IpcComms {
  _pendingRequests: any
  _id: number

  constructor() {
    this._pendingRequests = {}
    this._id = 1

    window.addEventListener('message', (msg: any) => {
      const { ipc, id, data } = msg.data

      if (IPC.BACKEND_TASK_RESPONSE === ipc) {
        const req = this._pendingRequests[id]

        if (req) {
          this._pendingRequests[id] = null
          req.resolve(data)
        }
      }
    })
  }

  send (task: string, params: object = {}) {
    const id = (++this._id)

    this._pendingRequests[id] = {}

    return new Promise(resolve => {
      this._pendingRequests[id] = { resolve }

      window.postMessage(
        {
          ipc: IPC.BACKEND_TASK,
          task,
          id,
          params,
        },
        '*'
      )
    })
  }
}

// initialize ipc comms
const ipc = new IpcComms()

export const openExternalUrl = (url: string) => {
  ipc.send(BACKEND_TASKS.OPEN_EXTERNAL_URL, { url })
}

interface Base {
  error?: {
    message: string,
  }
}

interface CallUrlProps {
  url: string,
  timeout?: number,
  responseType?: string,
  headers?: Record<string,string>,
  body?: string,
  method?: string,
}

interface CallUrlResponse extends Base {
  data?: object,
  error?: {
    code: number,
    message: string,
  }
}

export const callUrl = (props: CallUrlProps): Promise<CallUrlResponse> => {
  // console.info('callUrl', props)
  return (ipc.send(BACKEND_TASKS.CALL_URL, props) as Promise<CallUrlResponse>)
}

interface LedgerIsSupportedResponse extends Base {
  data?: {
    supported: boolean,
  },
}

export const isLedgerSupported = (): Promise<LedgerIsSupportedResponse> => {
  return (ipc.send(BACKEND_TASKS.LEDGER_IS_SUPPORTED) as Promise<LedgerIsSupportedResponse>)
}

interface LedgerGetWalletResponse extends Base {
  data?: {
    address: string,
  },
}

export const getLedgerWallet = (): Promise<LedgerGetWalletResponse> => {
  return (ipc.send(BACKEND_TASKS.LEDGER_GET_WALLET) as Promise<LedgerGetWalletResponse>)
}

interface LedgerSignTransactionResponse extends Base {
  data?: {
    signedTransaction: string,
  },
}

export const signTransactionWithLedger = (tx: Buffer): Promise<LedgerSignTransactionResponse> => {
  const props = {
    tx: tx.toString('base64')
  }

  return (ipc.send(BACKEND_TASKS.LEDGER_SIGN_TRANSACTION, props) as Promise<LedgerSignTransactionResponse>)
}
