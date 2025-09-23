import { ReactNode, useEffect, useState } from 'react';
import HeaderComponent from './Header';
import httpRequest from '../../global-utils/httpRequest';
import { usePermissionStore } from '../../zustand-store/PermissionStore';
import { useSettingsStore } from '../../zustand-store/SettingsStore';
import { SidebarComponent } from './Sidebar';
interface AuthenticatedLayoutIF {
    children: ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutIF> = ({ children }) => {
    const [showSidebar, setShowSidebar] = useState(false);
    const { setPermissions } = usePermissionStore();
    const { getUserSettings } = useSettingsStore();

    const updateRolePermission = async () => {
        const permissions: any = sessionStorage.getItem('permissions');
        const features = JSON.parse(permissions || '[]').map((feature: any) => {
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
