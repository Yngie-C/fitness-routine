'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/stores/app-store';
import { processSyncQueue, pullFromServer } from '@/lib/offline/sync-manager';

const AUTH_PATHS = ['/login', '/signup', '/auth'];

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { setOnline, setSyncing, setSyncError } = useAppStore();
  const syncInProgress = useRef(false);
  const pathname = usePathname();

  const isAuthPage = AUTH_PATHS.some((p) => pathname?.startsWith(p));

  const performSync = useCallback(async () => {
    if (syncInProgress.current) return;

    syncInProgress.current = true;
    setSyncing(true);
    setSyncError(null);

    try {
      // Push local changes to server
      await processSyncQueue();

      // Pull server changes
      await pullFromServer();
    } catch (error) {
      console.error('Sync error:', error);
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setSyncing(false);
      syncInProgress.current = false;
    }
  }, [setSyncing, setSyncError]);

  useEffect(() => {
    // Initialize online status
    if (typeof window !== 'undefined') {
      setOnline(navigator.onLine);
    }

    // Skip sync on auth pages
    if (isAuthPage) return;

    // Online event handler
    const handleOnline = () => {
      setOnline(true);
      performSync();
    };

    // Offline event handler
    const handleOffline = () => {
      setOnline(false);
    };

    // Visibility change handler - sync when app comes to foreground
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        performSync();
      }
    };

    // Register event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Perform initial sync if online
    if (navigator.onLine) {
      performSync();
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setOnline, performSync, isAuthPage]);

  return <>{children}</>;
}
