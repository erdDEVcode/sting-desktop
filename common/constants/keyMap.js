const UI_TASKS = require('./ipcUiTasks')

module.exports = {
  [UI_TASKS.RELOAD]: 'CmdOrCtrl+R',
  [UI_TASKS.CLOSE_TAB]: 'CmdOrCtrl+W',
  [UI_TASKS.NEW_TAB]: 'CmdOrCtrl+T',
  [UI_TASKS.HIGHLIGHT_TAB_URL]: 'CmdOrCtrl+L',
  [UI_TASKS.GO_BACK]: 'CmdOrCtrl+[',
  [UI_TASKS.GO_FORWARD]: 'CmdOrCtrl+]',
  [UI_TASKS.SHOW_NEXT_TAB]: 'CmdOrCtrl+ALT+RIGHT',
  [UI_TASKS.SHOW_PREV_TAB]: 'CmdOrCtrl+ALT+LEFT',
  [UI_TASKS.TOGGLE_TAB_DEVTOOLS]: 'CmdOrCtrl+ALT+I',
  [UI_TASKS.OPEN_IN_EXTERNAL_BROWSER]: 'CmdOrCtrl+ALT+O',
}

