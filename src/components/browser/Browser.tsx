import React, { useRef, useCallback, useEffect, useMemo, useState } from 'react'
import styled from '@emotion/styled'
import { flex } from 'emotion-styled-utils'

import {
  GlobalConsumer,
  GlobalContextValue,
  StorageConsumer,
  StorageContextValue,
} from '../../contexts'
import { Network, Account, Storage } from '../../types/all'
import { 
  CLOSE_TAB, 
  NEW_TAB, 
  GO_BACK, 
  GO_FORWARD, 
  RELOAD, 
  SHOW_NEXT_TAB, 
  SHOW_PREV_TAB, 
  TOGGLE_TAB_DEVTOOLS,
  OPEN_IN_EXTERNAL_BROWSER,
} from '../../common/constants/ipcUiTasks'
import { useBrowserTabs, BrowserTabStatus } from '../../hooks'
import { createBrowserUiTasksEmitter } from '../../utils/events'
import WebView from './WebView'
import TextInput from '../TextInput'
import IconButton from '../IconButton'
import { generateBrowserButtonTooltip } from '../../utils/string'
import LoadingIcon from '../LoadingIcon'
import { WebViewCallHandler } from './handler'
import ConfigModal from './ConfigModal'

const Container = styled.div`
  ${flex({ direction: 'column', justify: 'flex-start', align: 'stretch' })};
  height: 100%;
  width: 100%;
  position: relative;
  transition: none;
  
  ${(p: any) => {
    if (!p.isActive) {
      return `
        left: -100000px;
        top: -100000px;
        pointer-events: none;
        overflow: hidden;
        height: 0;
      `
    }
  }};  
`

const TopBar = styled.div`
  ${flex({ direction: 'row', justify: 'space-between', align: 'center' })};
  min-height: 2.3rem;
  max-height: 2.3rem;
  max-width: 100%;
`

const BrowserTabs = styled.div`
  ${flex({ direction: 'row', justify: 'flex-start', align: 'center' })};
  font-size: 0.6rem;
  flex: 1;
  height: 100%;
  padding: 0 0.4rem;
  overflow-x: scroll;
`

const Tab = styled.div`
  display: inline-block;
  ${flex({ direction: 'row', justify: 'space-between', align: 'center' })};
  padding: 1.4em 1em;
  text-align: left;
  height: 100%;
  min-width: 8rem;
  max-width: 12rem;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  background-color: ${(p: any) => p.active ? p.theme.browser.tab.active.bgColor : p.theme.browser.tab.inactive.bgColor};
  position: relative;
  border-right: 1px solid black;

  & > span {
    display: block;
    color: ${(p: any) => {
      if (p.active) {
        return p.theme.browser.tab.active.textColor;
      } else {
        return p.theme.browser.tab.inactive.textColor;
      }
    }};
    max-width: 80%;
    height: 100%;
    white-space: nowrap;
    overflow: hidden;
  }

  & > button {
    display: block;
    width: 1rem;
    height: 1rem;
    border: none;
    font-size: 0.5rem;
    opacity: 0;
    pointer-events: none;
  }

  &:hover {
    & > button {
      opacity: 1;
      pointer-events: auto;
    }
  }
`

const TabLoadingIcon = styled(LoadingIcon)`
  margin-right: 1em;
  padding: 0.1em 0.2em;
`

const TabErrorIconButton = styled(IconButton)`
  font-size: 0.9em;
  margin-right: 0.5em;
  padding: 0.1em 0.2em;
  border: none;
  box-shadow: none;
  color: ${(p: any) => p.theme.browser.tab.error.textColor};

  &:hover {
    box-shadow: none;
  }
`

const NewTabButton = styled(IconButton)`
  border: none;
  margin: 0 0.5rem;
  padding: 0.3em 0.4em;
  font-size: 0.5rem;
`

const ConfigButton = styled(IconButton)`
  border: none;
  margin: 0 0.6rem 0 1rem;
  padding: 0.3em 0.4em;
  font-size: 0.8rem;
`

const BrowserPageRenderer = styled.div`
  flex: 1;
  background-color: ${(p: any) => p.theme.content.bgColor};
  color: ${(p: any) => p.theme.content.textColor};
  position: relative;
`

const WebViewContainer = styled.div`
  position: absolute;
  top: ${(p: any) => p.active ? '0' : '-10000000px'};
  left: ${(p: any) => p.active ? '0' : '-10000000px'};
  width: 100%;
  height: 100%;
  pointer-events: ${(p: any) => p.active ? 'auto' : 'none'};
  overflow: hidden;
  transition: none;
`

const AddressBar = styled.div`
  background-color: ${(p: any) => p.theme.browser.tab.active.bgColor};
  color: ${(p: any) => p.theme.browser.tab.active.textColor};
  ${flex({ direction: 'row', justify: 'flex-start', align: 'center', basis: 0 })};
  padding: 0.6rem 0.5rem;

  button {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.7rem;
    margin: 0 0.2rem;
  }
`

const AddressInput = styled(TextInput)`
  font-size: 0.8rem;
  padding: 0.3em;
`

interface BrowserPageProps {
  isActive: boolean,
  activeAccount: Account | undefined,
  network: Network | null,
  storage: Storage,
}


const BrowserPage: React.FunctionComponent<BrowserPageProps> = ({ isActive, activeAccount, network, storage }) => {
  const [ showConfigModal, setShowConfigModal ] = useState(false)

  const { 
    tabs, 
    tabOrder,
    activeTab, 
    activateTab, 
    openTab, 
    closeTab,
    updateTabStatus, 
    updateTabTitle,
    updateTabUrl,
    updateTabPendingUrl,
  } = useBrowserTabs(window.inProductionMode ? [
    'https://erd.dev',
  ] : [
    'http://localhost:3003'
  ])

  const webViewCallHandler = useMemo(() => {
    if (activeAccount && network && !network.failure) {
      return new WebViewCallHandler(activeAccount, network, storage)
    } else {
      return null
    }
  }, [activeAccount, network, storage])

  const activeRef = useRef(null)

  const onLoading = useCallback(id => {
    updateTabStatus(id, BrowserTabStatus.LOADING)
  }, [ updateTabStatus ])

  const onLoaded = useCallback(id => {
    updateTabStatus(id, BrowserTabStatus.LOADED)
  }, [updateTabStatus])

  const onLoadingError = useCallback((id, desc) => {
    updateTabStatus(id, BrowserTabStatus.ERROR, desc)    
  }, [updateTabStatus])

  const onUrlChange = useCallback((id, url) => {
    updateTabUrl(id, url)
  }, [updateTabUrl])

  const onTitleChange = useCallback((id, title) => {
    updateTabTitle(id, title)
  }, [updateTabTitle])

  const onOpenNewWindow = useCallback((id, url) => {
    openTab(url, id)
  }, [openTab])

  const updatePendingUrl = useCallback(pendingUrl => {
    if (activeTab) {
      updateTabPendingUrl(activeTab!.id, pendingUrl)
    }
  }, [activeTab, updateTabPendingUrl ])

  const applyPendingUrl = useCallback(e => {
    if ('Enter' === e.key) {
      updateTabUrl(activeTab!.id, activeTab!.pendingUrl)
    }
  }, [ updateTabUrl, activeTab ])

  const refresh = useCallback(() => {
    if (activeRef.current) {
      (activeRef.current as any).refresh()
    }
  }, [ activeRef ])

  const openNewTab = useCallback(() => {
    onOpenNewWindow(tabOrder[tabOrder.length - 1], 'https://erd.dev')
  }, [tabOrder, onOpenNewWindow])

  const goBack = useCallback(() => {
    if (activeRef.current) {
      (activeRef.current as any).goBack()
    }
  }, [activeRef])

  const goForward = useCallback(() => {
    if (activeRef.current) {
      (activeRef.current as any).goForward()
    }
  }, [activeRef])

  const toggleDevTools = useCallback(() => {
    if (activeRef.current) {
      (activeRef.current as any).toggleDevTools()
    }
  }, [activeRef])

  const toggleConfig = useCallback(() => {
    setShowConfigModal(!showConfigModal)
  }, [showConfigModal ])

  const openInExternalBrowser = useCallback(() => {
    if (activeRef.current) {
      (activeRef.current as any).openInExternalBrowser()
    }
  }, [ activeRef ])

  const onUiTask = useCallback((id, uiTask) => {
    if (!activeRef.current) {
      return
    }

    switch (uiTask) {
      case RELOAD:
        refresh()
        break
      case GO_BACK:
        goBack()
        break
      case GO_FORWARD:
        goForward()
        break
      case CLOSE_TAB:
        closeTab(id || activeTab?.id)
        break
      case NEW_TAB:
        openNewTab()
        break
      case TOGGLE_TAB_DEVTOOLS:
        toggleDevTools()
        break
      case OPEN_IN_EXTERNAL_BROWSER:
        openInExternalBrowser()
        break
      case SHOW_NEXT_TAB:
        if (activeTab) {
          const index = tabOrder.indexOf(activeTab!.id)
          activateTab(tabOrder[index + 1 < tabOrder.length ? index + 1 : 0])
        }
        break
      case SHOW_PREV_TAB:
        if (activeTab) {
          const index = tabOrder.indexOf(activeTab!.id)
          activateTab(tabOrder[index - 1 >= 0 ? index - 1 : tabOrder.length - 1])
        }
        break
      default:
        // do nothing
    }
  }, [refresh, goBack, goForward, closeTab, activeTab, openNewTab, toggleDevTools, openInExternalBrowser, tabOrder, activateTab])

  useEffect(() => {
    const emitter = createBrowserUiTasksEmitter()
    emitter.events.on('uiTask', uiTask => {
      onUiTask(null, uiTask)
    })
    return () => {
      emitter.destroy()
    }
  }, [onUiTask])

  return (
    <Container isActive={isActive}>
      <TopBar>
        <BrowserTabs>
          {tabOrder.map(id => (
            <Tab
              key={id}
              active={id === activeTab!.id}
              onClick={() => activateTab(id)}
            >
              <span title={tabs[id].title}>
                {tabs[id].status === BrowserTabStatus.LOADING ? (
                  <TabLoadingIcon
                    title='Loading ...'
                  />
                ) : null}
                {tabs[id].status === BrowserTabStatus.ERROR ? (
                  <TabErrorIconButton
                    tooltip='View error'
                    icon='browser-tab-error'
                    onClick={() => alert(`Error: ${tabs[id].statusMessage}`)}
                  />
                ) : null}
                {tabs[id].title}
              </span>
              {1 < tabOrder.length ? (
                <IconButton icon='close' tooltip={generateBrowserButtonTooltip(CLOSE_TAB)} onClick={() => closeTab(id)} />
              ) : null}
            </Tab>
          ))}
          <NewTabButton
            icon='plus'
            onClick={openNewTab}
            tooltip={generateBrowserButtonTooltip(NEW_TAB)}
          />
        </BrowserTabs>
        <ConfigButton icon='config' onClick={toggleConfig} tooltip='Open browser settings' />
        <ConfigModal 
          isOpen={showConfigModal} 
          onRequestClose={toggleConfig} 
          storage={storage}
        />
      </TopBar>
      {tabOrder.length ? (
        <AddressBar>
          <AddressInput 
            value={activeTab!.pendingUrl} 
            onChange={updatePendingUrl} 
            onKeyPress={applyPendingUrl}
          />
          <IconButton icon='refresh' tooltip={generateBrowserButtonTooltip(RELOAD)} onClick={refresh} />
          <IconButton icon='back' tooltip={generateBrowserButtonTooltip(GO_BACK)} onClick={goBack} />
          <IconButton icon='forward' tooltip={generateBrowserButtonTooltip(GO_FORWARD)} onClick={goForward} />
          <IconButton icon='devTools' tooltip={generateBrowserButtonTooltip(TOGGLE_TAB_DEVTOOLS)} onClick={toggleDevTools} />
          <IconButton icon='open-external' tooltip={generateBrowserButtonTooltip(OPEN_IN_EXTERNAL_BROWSER)} onClick={openInExternalBrowser} />
        </AddressBar>
      ) : null}
      <BrowserPageRenderer>
        {Object.values(tabs).map(({ id, url }) => (
          <WebViewContainer
            key={id}
            active={id === activeTab!.id}
          >
            <WebView
              ref={id === activeTab!.id ? activeRef : null}
              url={url}
              ctx={id}
              account={activeAccount}
              network={network}
              onUiTask={onUiTask}
              onLoading={onLoading}
              onLoaded={onLoaded}
              onLoadingError={onLoadingError}
              onUrlChange={onUrlChange}
              onTitleChange={onTitleChange}
              onOpenNewWindow={onOpenNewWindow}
              callHandler={webViewCallHandler}
            />
          </WebViewContainer>
        ))}
      </BrowserPageRenderer>
    </Container>
  )
}

interface Props {
  isActive: boolean,
}


const Browser: React.FunctionComponent<Props> = ({ isActive }) => {
  return (
    <GlobalConsumer>
      {({ network, activeAccount }: GlobalContextValue) => (
        <StorageConsumer>
          {(storage: StorageContextValue) => (
            <BrowserPage
              isActive={isActive}
              network={network}
              activeAccount={activeAccount}
              storage={storage}
            />
          )}
        </StorageConsumer>
      )}
    </GlobalConsumer>
  )
}

export default Browser