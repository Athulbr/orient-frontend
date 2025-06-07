import { FC, useState } from 'react';
import { Dock, FileText, LayoutDashboard, Menu, Settings, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MakezLogoHeader } from '../../assets/svg-icons/MakezLogoHeader';
import useToggle from '../../hooks/useToggleHook';

// Types
interface NavItemType {
  name: string;
  icon: React.ReactNode;
  path: string;
  key: string;
}

interface SidebarComponentIF {
  showSidebar?: boolean;
  setShowSidebar: (state: boolean) => void;
}

// Constants
const navItems = [
  // {
  //   name: 'Dashboard',
  //   icon: <LayoutDashboard strokeWidth={1.5} size={32} color="#f3f4f6" />,
  //   path: '/dashboard',
  //   key: 'dashboard',
  // },
  {
    name: 'DocSnap',
    icon: <FileText strokeWidth={1.5} size={32} color="#f3f4f6" />,
    path: '/docsnap/record/list',
    key: 'docsnap',
  },
  {
    name: 'Promate',
    icon: <Dock strokeWidth={1.5} size={32} color="#f3f4f6" />,
    path: '/promate/list',
    key: 'promate',
  },
];

const configMenuItem = {
  name: 'Config',
  icon: <Settings strokeWidth={1.5} size={32} color="#f3f4f6" />,
  path: '/config',
  key: 'config',
};

// Mock Logo component

// Component for a navigation item in desktop sidebar
const DesktopNavItem: FC<any> = ({ item, onClick, expandedSidebar }) => {
  if (expandedSidebar) {
    return (
      <div tabIndex={0} onClick={onClick} className="flex w-full cursor-pointer items-center gap-2 p-2 hover:bg-[#24333f]">
        {item.icon}
        <span className="text-gray-100">{item.name}</span>
      </div>
    );
  }
  return (
    <div
      tabIndex={0}
      onClick={onClick}
      className="flex h-16 w-12 cursor-pointer flex-col items-center justify-center gap-1 rounded-md bg-[#28313A] hover:bg-[#34404c]"
    >
      {item.icon}
      <span className="text-[8px] text-gray-100">{item.name}</span>
    </div>
  );
};

// Component for a navigation item in mobile sidebar
const MobileNavItem: FC<any> = ({ item, onClick }) => (
  <div onClick={onClick} className="flex h-14 w-full cursor-pointer items-center gap-3 rounded-md bg-[#0d1216] pl-4">
    {item.icon}
    <span className="text-sm text-gray-100">{item.name}</span>
  </div>
);

// Desktop sidebar component
const DesktopSidebar = () => {
  const navigate = useNavigate();
  const [expandedSidebar, toggleExpandedSidebar] = useToggle();
  // Mock navigation function
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className={`hidden h-full ${expandedSidebar ? 'min-w-40' : 'min-w-16'} flex-col bg-[#001529] md:flex`}>
      <div tabIndex={0} className="flex h-16 w-16 items-center justify-center">
        <Menu onClick={toggleExpandedSidebar} className="cursor-pointer" color="white" size={30} />
      </div>
      <section className="flex h-full flex-col items-center gap-5 pt-6">
        {navItems.map(item => (
          <DesktopNavItem expandedSidebar={expandedSidebar} key={item.key} item={item} onClick={() => handleNavigation(item.path)} />
        ))}
        <div className={`flex flex-1 flex-col justify-end gap-4 pb-2 text-gray-400 ${expandedSidebar ? 'w-full' : 'items-center text-[10px]'}`}>
          <DesktopNavItem
            expandedSidebar={expandedSidebar}
            key={configMenuItem.key}
            item={configMenuItem}
            onClick={() => handleNavigation(configMenuItem.path)}
          />
          <span className="flex justify-center text-sm">{expandedSidebar ? '© 2025 makez.ai' : 'V 1.0.0'}</span>
        </div>
      </section>
    </div>
  );
};

// Mobile sidebar overlay component
const MobileSidebar: FC<SidebarComponentIF> = ({ showSidebar, setShowSidebar }) => {
  const navigate = useNavigate();
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  if (!showSidebar) return null;

  return (
    <div className="absolute top-0 left-0 z-20 flex h-screen w-screen bg-[#00000080] md:hidden">
      <div className="h-screen w-1/2 bg-black">
        <div className="flex h-17 w-full items-center justify-between pl-6">
          <MakezLogoHeader />
        </div>
        <div className="flex flex-col gap-4 p-2 pt-6">
          {navItems.map(item => (
            <MobileNavItem
              key={item.key}
              item={item}
              onClick={() => {
                setShowSidebar(false);
                handleNavigation(item.path);
              }}
            />
          ))}
        </div>
      </div>
      <div onClick={() => setShowSidebar(false)} className="flex h-full flex-1 justify-end">
        <div className="flex h-16 w-16 items-center justify-center">
          <X className="cursor-pointer" color="white" size={20} />
        </div>
      </div>
    </div>
  );
};

// Main sidebar component that renders both desktop and mobile sidebars
const SidebarComponent: FC<SidebarComponentIF> = ({ showSidebar = false, setShowSidebar }) => {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
    </>
  );
};

export default SidebarComponent;
