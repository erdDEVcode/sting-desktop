import Dexie from 'dexie'
import React, { useCallback, useMemo } from 'react'

import { Wallet, Dapp, Storage } from '../types/all'
import { sha3 } from '../utils/string'

export interface StorageContextValue extends Storage {
}

const StorageContext = React.createContext({} as StorageContextValue)

const createDb = (name: string): Dexie => {
  const db = new Dexie(name)
  db.version(3).stores({
    dapps: `id,date`
  })
  return db
}

interface Props {
  wallet?: Wallet,
}

export const StorageProvider: React.FunctionComponent<Props> = ({ children, wallet }) => {
  const db = useMemo(() => {
    if (wallet) {
      return createDb(sha3(wallet!.address()))
    } else {
      return null
    }
  }, [ wallet ])

  const allowDapp = useCallback(async (dapp: Dapp) => {
    if (db) {
      await db.table('dapps').put({ id: dapp.id, title: dapp.title, date: Date.now() }, 'id')
    }
  }, [ db ])

  const disallowDapp = useCallback(async (dapp: Dapp) => {
    if (db) {
      await db.table('dapps').where('id').equals(dapp.id).delete()
    }
  }, [db])

  const isDappAllowed = useCallback(async (dapp: Dapp) => {
    if (db) {
      const c = await db.table('dapps').where('id').equals(dapp.id).count()
      return 0 < c
    } else {
      return false
    }
  }, [db])

  const getAllowedDapps = useCallback(async () => {
    if (db) {
      const ret = await db.table('dapps').reverse().sortBy('date')
      return ret
    } else {
      return []
    }
  }, [ db ])

  return (
    <StorageContext.Provider value={{
      allowDapp,
      disallowDapp,
      isDappAllowed,
      getAllowedDapps,
    }}>
      {children}
    </StorageContext.Provider>
  )
}

export const StorageConsumer = StorageContext.Consumer

