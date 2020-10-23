const { app } = require('electron')

const IpcImpl = require('./ipc')
const Settings = require('./settings')
const Menu = require('./menu')
const { setupMainWindow } = require('./windows')
const log = require('./logger').create('main')

global.Ipc = new IpcImpl()

const isOSX = 'darwin' === process.platform

if (Settings.inProductionMode) {
  log.info('Running in Production mode!')
}

let mainWindow

const showMainWindow = () => {
  log.info('Showing main window ...')

  // if reference was previously nullified
  // or if this is first launch then
  // we need to (re)create the window
  if (!mainWindow) {
    // Create the browser window.
    mainWindow = setupMainWindow()

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
      log.info('Window closed')

      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      // Hence we shall nullify the reference when the window is closed
      if (isOSX) {
        mainWindow = null
      }
    })

    Menu.setup()
  } else {
    mainWindow.show()
  }
}


// Squirrel installer launches app during install, let's check for this and quit if so
// @see https://www.electronforge.io/config/makers/squirrel.windows#my-app-is-launching-multiple-times-during-install
if (require('electron-squirrel-startup')) {
  return app.quit()
}

// Extra security, see https://github.com/electron/electron/blob/master/docs/tutorial/security.md
app.on('web-contents-created', (event, contents) => {
  contents.on('will-attach-webview', (_, webPreferences) => {
    // security!
    webPreferences.nodeIntegration = false
    webPreferences.contextIsolation = true
    // // only allow our custom preload script - disable all others
    if (0 > webPreferences.preloadURL.indexOf(Settings.preloadBasePath)) {
      log.error(`WebView started with disallowed preload script: ${webPreferences.preloadURL} as it is not in our allowed path: ${Settings.preloadBasePath}`)
      event.preventDefault()
    }
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  log.debug('All windows closed')

  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (!isOSX) {
    log.debug('Exit app')

    app.quit()
  }
})



// activate
app.on('activate', () => {
  log.info('App activated')

  app.whenReady().then(() => {
    showMainWindow()
  })
})


// ready
app.on('ready', () => {
  log.info('App ready')

  showMainWindow()
})
