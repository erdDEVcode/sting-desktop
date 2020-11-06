import React, { useCallback } from 'react'
import styled from '@emotion/styled'
import { ToastProvider, ToastProps } from 'react-toast-notifications'

const ToastContainer = styled.div`
  margin-bottom: 0.3rem;
`

export interface NotificationsContextValue {
}

const Context = React.createContext({} as NotificationsContextValue)

const CustomToast: React.FunctionComponent<ToastProps> = ({ children, onDismiss: closeNow }) => {
  const c: any = React.Children.only(children)

  const closeAfter = useCallback((delayMs: number) => {
    return setTimeout(() => {
      closeNow && closeNow()
    }, delayMs)
  }, [ closeNow ])

  const child = React.cloneElement(c, { 
    closeNow,
    closeAfter, 
  })

  return (
    <ToastContainer>
      {child}
    </ToastContainer>
  )
}

export const NotificationsProvider: React.FunctionComponent = ({ children }) => {
  return (
    <Context.Provider value={{}}>
      <ToastProvider components={{ Toast: CustomToast }} autoDismissTimeout={5000} placement='top-right'>
        {children}
      </ToastProvider>
    </Context.Provider>
  )
}

export const NotificationsConsumer = Context.Consumer
