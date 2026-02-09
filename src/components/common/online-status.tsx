'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export function OnlineStatus() {
  const { isOnline, isSyncing } = useAppStore();
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  useEffect(() => {
    if (isOnline && !isSyncing) {
      setShowOnlineMessage(true);
      const timer = setTimeout(() => setShowOnlineMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, isSyncing]);

  if (isOnline && !isSyncing && !showOnlineMessage) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {!isOnline && (
        <div className="bg-yellow-500 text-yellow-950 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4" />
          <span>오프라인 모드 - 데이터는 자동으로 동기화됩니다</span>
        </div>
      )}

      {isOnline && isSyncing && (
        <div className="bg-blue-500 text-blue-950 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>동기화 중...</span>
        </div>
      )}

      {isOnline && !isSyncing && showOnlineMessage && (
        <div className="bg-green-500 text-green-950 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top duration-300">
          <Wifi className="h-4 w-4" />
          <span>온라인으로 전환되었습니다</span>
        </div>
      )}
    </div>
  );
}
