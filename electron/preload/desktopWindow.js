/*
 * The preload script for any desktop window.
 *
 * We use context isolation to ensure the browser SPA cannot access anything
 * unauthorized, see https://github.com/electron/electron/pull/8348
 *
 * The code in this file runs in a separate "context" to the code in the actual
 * browser page that is loaded in the window.
 */
const { ipcRenderer, webFrame } = require('electron')
const IPC = require('../../common/constants/ipc')
const BACKEND_TASKS = require('../../common/constants/ipcBackendTasks')
const UI_TASKS = require('../../common/constants/ipcUiTasks')
const Settings = require('../settings')

// tell backend we have initialized
ipcRenderer.invoke(IPC.BACKEND_TASK, { task: BACKEND_TASKS.SET_WINDOW_ID })

// handle reloads
ipcRenderer.on(IPC.UI_TASK, (e, task) => {
  switch (task) {
    case UI_TASKS.RELOAD:
      window.location.reload()
      break
    default:
    // nothing
  }
})

// handle frontend messages
window.addEventListener('message', ({ source, data = {} }) => {
  const { ipc, id, task, params } = data

  // send IPC to backend
  if (IPC.BACKEND_TASK === ipc) {
    ipcRenderer.invoke(IPC.BACKEND_TASK, { task, params }).then(responseData => {
      source.postMessage({
        ipc: IPC.BACKEND_TASK_RESPONSE,
        id,
        data: responseData,
      })
    })
  }
})

webFrame.executeJavaScript(`
  /* 
    Nullify globals inserted by node integration
    (see https://electron.atom.io/docs/faq/#i-can-not-use-jqueryrequirejsmeteorangularjs-in-electron)
  */
  delete window.require;
  delete window.exports;
  delete window.module;
  window.isElectron = true;
  window.osName = '${Settings.osName}';
  window.inProductionMode = ${Settings.inProductionMode};
  window.preloadBasePath = "${Settings.preloadBasePath}";
`)
