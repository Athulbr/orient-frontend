import { ReactNode, useEffect, useState } from 'react';
import SidebarComponent from './Sidebar';
import HeaderComponent from './Header';
import httpRequest from '../../global-utils/httpRequest';
import { usePermissionStore } from '../../zustand-store/PermissionStore';
import { useSettingsStore } from '../../zustand-store/SettingsStore';
interface AuthenticatedLayoutIF {
    children: ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutIF> = ({ children }) => {
    const [showSidebar, setShowSidebar] = useState(false);
    const { setPermissions } = usePermissionStore();
    const { getUserSettings } = useSettingsStore();
    const user = JSON.parse(window.sessionStorage.getItem('user') || '{}');

    const updateRolePermission = async () => {
        const res: any = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/role/${user?.role?._id}`);
        const features = res.data?.features.map((feature: any) => {
            return feature.key;
        });
        setPermissions(features);
    };
    const updateUserSettingsHandler = async () => {
        await getUserSettings();
    };

    useEffect(() => {
        updateRolePermission();
        updateUserSettingsHandler();
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
