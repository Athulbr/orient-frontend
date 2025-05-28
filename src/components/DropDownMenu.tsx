import React, { ReactNode, useEffect, useRef, useState } from 'react';

interface DropdownMenuPropsIF {
  children: ReactNode;
  options: string[];
  onChange: (option: string) => void;
}

const DropdownMenu: React.FC<DropdownMenuPropsIF> = ({ children, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <div onClick={toggleDropdown} className="cursor-pointer">
        {children}
      </div>
      {isOpen && (
        <div className="absolute right-0 z-12 mt-2 origin-top-right divide-y divide-gray-100 rounded-md border border-gray-300 bg-white shadow-lg">
          <div className="py-1">
            {options.map((option, index) => (
              <button
                key={index}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => onChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
