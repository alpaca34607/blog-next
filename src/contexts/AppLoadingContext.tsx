"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface AppLoadingContextValue {
  pendingCount: number;
  startTask: () => void;
  endTask: () => void;
}

const AppLoadingContext = createContext<AppLoadingContextValue | null>(null);

export const AppLoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [pendingCount, setPendingCount] = useState(0);

  const startTask = useCallback(() => {
    setPendingCount((count) => count + 1);
  }, []);

  const endTask = useCallback(() => {
    setPendingCount((count) => (count > 0 ? count - 1 : 0));
  }, []);

  const value = useMemo(
    () => ({
      pendingCount,
      startTask,
      endTask,
    }),
    [pendingCount, startTask, endTask]
  );

  return (
    <AppLoadingContext.Provider value={value}>
      {children}
    </AppLoadingContext.Provider>
  );
};

export const useAppLoading = (): AppLoadingContextValue => {
  const ctx = useContext(AppLoadingContext);
  if (!ctx) {
    throw new Error("useAppLoading 必須在 AppLoadingProvider 內使用");
  }
  return ctx;
};

