import { CircleUser, Menu } from 'lucide-react';
import { MakezLogoHeader } from '../../assets/svg-icons/MakezLogoHeader';
import { useToastStore } from '../../components/toast/ToastStore';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from '../../components/Dropdown';
import ExtractionFloatingWindowNew from '../docsnap/upload-document-new/ExtractionFloatingWindow';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import httpRequest from '../../global-utils/httpRequest';
import { SingleSelect } from '../../components/SingleSelect';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../zustand-store/SettingsStore';
import { cn } from '../../global-utils/twMerge';
import { config } from '../../config/default';

interface HeaderComponentIF {
    showSidebar?: boolean;
    setShowSidebar: (state: boolean) => void;
}

const HeaderComponent: React.FC<HeaderComponentIF> = ({ showSidebar, setShowSidebar }) => {
    const toast = useToastStore();
    const navigate = useNavigate();
    const { instance } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const [tenantList, setTenantList] = useState([]);
    const { setSelectedTenant } = useSettingsStore();
    const selectedTenantFromSessionStorage = window?.sessionStorage?.getItem('selectedTenant') || '';

    const user = JSON.parse(window?.sessionStorage.getItem(`${'user'}`) as string);
    useEffect(() => {
        if (user?.role?.name !== 'superadmin') return;
        const getTenantList = async () => {
            const res = await httpRequest('POST', `${config.nodeApiUrl}/tenant/option-list`, {});
            setTenantList(res.data);
        };
        getTenantList();
    }, []);

    const logOut = async () => {
        setTimeout(() => {
            window.sessionStorage.clear();
            window?.location?.replace('/');
        }, 2000);
        if (isAuthenticated) {
            instance.logoutRedirect({
                postLogoutRedirectUri: config.baseUrl || 'https://demo.makez.ai'
            });
        }
        await httpRequest('POST', `${config.nodeApiUrl}/auth/logout`, {});
        toast.success('Logged out successfully');
    };
    const onChangeDropDown = (e: string) => {
        if (e === 'Logout') logOut();
        if (e === 'Account') navigate(`/user/account/${user._id}`);
    };

    const callExtractionApi = async () => {
        await httpRequest('POST', 'http://localhost:4000/idp/document-extractor/v1', {});
    };

    return (
        // <div className="flex min-h-16 justify-between bg-black">
        // <div className="flex min-h-16 justify-between bg-[#042443]">
        <div className="flex min-h-16 justify-between bg-[#012D56]">
            {!showSidebar && (
                <div tabIndex={0} className="flex h-17 w-16 items-center justify-center md:hidden">
                    <Menu onClick={() => setShowSidebar(true)} className="cursor-pointer" color="white" size={30} />
                </div>
            )}
            <div tabIndex={0} className={cn('flex h-full cursor-pointer items-center md:pl-4', showSidebar && 'pl-4')} onClick={() => navigate('/')}>
                <MakezLogoHeader />
            </div>
            <div className="flex flex-1 items-center justify-end">
                <div className="hidden items-center gap-6 px-6 md:flex">
                    {/* <LogIn tabIndex={0} onClick={refreshAuth} size={20} className="cursor-pointer text-gray-300 hover:text-white" /> */}
                    {/* <CircleHelp tabIndex={0} size={20} className="cursor-pointer text-gray-300 hover:text-white" />
          <Bell tabIndex={0} size={20} className="cursor-pointer text-gray-300 hover:text-white" /> */}
                    {user?.role?.name === 'superadmin' && (
                        <SingleSelect
                            className="min-w-40"
                            value={selectedTenantFromSessionStorage}
                            onValueChange={e => {
                                setSelectedTenant(e);
                                window.location.reload();
                            }}
                            options={[{ label: 'All Tenants', value: 'all' }, ...tenantList]}
                        />
                    )}
                    <Dropdown onChange={onChangeDropDown} options={['Account', 'Logout']}>
                        <span className="flex items-center gap-2 text-sm text-gray-300 capitalize">
                            <CircleUser size={20} className="cursor-pointer text-gray-300 hover:text-white" />
                            {user?.firstName}
                        </span>
                    </Dropdown>
                </div>
            </div>
            <ExtractionFloatingWindowNew />
        </div>
    );
};

export default HeaderComponent;
