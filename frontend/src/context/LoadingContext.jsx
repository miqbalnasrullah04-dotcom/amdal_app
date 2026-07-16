import { createContext, useContext, useState, useCallback } from 'react';

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  // true = halaman sudah lapor "data siap"
  const [dataReady, setDataReady] = useState(false);

  // Dipanggil oleh halaman (Home, dst) setelah fetch datanya selesai
  const reportReady = useCallback(() => setDataReady(true), []);

  // Dipanggil oleh RouteLoader tiap kali pindah rute, supaya siklus mulai lagi dari awal
  const resetReady = useCallback(() => setDataReady(false), []);

  return (
    <LoadingContext.Provider value={{ dataReady, reportReady, resetReady }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function usePageLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error('usePageLoading harus dipakai di dalam <LoadingProvider>');
  }
  return ctx;
}