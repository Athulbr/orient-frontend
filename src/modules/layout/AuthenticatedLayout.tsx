import { ReactNode, useEffect, useState } from 'react';
import SidebarComponent from './Sidebar';
import HeaderComponent from './Header';
import httpRequest from '../../global-utils/httpRequest';
import { usePermissionStore } from '../../zustand-store/PermissionStore';

interface AuthenticatedLayoutIF {
  children: ReactNode;
}

const permissions = [
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
];

const AuthenticatedLayout: React.FC<AuthenticatedLayoutIF> = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const { setPermissions } = usePermissionStore();
  const user = JSON.parse(window.sessionStorage.getItem('user') || '{}');

  const updateRolePermission = async () => {
    const res: any = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/role/${user?.role?._id}`);
    console.log('res.data?.features:===========', res.data?.features);
    // setPermissions( res.data?.features);
    setPermissions(permissions);
  };

  useEffect(() => {
    updateRolePermission();
  }, []);

  return (
    <div className="flex h-full w-screen flex-col">
      <HeaderComponent showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <div className="flex h-screen w-full overflow-y-auto">
        <SidebarComponent showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
        {children}
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
