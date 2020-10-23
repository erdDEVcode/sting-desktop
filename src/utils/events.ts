import { Shortcuts } from 'shortcuts'
import EventEmitter from 'eventemitter3'

import KEYMAP from '../common/constants/keyMap'

const uiTaskEvents = new EventEmitter()

const shortcuts = new Shortcuts()

Object.entries(KEYMAP).forEach(([uiTask, shortcut]) => {
  shortcuts.add([{
    shortcut,
    handler: () => {
      uiTaskEvents.emit('uiTask', uiTask)
      return true
    }
  }])
})

export const createBrowserUiTasksEmitter = () => {
  const events = new EventEmitter()

  uiTaskEvents.on('uiTask', uiTask => {
    events.emit('uiTask', uiTask)
  })

  return {
    events,
    destroy: () => {
      events.removeAllListeners()
    }
  }
}

