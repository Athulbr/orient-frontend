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
    const [logoutWarningSeconds, setLogoutWarningSeconds] = useState<number | null>(null);
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
            const isOrientSSO = !!window.sessionStorage.getItem('orientClientId');
            window.sessionStorage.clear();
            const redirectTarget = isOrientSSO ? '/auth/logout-message' : '/auth/login';
            window?.location?.replace(redirectTarget);
        };

        let lastUserActivityTime = Date.now();
        const updateActivity = () => { lastUserActivityTime = Date.now(); };
        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);
        window.addEventListener('click', updateActivity);
        window.addEventListener('scroll', updateActivity);

        let isWarningActive = false;
        const handleSessionDeath = () => {
            if (isWarningActive) return;
            isWarningActive = true;
            let secs = 15;
            setLogoutWarningSeconds(secs);
            const countdownId = setInterval(() => {
                secs--;
                if (secs <= 0) {
                    clearInterval(countdownId);
                    triggerSessionEnded();
                } else {
                    setLogoutWarningSeconds(secs);
                }
            }, 1000);
        };

        const executeSessionCheck = async () => {
            if (isWarningActive) return; // Halt repeated checks during countdown

            const loginTime = window.sessionStorage.getItem('reactLoginTime');
            if (!loginTime) return;

            const makezSessionLimitMs = config.sessionTTLSeconds * 1000;
            const elapsedMs = Date.now() - parseInt(loginTime, 10);
            
            // Check if user was actively interacting with Makez during the local timeout window
            const isUserActiveLocally = (Date.now() - lastUserActivityTime) < makezSessionLimitMs;

            // Just before expiry of makez session, OR if Makez has already locally expired 
            // due to being a sleeping background tab, ping Orient to check/extend the session.
            if (elapsedMs >= makezSessionLimitMs - 15000 && config.usePhpSessionApi) {
                try {
                    const orientClientId = window.sessionStorage.getItem('orientClientId') || '';
                    
                    // Ping Orient to retrieve session status 
                    // const url = `${config.orientSessionApi}?session_id=${orientClientId}`;
                    const url = `https://www.orientexchange.in/branch/session_status?user_id=banw@orientexchange.in&client_id=${orientClientId}`;
                    console.log('url', url);
                    const res = await fetch(url, {
                        method: 'GET',
                        credentials: 'omit' // No longer strictly need cookies since we explicitly pass session_id
                    });
                    
                    if (res.ok) {
                        // Orient guarantees valid session. Check our local activity.
                        if (isUserActiveLocally) {
                            // User is actively working in Makez, extend Makez session
                            window.sessionStorage.setItem('reactLoginTime', Date.now().toString());
                        } else {
                            // User left Makez untouched completely and Makez has now timed out!
                            handleSessionDeath();
                        }
                    } else {
                        // Orient session status is officially closed.
                        handleSessionDeath();
                    }
                } catch (error) {
                    handleSessionDeath();
                }
            } else if (!config.usePhpSessionApi && elapsedMs > makezSessionLimitMs) {
                // strict fallback mapping entirely ignoring the server if disabled natively
                handleSessionDeath();
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
        // using 1 second (1000ms) frequency check allowing precise sub-second bounds evaluations flawlessly before actual expiry bounds
        const fallBackPollerId = setInterval(executeSessionCheck, 1000);

        return () => {
            document.removeEventListener('visibilitychange', visibilityHandler);
            clearInterval(fallBackPollerId);
        };
    }, []);

    return (
        <div className="flex h-full w-screen flex-col">
            {logoutWarningSeconds !== null && (
                <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-1 rounded-md bg-red-600 px-6 py-4 text-white shadow-2xl">
                    <p className="text-[16px] font-bold">Orient Session About to Expire</p>
                    <p className="text-sm">Makez will automatically log out in {logoutWarningSeconds} seconds.</p>
                </div>
            )}
            <HeaderComponent showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
            <div className="flex h-screen w-full overflow-y-auto">
                {!agentRoute && <SidebarComponent showSidebar={showSidebar} setShowSidebar={setShowSidebar} />}
                {children}
            </div>
        </div>
    );
};

export default AuthenticatedLayout;
