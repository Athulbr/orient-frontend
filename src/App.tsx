import React, { useEffect } from 'react';
import { GlobalAlert } from './components/alert/GlobalAlert';
import { ToastContainer } from './components/toast/ToastContainer';
import IndexRouter from './router';
import FullScreenLoader from './components/FullScreenLoader';
import { usePermissionStore } from './zustand-store/PermissionStore';

export const App: React.FC = () => {
  const { setPermissions } = usePermissionStore();
  useEffect(() => {
    setPermissions(['create:template', 'read:template', 'update:template', 'delete:template']);
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
