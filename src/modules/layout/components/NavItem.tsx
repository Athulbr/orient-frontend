import { FC } from 'react';
import { NavItemType } from '../types';

interface NavItemProps {
  item: NavItemType;
  onClick: () => void;
  expandedSidebar?: boolean;
  isMobile?: boolean;
}

export const NavItem: FC<NavItemProps> = ({ item, onClick, expandedSidebar, isMobile }) => {
  if (isMobile) {
    return (
      <div
        onClick={onClick}
        className="flex h-14 w-full cursor-pointer items-center gap-3 rounded-md bg-[#0d1216] pl-4 transition-all duration-200 hover:bg-[#1a1f24]"
      >
        {item.icon}
        {item.name && <span className="text-sm text-gray-100">{item.name}</span>}
      </div>
    );
  }

  if (expandedSidebar) {
    return (
      <div
        tabIndex={0}
        onClick={onClick}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md p-2 transition-all duration-200 hover:bg-[#24333f]"
      >
        {item.icon}
        {item.name && <span className="text-gray-100">{item.name}</span>}
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      onClick={onClick}
      className="flex h-16 w-12 cursor-pointer flex-col items-center justify-center gap-1 rounded-md bg-[#28313A] transition-all duration-200 hover:bg-[#34404c]"
    >
      {item.icon}
      {item.name && <span className="text-[8px] text-gray-100">{item.name}</span>}
    </div>
  );
};
