import Elrond from '@elrondnetwork/elrond-core-js'

import _ from './lodash'
import { Wallet, Network, Transaction, SignedTransaction, TransactionReceipt } from '../types/all'
import * as ipcMethods from '../utils/ipc'

const bip39 = require('bip39')

const validateAccount = (a: any) => {
  a.sign(new TextEncoder().encode('test message'))
}

export const generateMnemonic = (): string[] => {
  return new Elrond.account().generateMnemonic().split(' ')
}

export const deriveWalletFromMnemonic = (mnemonic: string): Wallet | null => {
  mnemonic = mnemonic.trim()

  if (!bip39.validateMnemonic(mnemonic)) {
    return null
  }

  try {
    let account = new Elrond.account()
    account.loadFromMnemonic(mnemonic)
    validateAccount(account)
    return account
  } catch (err) {
    console.warn(`Error deriving from mnemonic: ${err.message}`)
    return null
  }
}


export const deriveWalletFromJsonKeyFileString = (json: string, password: string): Wallet | null => {
  json = json.trim()

  try {
    let account = new Elrond.account()
    account.loadFromKeyFile(JSON.parse(json), password)
    validateAccount(account)
    return account
  } catch (err) {
    console.warn(`Error deriving from JSON: ${err.message}`)
  }

  return null
}

const PEM_REGEX = /-----BEGIN[^-]+-----([^-]+)-----END[^-]+/igm


export const deriveWalletFromPemFileString = (pem: string): Wallet | null => {
  try {
    const match = _.get(PEM_REGEX.exec(pem.trim()), '1', '').trim()
    if (match) {
      const bytes = Buffer.from(window.atob(match), 'hex')
      let account = new Elrond.account()
      account.loadFromPrivateKey(bytes)
      validateAccount(account)
      return account
    }
  } catch (err) {
    console.warn(`Error deriving from PEM: ${err.message}`)
  }

  return null
}


export const signTx = async (wallet: Wallet, network: Network, tx: Transaction): Promise<SignedTransaction> => {
  const { nonce } = await network.connection.getAddress(wallet.address())

  const t = new Elrond.transaction(
    nonce,
    wallet.address(),
    tx.receiver,
    tx.value,
    parseInt(`${tx.gasPrice!}`, 10),
    parseInt(`${tx.gasLimit!}`, 10),
    tx.data,
    network.config!.chainId,
    1
  )

  const s = t.prepareForSigning()
  t.signature = await wallet.sign(s)

  const st = t.prepareForNode()
  return st
}


export const isLedgerSupported = async () => {
  const { data, error } = await ipcMethods.isLedgerSupported()

  if (error) {
    throw new Error(error.message)
  }

  return data!.supported
}


class LedgerWallet implements Wallet {
  _address: string
  _hex: string

  constructor (address: string) {
    this._address = address
    const a = new Elrond.account()
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


export const getLedgerWallet = async () => {
  const { data, error } = await ipcMethods.getLedgerWallet()

  if (error) {
    throw new Error(error.message)
  }

  return new LedgerWallet(data!.address)
}


export const addressToHexString = (address: string): string => {
  const a = new Elrond.account()
  return a.hexPublicKeyFromAddress(address)
}
