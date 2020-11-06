import React, { useCallback } from 'react'
import { useToasts } from 'react-toast-notifications'

import TrackTransactionToast from '../components/toasts/TrackTransactionToast'

export const useNotifications = () => {
  const { addToast } = useToasts()

  const notifyTrackTransactionStatus = useCallback((txHash: string) => {
    // add slight delay to wait for transaction to propagate through network
    addToast(<TrackTransactionToast txHash={txHash} />)
  }, [ addToast ])

  return { notifyTrackTransactionStatus }
}