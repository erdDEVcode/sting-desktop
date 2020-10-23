const { makeConstants } = require('../utils')

exports.WALLET_PROCESS = makeConstants([
  'OPEN_PASSPHRASE',
  'OPEN_PEMJSON',
  'OPEN_LEDGER',
  'CREATE_PASSPHRASE',
])

exports.DASHBOARD_MENU = [
  { id: 'OVERVIEW' },
  { id: 'SEND' },
//  { id: 'TRANSACTIONS' },
  { id: 'DAPPS', experimental: true },
]

exports.PROTOCOL = {
  META_SHARD_ID: 4294967295
}

