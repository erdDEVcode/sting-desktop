import Elrond from '@elrondnetwork/elrond-core-js'

import _ from './lodash'
import { Account, Network, NewTransaction, SignedTransaction } from '../types/all'
import * as ipcMethods from '../utils/ipc'

const bip39 = require('bip39')

const testAccount = (a: any) => {
  a.sign(new TextEncoder().encode('test message'))
}

export const generateMnemonic = (): string[] => {
  return new Elrond.account().generateMnemonic().split(' ')
}

export const deriveAccountFromMnemonic = (mnemonic: string): Account | null => {
  mnemonic = mnemonic.trim()

  if (!bip39.validateMnemonic(mnemonic)) {
    return null
  }

  try {
    let account = new Elrond.account()
    account.loadFromMnemonic(mnemonic)
    testAccount(account)
    return account
  } catch (err) {
    console.warn(`Error deriving from mnemonic: ${err.message}`)
    return null
  }
}


export const deriveAccountFromJsonKeyFileString = (json: string, password: string): Account | null => {
  json = json.trim()

  try {
    let account = new Elrond.account()
    account.loadFromKeyFile(JSON.parse(json), password)
    testAccount(account)
    return account
  } catch (err) {
    console.warn(`Error deriving from JSON: ${err.message}`)
  }

  return null
}

const PEM_REGEX = /-----BEGIN[^-]+-----([^-]+)-----END[^-]+/igm


export const deriveAccountFromPemFileString = (pem: string): Account | null => {
  try {
    const match = _.get(PEM_REGEX.exec(pem.trim()), '1', '').trim()
    if (match) {
      const bytes = Buffer.from(window.atob(match), 'hex')
      let account = new Elrond.account()
      account.loadFromPrivateKey(bytes)
      testAccount(account)
      return account
    }
  } catch (err) {
    console.warn(`Error deriving from PEM: ${err.message}`)
  }

  return null
}


export const signTx = async (account: Account, network: Network, tx: NewTransaction): Promise<SignedTransaction> => {
  const { nonce } = await network.connection.getAddress(account.address())

  const t = new Elrond.transaction(
    nonce,
    account.address(),
    tx.receiver,
    tx.value,
    parseInt(tx.gasPrice),
    parseInt(tx.gasLimit),
    tx.data,
    network.config!.chainId,
    1
  )

  const s = t.prepareForSigning()
  t.signature = await account.sign(s)

  const st = t.prepareForNode()
  return st
}


export const signAndSendTx = async (account: Account, network: Network, tx: NewTransaction): Promise<string> => {
  const st = await signTx(account, network, tx)

  return network.connection.sendTransaction(st)
}


export const isLedgerSupported = async () => {
  const { data, error } = await ipcMethods.isLedgerSupported()

  if (error) {
    throw new Error(error.message)
  }

  return data!.supported
}


class LedgerAccount implements Account {
  _address: string
  _hex: string

  constructor (address: string) {
    this._address = address
    const a = new Elrond.Account()
    this._hex = a.hexPublicKeyFromAddress(address)
  }

  get isLedger () {
    return true
  }

  address () {
    return this._address
  }

  async sign (tx: Buffer) {  
    const { error, data } = await ipcMethods.signTransactionWithLedger(tx)

    if (error) {
      throw new Error(error.message)
    }

    return data!.signedTransaction
  }
}


export const getLedgerAccount = async () => {
  const { data, error } = await ipcMethods.getLedgerAccount()

  if (error) {
    throw new Error(error.message)
  }

  return new LedgerAccount(data!.address)
}


export const addressToHexString = (address: string): string => {
  const a = new Elrond.account()
  return a.hexPublicKeyFromAddress(address)
}
