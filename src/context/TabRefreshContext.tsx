import { ReactNode, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export const MAIN_TAB_NAMES = ['explore', 'reels', 'home', 'news', 'ai-studio'] as const;
export type MainTabName = (typeof MAIN_TAB_NAMES)[number];

interface RefreshState {
  tab: MainTabName;
  requestId: number;
}

interface TabRefreshContextValue {
  refreshState: RefreshState | null;
  refreshTab: (tab: MainTabName) => void;
}

const TabRefreshContext = createContext<TabRefreshContextValue | undefined>(undefined);

export function TabRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshState, setRefreshState] = useState<RefreshState | null>(null);
  const requestId = useRef(0);

  const refreshTab = useCallback((tab: MainTabName) => {
    requestId.current += 1;
    setRefreshState({ tab, requestId: requestId.current });
  }, []);

  return (
    <TabRefreshContext.Provider value={{ refreshState, refreshTab }}>
      {children}
    </TabRefreshContext.Provider>
  );
}

export function useTabRefresh() {
  const context = useContext(TabRefreshContext);
  if (!context) {
    throw new Error('useTabRefresh must be used within TabRefreshProvider');
  }
  return context;
}

/** Runs only when the currently-focused tab is tapped again. */
export function useTabReselect(tab: MainTabName, onReselect: () => void) {
  const { refreshState } = useTabRefresh();
  const handledRequestId = useRef(0);

  useEffect(() => {
    if (refreshState?.tab === tab && refreshState.requestId !== handledRequestId.current) {
      handledRequestId.current = refreshState.requestId;
      onReselect();
    }
  }, [onReselect, refreshState, tab]);
}
