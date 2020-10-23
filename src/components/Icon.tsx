import React from 'react'
import { config, library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
  IconDefinition,
  faSlash,
  faChevronCircleDown,
  faNetworkWired,
  faExclamationTriangle,
  faUserCircle,
  faChevronLeft,
  faChevronRight,
  faArrowCircleDown,
  faArrowCircleUp,
  faDollarSign,
  faInfoCircle,
  faCode,
  faSync,
  faPaperPlane,
  faQrcode,
  faUndo,
  faCopy,
  faExternalLinkAlt,
  faHistory,
  faWallet,
  faArrowLeft,
  faArrowRight,
  faHandHoldingUsd,
  faGlobeAfrica,
  faPlus,
  faRocket,
  faTerminal,
  faTools,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'

import {
  faTwitter,
  faDiscord,
  faGithub,
} from '@fortawesome/free-brands-svg-icons'

config.autoAddCss = false

const ICONS: Record<string, [string, string, IconDefinition]> = {
  plus: ['fas', 'plus', faPlus],
  twitter: ['fab', 'twitter', faTwitter],
  discord: ['fab', 'discord', faDiscord],
  github: ['fab', 'github', faGithub],
  web: ['fas', 'globe-africa', faGlobeAfrica],
  copy: ['fas', 'copy', faCopy ],
  config: ['fas', 'tools', faTools],
  dapp: ['fas', 'rocket', faRocket],
  'open-external': ['fas', 'external-link-alt', faExternalLinkAlt],
  close: ['fas', 'times', faTimes],
  remove: ['fas', 'times', faTimes],
  loading: ['fas', 'slash', faSlash ],
  money: ['fas', 'dollar-sign', faDollarSign],
  info: ['fas', 'info-circle', faInfoCircle],
  code: ['fas', 'code', faCode],
  back: ['fas', 'arrow-left', faArrowLeft],
  forward: ['fas', 'arrow-right', faArrowRight],
  connected: ['fas',  'network-wired', faNetworkWired ],
  'ledger-error': ['fas', 'exclamation-triangle', faExclamationTriangle],
  'connection-error': ['fas', 'exclamation-triangle', faExclamationTriangle ],
  'browser-tab-error': ['fas', 'exclamation-triangle', faExclamationTriangle],
  user: ['fas', 'user-circle', faUserCircle],
  receiveArrow: ['fas', 'arrow-circle-down', faArrowCircleDown],
  downChevron: ['fas', 'chevron-circle-down', faChevronCircleDown],
  sendArrow: ['fas', 'arrow-circle-up', faArrowCircleUp],
  send: ['fas', 'paper-plane', faPaperPlane],
  history: ['fas', 'history', faHistory],
  wallet: ['fas', 'wallet', faWallet],
  stake: ['fas', 'hand-holding-usd', faHandHoldingUsd],
  qrcode: ['fas', 'qrcode', faQrcode],
  refresh: ['fas', 'sync', faSync],
  undo: ['fas', 'undo', faUndo],
  devTools: ['fas', 'terminal', faTerminal ],
}

library.add(...(
  Object.values(ICONS).map(a => a[2])
))

interface Props {
  className?: string,
  name: string,
  spin?: boolean,
  title?: string,
}

const Icon: React.FunctionComponent<Props> = ({ className, name, spin, ...props }) => {
  if (!ICONS[name]) {
    return null
  }

  const ic: any = [ ICONS[name][0], ICONS[name][1] ]

  return <FontAwesomeIcon className={className} icon={ic} spin={spin} {...props} />
}

export default Icon