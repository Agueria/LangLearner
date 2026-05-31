import { useEffect } from 'react';
import { useAuth, useCloudSync } from '../hooks';

// Bu component hic UI render etmez; sadece side effect yonetir.
// Auth ve network durumu uygun oldugunda useCloudSync.syncNow() cagirarak
// offline queue'nun Firestore'a gitmesini saglar.
export function CloudSyncController() {
  const { status, user } = useAuth();
  const { isOnline, ownerId, pendingCount, status: syncStatus, syncNow } =
    useCloudSync();

  useEffect(() => {
    if (status !== 'authenticated' || !isOnline) {
      // Kullanici login degilse veya internet yoksa cloud sync denemeyiz.
      return;
    }

    if (ownerId !== user?.id || pendingCount > 0 || syncStatus === 'idle') {
      // Owner degisti: cloud'dan hydrate et.
      // Pending queue var: offline islemleri replay et.
      // idle: ilk acilista sync durumunu kontrol et.
      syncNow();
    }
  }, [isOnline, ownerId, pendingCount, status, syncNow, syncStatus, user?.id]);

  return null;
}
