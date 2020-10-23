import { Shortcut } from 'shortcuts'
import { SHA3 } from 'sha3'

import KEY_MAP from '../common/constants/keyMap'
import { t } from '../common/strings'

export const isJson = (str: any): boolean => {
  try {
    const obj = JSON.parse(str)
    return (obj instanceof Object)
  } catch (err) {
    return false
  }
}

export const generateBrowserButtonTooltip = (buttonId: string): any => {
  const keyMapStr = (KEY_MAP[buttonId]) ? ` (${Shortcut.shortcut2symbols(KEY_MAP[buttonId])})` : ''
  return `${t(`browser.${buttonId}`)}${keyMapStr}`
}


export const sha3 = (str: string): string => {
  const s = new SHA3(512)
  s.update(str)
  return s.digest('hex')
}

