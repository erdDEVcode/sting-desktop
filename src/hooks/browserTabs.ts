import { useState, useCallback } from 'react'
import { v4 as uuid } from 'uuid'

export enum BrowserTabStatus {
  LOADING = 1,
  LOADED,
  ERROR,
}

export interface BrowserTab {
  id: string,
  title: string,
  url: string,
  pendingUrl: string,
  status: BrowserTabStatus,
  statusMessage?: string,
}

type BrowserTabMap = Record<string, BrowserTab>

interface UseBrowserTabsResult {
  tabs: BrowserTabMap,
  tabOrder: string[],
  activeTab: BrowserTab | undefined,
  activateTab: (id: string) => void,
  openTab: (url: string, afterId?: string) => void,
  closeTab: (id: string) => void,
  updateTabStatus: (id: string, status: BrowserTabStatus, statusMessage?: string) => void,
  updateTabUrl: (id: string, url: string) => void,
  updateTabPendingUrl: (id: string, pendingUrl: string) => void,
  updateTabTitle: (id: string, title: string) => void,
}

const createNewTab = (url: string): BrowserTab => ({
  id: uuid(),
  title: url,
  url,
  pendingUrl: url,
  status: BrowserTabStatus.LOADING,
})

const updateTabData = ({
  tabs, 
  tabOrder,
  setTabs,
  setTabOrder,
}: {
  tabs?: BrowserTabMap,
  tabOrder?: string[],
  setTabs?: (v: BrowserTabMap) => void,
  setTabOrder?: (v: string[]) => void,
}) => {
  if (tabs && setTabs) {
    setTabs(Object.assign({}, tabs))
  }

  if (tabOrder && setTabOrder) {
    setTabOrder(tabOrder.concat([]))
  }
} 


export const useBrowserTabs = (initialTabs: string[]): UseBrowserTabsResult => {
  const [tabs, setTabs] = useState<BrowserTabMap>(
    initialTabs.reduce((m, url) => {
      const t = createNewTab(url)
      ;(m as BrowserTabMap)[t.id] = t
      return m
    }, {})
  )

  const [tabOrder, setTabOrder] = useState<string[]>(Object.keys(tabs))

  const [activeTab, setActiveTab] = useState<BrowserTab | undefined>(tabOrder.length ? tabs[tabOrder[0]] : undefined)

  const openTab = useCallback((url: string, afterId?: string) => {
    const afterIndex = afterId ? tabOrder.indexOf(afterId) : tabOrder.length - 1

    const t = createNewTab(url)
    tabs[t.id] = t
    tabOrder.splice(afterIndex + 1, 0, t.id)

    updateTabData({ tabs, tabOrder, setTabs, setTabOrder })
  }, [ tabs, tabOrder ])

  const closeTab = useCallback((id: string) => {
    if (!tabs[id] || tabOrder.length <= 1) {
      return
    }

    delete tabs[id]
    const tabIndex = tabOrder.indexOf(id)
    tabOrder.splice(tabIndex, 1)

    updateTabData({ tabs, tabOrder, setTabs, setTabOrder })

    // if it was active
    if (activeTab?.id === id) {
      let tabToActivate = tabIndex

      // activate one after it, unless we're at the end
      if (tabToActivate >= tabOrder.length) {
        // in which activate last tab
        tabToActivate = tabOrder.length - 1
      }

      // if can activate atleast 1 tab
      if (0 <= tabToActivate) {
        setActiveTab(tabs[tabOrder[tabToActivate]])
      } else {
        // else no tab is active since we have no tabs!
        setActiveTab(undefined)
      }
    }
  }, [ tabs, tabOrder, activeTab ])

  const activateTab = useCallback((id: string) => {
    if (!tabs[id]) {
      return
    }

    setActiveTab(tabs[id])
  }, [tabs])

  const updateTabStatus = useCallback((id: string, status: BrowserTabStatus, statusMessage?: string) => {
    if (!tabs[id]) {
      return
    }

    tabs[id].status = status
    tabs[id].statusMessage = statusMessage

    updateTabData({ tabs, setTabs })
  }, [tabs])

  const updateTabTitle = useCallback((id: string, title: string) => {
    if (!tabs[id]) {
      return
    }

    tabs[id].title = title
    delete tabs[id].statusMessage

    updateTabData({ tabs, setTabs })
  }, [tabs])

  const updateTabUrl = useCallback((id: string, url: string) => {
    if (!tabs[id]) {
      return
    }

    // ensure URL is valid
    try {
      new URL(url)
    } catch (_ignore) {
      if (0 <= url.indexOf('.')) {
        url = `http://${url}`
      } else {
        url = `https://www.google.com/search?q=${url}`
      }
    }

    tabs[id].url = url
    tabs[id].pendingUrl = url
    tabs[id].title = url
    tabs[id].status = BrowserTabStatus.LOADING
    delete tabs[id].statusMessage

    updateTabData({ tabs, setTabs })
  }, [tabs])

  const updateTabPendingUrl = useCallback((id: string, pendingUrl: string) => {
    if (!tabs[id]) {
      return
    }

    tabs[id].pendingUrl = pendingUrl

    updateTabData({ tabs, setTabs })
  }, [tabs])

  return { 
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
  }
}
