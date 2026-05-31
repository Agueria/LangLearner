import { useEffect } from 'react';
import { useAuth, useCloudSync } from '../hooks';

export function CloudSyncController() {
  const { status, user } = useAuth();
  const { isOnline, ownerId, pendingCount, status: syncStatus, syncNow } =
    useCloudSync();

  useEffect(() => {
    if (status !== 'authenticated' || !isOnline) {
      return;
    }

    if (ownerId !== user?.id || pendingCount > 0 || syncStatus === 'idle') {
      syncNow();
    }
  }, [isOnline, ownerId, pendingCount, status, syncNow, syncStatus, user?.id]);

  return null;
}
