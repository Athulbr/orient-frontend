import React, { useEffect } from 'react';
import { GlobalAlert } from './components/alert/GlobalAlert';
import { ToastContainer } from './components/toast/ToastContainer';
import IndexRouter from './router';
import FullScreenLoader from './components/FullScreenLoader';
import { usePermissionStore } from './zustand-store/PermissionStore';

export const App: React.FC = () => {
  const { setPermissions } = usePermissionStore();
  const permissions = window.sessionStorage.getItem('permissions') || '[]';
  useEffect(() => {
    setPermissions(['read:user', 'update:user', 'delete:user', 'delete:record']);
    // setPermissions(JSON.parse(permissions));
  }, []);
  return (
    <div className="h-screen w-screen">
      <IndexRouter />
      <React.Suspense fallback={<FullScreenLoader />}>
        <GlobalAlert />
        <ToastContainer />
      </React.Suspense>
    </div>
  );
};
