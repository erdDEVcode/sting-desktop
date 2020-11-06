/*
The default preload script for each Dapp browser tab.
This will setup the Elrond provider instance for any Dapp running in the page.
*/

const { ipcRenderer, webFrame } = require('electron')
const { Shortcuts } = require('shortcuts')

const IPC = require('../../common/constants/ipc')
const WEBVIEW_TASKS = require('../../common/constants/ipcWebViewTasks')
const KEYMAP = require('../../common/constants/keyMap')

// to talk to host WebView react component
const sendToHost = ({ task, id, params }) => {
  ipcRenderer.sendToHost(IPC.WEBVIEW_TASK, { task, id, params })
}

// send UI task up to host
const sendUiTask = (uiTask) => {
  sendToHost({ task: WEBVIEW_TASKS.KEY_COMMAND, id: null, params: { uiTask } })
}
const shortcuts = new Shortcuts()
Object.entries(KEYMAP).forEach(([uiTask, shortcut]) => {
  shortcuts.add([{
    shortcut,
    handler: () => sendUiTask(uiTask)
  }])
})

// send all other messages to host
window.addEventListener('message', ({ data = {} }) => {
  const { ipc } = data

  switch (ipc) {
    case IPC.WEBVIEW_TASK:
      sendToHost(data)
      break
    default:
    // do nothing
  }
})

// handle msgs from host
ipcRenderer.on(IPC.WEBVIEW_TASK_RESPONSE, (_ignore, data) => {
  // pass through to page
  window.postMessage( { 
    ipc: IPC.WEBVIEW_TASK_RESPONSE,
    ...data,
  })
})
ipcRenderer.on(IPC.WEBVIEW_CONTEXT_EVENT, (_ignore, data) => {
  // pass through to page
  window.postMessage({
    ipc: IPC.WEBVIEW_CONTEXT_EVENT,
    ...data,
  })
})

webFrame.executeJavaScript(`
  class StingIpcProvider {
    constructor (parentInstance) {
      this._parentInstance = parentInstance

      ;[
        'getNetworkConfig',
        'getAccount',
        'queryContract',
        'signAndSendTransaction',
        'sendSignedTransaction',
        'getTransaction'
      ].forEach(f => {
        this[f] = async (...args) => {
          return await this._parentInstance._sendRequest('${WEBVIEW_TASKS.ERD_PROVIDER_CALL}', { f, args })
        }
      })
    }
  }

  class EventEmitter {
    constructor () {
      this.listeners = new Map()
    }

    addListener(label, callback) {
      this.listeners.has(label) || this.listeners.set(label, [])
      this.listeners.get(label).push(callback)
    }

    removeListener(label, callback) {
        let listeners = this.listeners.get(label),
            index
        
        if (listeners && listeners.length) {
            index = listeners.reduce((i, listener, index) => {
                return (isFunction(listener) && listener === callback) ?
                    i = index :
                    i
            }, -1)
            
            if (index > -1) {
                listeners.splice(index, 1)
                this.listeners.set(label, listeners)
                return true
            }
        }
        return false
    }

    emit(label, ...args) {
        let listeners = this.listeners.get(label)
        
        if (listeners && listeners.length) {
            listeners.forEach((listener) => {
                listener(...args) 
            })
            return true
        }
        return false
    }
  }

  class ElrondInstance extends EventEmitter {
    constructor () {
      super()
      this._pendingRequests = {}
      this._provider = new StingIpcProvider()
      this._id = 1

      // When we receive an IPC response
      window.addEventListener('message', msg => {
        const { ipc } = msg.data

        switch (ipc) {
          case '${IPC.WEBVIEW_TASK_RESPONSE}':
            const { id, data, error } = msg.data

            const req = this._pendingRequests[id]

            if (req) {
              this._pendingRequests[id] = null

              if (error) {
                req.reject(new Error(error))
              } else {
                req.resolve(data)
              }
            }

            break
          case '${IPC.WEBVIEW_CONTEXT_EVENT}':
            const { event } = msg.data
            this.emit(event)
            break
          default:
            // do nothing
        }
      })
    }

    _sendRequest (task, params) {
      const id = this._id++

      return new Promise((resolve, reject) => {
        this._pendingRequests[id] = { resolve, reject }

        window.postMessage(
          {
            ipc: '${IPC.WEBVIEW_TASK}',
            task,
            id,
            params,
          },
          '*'
        )
      })
    }

    get provider () {
      return this._provider
    }

    async getAccountAddress () {
      return await this._sendRequest('${WEBVIEW_TASKS.META_CALL}', { method: 'getAccountAddress' })
    }

    async getNetworkId () {
      return await this._sendRequest('${WEBVIEW_TASKS.META_CALL}', { method: 'getNetworkId' })
    }
  }

  // inject elrond object
  window.elrond = new ElrondInstance()
`)
