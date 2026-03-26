import { ReactNode, useEffect, useState } from 'react';
import HeaderComponent from './Header';
import { usePermissionStore } from '../../zustand-store/PermissionStore';
import { SidebarComponent } from './Sidebar';
import { config } from '../../config/default';
interface AuthenticatedLayoutIF {
    children: ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutIF> = ({ children }) => {
    const [showSidebar, setShowSidebar] = useState(false);
    const { setPermissions } = usePermissionStore();

    const updateRolePermission = async () => {
        const permissions: any = sessionStorage.getItem('permissions');
        const features = JSON.parse(permissions || '[]').map((feature: any) => {
            return feature.key;
        });
        setPermissions(features);
    };
    const updateUserSettingsHandler = async () => {};

    const agentRoute = window.location.pathname.includes('agent');

    useEffect(() => {
        updateRolePermission();
        updateUserSettingsHandler();

        const checkPhpSession = async () => {
            if (config.usePhpSessionApi) { // Remote API Check
                try {
                    const res = await fetch('http://localhost:8085/check-session.php', {
                        method: 'GET',
                        credentials: 'include'
                    });
                    const data = await res.json();
                    if (data && data.active === false) {
                        window.sessionStorage.clear();
                        window?.location?.replace('/auth/logout-message');
                    }
                } catch (error) {
                    // Fail silently to prevent disruptions if API is down
                }
            } else { // Local TTL Check
                const loginTime = window.sessionStorage.getItem('reactLoginTime');
                if (loginTime) {
                    const elapsedMs = Date.now() - parseInt(loginTime, 10);
                    if (elapsedMs > 30000) {  // 30 seconds
                        window.sessionStorage.clear();
                        window?.location?.replace('/auth/logout-message');
                    }
                }
            }
        };

        const intervalId = setInterval(checkPhpSession, 5000); // Check every 5 seconds
        
        // Check once immediately on load
        checkPhpSession();

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex h-full w-screen flex-col">
            <HeaderComponent showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
            <div className="flex h-screen w-full overflow-y-auto">
                {!agentRoute && <SidebarComponent showSidebar={showSidebar} setShowSidebar={setShowSidebar} />}
                {children}
            </div>
        </div>
    );
};

export default AuthenticatedLayout;
