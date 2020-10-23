const { Menu, app } = require('electron')
const Windows = require('./windows')
const { t } = require('../common/strings')


exports.setup = () => {
  const template = [
    {
      label: t('menu.application'),
      submenu: [
        { label: t('menu.about'), selector: 'orderFrontStandardAboutPanel:' },
        { type: 'separator' },
        { label: t('menu.quit'), accelerator: 'Command+Q', click: () => app.quit() }
      ]
    },
    {
      label: t('menu.edit'),
      submenu: [
        { label: t('menu.undo'), accelerator: 'Command+Z', selector: 'undo:' },
        { label: t('menu.redo'), accelerator: 'Shift+Command+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: t('menu.cut'), accelerator: 'Command+X', selector: 'cut:' },
        { label: t('menu.copy'), accelerator: 'Command+C', selector: 'copy:' },
        { label: t('menu.paste'), accelerator: 'Command+V', selector: 'paste:' },
        { label: t('menu.selectAll'), accelerator: 'Command+A', selector: 'selectAll:' }
      ]
    },
    {
      label: t('menu.developer'),
      submenu: [
        { label: t('menu.reload'), click: () => Windows.getMainWindow().reload() },
        { label: t('menu.devTools'), click: () => Windows.getMainWindow().openDevTools() },
      ]
    }
  ]


  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
