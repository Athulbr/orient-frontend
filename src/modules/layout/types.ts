import React from 'react';
import { FileText, Dock, Settings, LogOut } from 'lucide-react';
import { ReactNode } from 'react';

export interface NavItemType {
  name: string;
  icon: ReactNode;
  path: string;
  key: string;
  onClick?: () => void;
}

export interface SidebarComponentIF {
  showSidebar?: boolean;
  setShowSidebar: (state: boolean) => void;
}

export const navItems: NavItemType[] = [
  {
    name: 'DocSnap',
    icon: React.createElement(FileText, { strokeWidth: 1.5, size: 32, color: '#f3f4f6' }),
    path: '/',
    key: 'docsnap',
  },
  // {
  //   name: 'Promate',
  //   icon: React.createElement(Dock, { strokeWidth: 1.5, size: 32, color: '#f3f4f6' }),
  //   path: '/promate/list',
  //   key: 'promate',
  // },
];

export const configMenuItem: NavItemType = {
  name: 'Config',
  icon: React.createElement(Settings, { strokeWidth: 1.5, size: 30, color: '#f3f4f6' }),
  path: '/config/user/list',
  key: 'config',
};

export const logoutMenuItem: NavItemType = {
  name: 'Logout',
  icon: React.createElement(LogOut, { strokeWidth: 1.5, size: 32, color: '#f3f4f6' }),
  path: '/config',
  key: 'logout',
};
