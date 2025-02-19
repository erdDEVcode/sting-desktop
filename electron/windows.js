const path = require('path')
const URL = require('url')
const { BrowserWindow, webviewTag } = require('electron')
const EventEmitter = require('eventemitter3')

const _ = require('./lodash')
const Settings = require('./settings')
const IPC = require('../common/constants/ipc')
const UI_TASKS = require('../common/constants/ipcUiTasks')

const log = require('./logger').create('Windows')


class Window extends EventEmitter {
  constructor(type, config = {}) {
    super()

    this._type = type
    this._config = config
    this._isShown = false
    this._isDestroyed = false
    this._log = log.create(this._type)

    // promise to track when content is ready
    this._onContentReady = new Promise(resolve => {
      this._onContentReadyCallback = resolve
    })

    const electronOptions = {
      title: Settings.appName,
      show: true,
      width: 1100,
      height: 720,
      center: true,
      resizable: true,
      icon: Settings.appIconPath,
      titleBarStyle: 'hidden',
      backgroundColor: '#000',
      acceptFirstMouse: true,
      darkTheme: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: false, // needs to be off in order to recieve proper data via webview events
        webSecurity: true,
        preload: path.join(Settings.preloadBasePath, 'desktopWindow.js'),
        webaudio: true,
        webgl: false,
        textAreasAreResizable: true,
        webviewTag: true,
      }
    }

    _.deepExtend(electronOptions, config.electronOptions || {})

    this._log.debug('Creating window')

    this._window = new BrowserWindow(electronOptions)
    this._webContents = this._window.webContents

    this._webContents.once('did-finish-load', () => {
      this._log.debug(`Content loaded`)

      this._onContentReadyCallback()

      this.show()

      this.emit('ready')
    })

    this._window.once('closed', () => {
      this._log.debug(`Destroyed`)

      this._isShown = false
      this._isDestroyed = true
      this._isContentReady = false

      this.emit('closed')
    })

    this._window.on('show', e => {
      this._log.debug(`Shown`)

      this._isShown = true

      this.emit('show', e)
    })

    this._window.on('hide', e => {
      this._log.debug(`Hidden`)

      this._isShown = false

      this.emit('hide', e)
    })

    if (Settings.inDevMode) {
      this.loadUrl(config.url || `http://localhost:3000/#${type}`)
    } else {
      this.loadFile('index.html')
    }
  }

  /**
   * Set IPC sender
   *
   * Can only be called once.
   */
  setId(id) {
    if (undefined !== this._id && null !== this._id) {
      this._log.debug('Id already set, skipping')
    }

    this._id = id
    this._log.debug(`Set id: ${this._id}`)
    this._log = log.create(`${this._type}-${this._id}`)
  }

  get id() {
    return this._id
  }

  get type() {
    return this._type
  }

  get config() {
    return this._config
  }

  get isShown() {
    return this._isShown
  }

  get isDestroyed() {
    return this._isDestroyed
  }

  get nativeBrowserWindow() {
    return this._window
  }

  onceReady() {
    return this._onContentReady
  }

  loadUrl(url) {
    if (this._isDestroyed) {
      return
    }

    this._log.info(`Load URL: ${url}`)

    this._window.loadURL(url)
  }

  loadFile(file) {
    this._log.debug(`Load file: ${file}`)

    const url = URL.format({
      protocol: 'file',
      slashes: true,
      pathname: path.join(Settings.appWebDir, 'index.html')
    })

    this.loadUrl(url)
  }

  send(...args) {
    if (this._isDestroyed) {
      this._log.debug(`Unable to send data, window destroyed`)

      return
    }

    this.onceReady().then(() => {
      this._log.trace(`Sending data`, args)

      this._webContents.send(IPC.UI_TASK, ...args)
    })
  }


  hide() {
    if (this._isDestroyed) {
      return
    }

    this._log.debug(`Hide`)

    this._window.hide()
  }


  show() {
    if (this._isDestroyed) {
      return
    }

    this._log.debug(`Show`)

    this._window.show()
  }


  destroy() {
    if (this._isDestroyed) {
      return
    }

    this._log.debug(`Destroy`)

    this._window.close()
  }


  openDevTools() {
    this._window.openDevTools()
  }

  reload() {
    this.send(UI_TASKS.RELOAD)
  }
}

exports.Window = Window

let mainWindow

exports.setupMainWindow = () => {
  mainWindow = new Window('Main', {
    electronOptions: {
      minWidth: 800,
      minHeight: 600,
    }
  })

  if (Settings.inDevMode) {
    mainWindow.openDevTools()
  }

  return mainWindow
}

exports.getMainWindow = () => mainWindow
