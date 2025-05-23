import { ReactNode } from 'react';
import GoogleIcon from '../../assets/svg-icons/GoogleIcon';
import { MakezLogoAuth } from '../../assets/svg-icons/MakezLogoAuth';
import { Button } from '../../components/Button';
import { MuiPasswordTextField } from '../../components/MuiPasswordTextField';
import { MuiTextField } from '../../components/MuiTextField';

interface AuthLayoutComponentIF {
  children: ReactNode;
}

const AuthLayoutComponent: React.FC<AuthLayoutComponentIF> = ({ children }) => {
  return (
    <div className="flex h-full w-full">
      <div className="hidden h-full flex-1 flex-col bg-[url(/auth-banner.svg)] bg-cover bg-center md:flex">
        <div className="flex flex-1 flex-col justify-center gap-5 pl-5 lg:pl-15 xl:pl-20">
          <h1 className="text-6xl text-gray-100 lg:text-7xl">We Make</h1>
          <h1 className="text-6xl text-gray-300 lg:text-7xl">AI Easy</h1>
          <h4 className="max-w-90 text-sm text-gray-100">
            Work AI for Enterprises with Employee Co-Pilots, Enterprise Search, Document Automation, and Brand Connect AI Tools.​
          </h4>
        </div>
        <div className="flex w-full justify-center pb-5 text-sm text-gray-500">@ 2024 makez.ai. All rights reserved</div>
      </div>
      <div className="flex h-full w-screen flex-col items-center justify-center md:w-1/2 lg:w-2/5">
        <div className="flex w-full justify-center">
          <MakezLogoAuth />
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayoutComponent;
