import React, { useEffect } from 'react';
import { GlobalAlert } from './components/alert/GlobalAlert';
import { ToastContainer } from './components/toast/ToastContainer';
import IndexRouter from './router';
import FullScreenLoader from './components/FullScreenLoader';
import { usePermissionStore } from './zustand-store/PermissionStore';
import httpRequest from './global-utils/httpRequest';

export const App: React.FC = () => {
  const { setPermissions } = usePermissionStore();
  const user = JSON.parse(window.sessionStorage.getItem('user') || '{}');
  useEffect(() => {
    const res: any = httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/role/${user?.role?._id}`);
    console.log('res.data?.features:===========', res.data?.features);
    setPermissions([
      'read:user',
      'update:user',
      'delete:user',
      'delete:record',
      'create:template',
      'update:template',
      'delete:template',
      'extract:document',
      'read:role',
      'update:role',
      'delete:role',
      'read:module',
      'update:module',
      'delete:module',
      'read:feature',
      'update:feature',
      'delete:feature',
      'read:tenant',
      'update:tenant',
      'delete:tenant',
      'read:subscription-model',
      'update:subscription-model',
      'delete:subscription-model',
    ]);
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
