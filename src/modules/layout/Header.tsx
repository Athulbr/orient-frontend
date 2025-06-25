import { CircleUser, Menu } from 'lucide-react';
import { MakezLogoHeader } from '../../assets/svg-icons/MakezLogoHeader';
import { useToastStore } from '../../components/toast/ToastStore';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from '../../components/Dropdown';

interface HeaderComponentIF {
  showSidebar?: boolean;
  setShowSidebar: (state: boolean) => void;
}

const HeaderComponent: React.FC<HeaderComponentIF> = ({ showSidebar, setShowSidebar }) => {
  const toast = useToastStore();
  const navigate = useNavigate();
  const firstName = JSON.parse(window?.sessionStorage.getItem(`${'firstName'}`) as string) || 'User';
  const logOut = () => {
    toast.success('Logged out successfully');
    setTimeout(() => {
      window.sessionStorage.clear();
      window?.location?.replace('/');
    }, 500);
  };
  const onChangeDropDown = (e: string) => {
    if (e === 'Logout') logOut();
  };

  return (
    <div className="flex min-h-16 justify-between bg-[#001529]">
      {!showSidebar && (
        <div tabIndex={0} className="flex h-17 w-16 items-center justify-center md:hidden">
          <Menu onClick={() => setShowSidebar(true)} className="cursor-pointer" color="white" size={30} />
        </div>
      )}
      <div tabIndex={0} className="flex h-full cursor-pointer items-center md:pl-6" onClick={() => navigate('/')}>
        <MakezLogoHeader />
      </div>
      <div className="flex flex-1 items-center justify-end">
        <div className="hidden items-center gap-6 px-6 md:flex">
          {/* <LogIn tabIndex={0} onClick={refreshAuth} size={20} className="cursor-pointer text-gray-300 hover:text-white" /> */}
          {/* <CircleHelp tabIndex={0} size={20} className="cursor-pointer text-gray-300 hover:text-white" />
          <Bell tabIndex={0} size={20} className="cursor-pointer text-gray-300 hover:text-white" /> */}
          <Dropdown onChange={onChangeDropDown} options={['Account', 'Logout']}>
            <span className="flex items-center gap-2 text-sm text-gray-300">
              <CircleUser size={20} className="cursor-pointer text-gray-300 hover:text-white" />
              {firstName}
            </span>
          </Dropdown>
          {/* <Dropdown onChange={onChangeDropDown} options={['Light', 'Dark', 'Default']}>
            <Sun size={20} className="cursor-pointer text-gray-300 hover:text-white" />
          </Dropdown> */}

          {/* <Settings tabIndex={0} onClick={() => navigate('/config')} size={20} className="cursor-pointer text-gray-300 hover:text-white" /> */}
          {/* <MoonStar size={20} className="cursor-pointer text-gray-300 hover:text-white" /> */}
        </div>
      </div>
    </div>
  );
};

export default HeaderComponent;
