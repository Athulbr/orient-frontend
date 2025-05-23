import { Bell, CircleHelp, CircleUser, Menu, Search, Settings, X } from 'lucide-react';
import { MakezLogoHeader } from '../../assets/svg-icons/MakezLogoHeader';
import { useAuthStore } from '../auth/AuthStore';
import { useToastStore } from '../../components/toast/ToastStore';
import { useNavigate } from 'react-router-dom';

interface HeaderComponentIF {
  showSidebar?: boolean;
  setShowSidebar: (state: boolean) => void;
}

const HeaderComponent: React.FC<HeaderComponentIF> = ({ showSidebar, setShowSidebar }) => {
  const toast = useToastStore();
  const navigate = useNavigate();
  const firstName = JSON.parse(window?.sessionStorage.getItem('firstName') || 'User');
  const logOut = () => {
    toast.success('Logged out successfully');
    setTimeout(() => {
      window.sessionStorage.clear();
      window?.location?.replace('/auth/login');
    }, 1000);
  };
  return (
    <div className="flex min-h-16 justify-between bg-[#001529]">
      {!showSidebar && (
        <div className="flex h-17 w-16 items-center justify-center md:hidden">
          <Menu onClick={() => setShowSidebar(true)} className="cursor-pointer" color="white" size={30} />
        </div>
      )}
      <div className="flex h-full cursor-pointer items-center md:pl-6" onClick={() => navigate('/docsnap/record/list')}>
        <MakezLogoHeader />
      </div>
      <div className="flex flex-1 items-center justify-end">
        <div className="hidden items-center gap-6 px-6 md:flex">
          <CircleHelp size={20} className="cursor-pointer text-gray-300 hover:text-white" />
          <Bell size={20} className="cursor-pointer text-gray-300 hover:text-white" />
          <span className="flex items-center gap-2 text-sm text-gray-300">
            <CircleUser onClick={logOut} size={20} className="cursor-pointer text-gray-300 hover:text-white" />
            {firstName}
          </span>
          <Settings size={20} className="cursor-pointer text-gray-300 hover:text-white" />
        </div>
      </div>
    </div>
  );
};

export default HeaderComponent;
