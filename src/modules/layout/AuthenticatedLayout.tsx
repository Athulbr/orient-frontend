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

        const triggerSessionEnded = () => {
            window.sessionStorage.clear();
            window?.location?.replace('/auth/logout-message');
        };

        const executeSessionCheck = async () => {
            if (config.usePhpSessionApi) { 
                try {
                    const res = await fetch('http://localhost:8085/auth/session-status.php', {
                        method: 'GET',
                        credentials: 'include'
                    });
                    console.log('res:===========', res);
                    if (!res.ok) triggerSessionEnded();
                } catch (error) {
                    triggerSessionEnded();
                }
            } else { 
                const loginTime = window.sessionStorage.getItem('reactLoginTime');
                if (loginTime) {
                    const elapsedMs = Date.now() - parseInt(loginTime, 60);
                    if (elapsedMs > 60000) triggerSessionEnded();
                }
            }
        };

        // [07] Layer 1: Check session on initial application component wrapper load
        executeSessionCheck();

        // Fire session-status on visibilitychange event when tab becomes visible
        const visibilityHandler = () => {
            if (document.visibilityState === 'visible') {
                executeSessionCheck();
            }
        };
        document.addEventListener('visibilitychange', visibilityHandler);

        // Layer 3: Fallback Poller safety net 
        // using 60 seconds (60000ms) frequency check
        const fallBackPollerId = setInterval(executeSessionCheck, 60000);

        return () => {
            document.removeEventListener('visibilitychange', visibilityHandler);
            clearInterval(fallBackPollerId);
        };
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
