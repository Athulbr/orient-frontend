import { ReactNode, useState } from 'react';
import SidebarComponent from './Sidebar';
import HeaderComponent from './Header';

interface AuthenticatedLayoutIF {
  children: ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutIF> = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="flex h-full w-screen">
      <SidebarComponent showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <div className="flex h-screen w-full flex-col overflow-y-auto">
        <HeaderComponent showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
        {children}
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
