import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const SingleSelect: React.FC<SelectProps> = ({
  value,
  label,
  options,
  onValueChange,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div ref={selectRef} className={`relative w-full ${className}`}>
      {label && <label className="pl-1 text-sm text-gray-500">{label}</label>}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`mt-1 flex w-full items-center justify-between rounded-md border bg-white px-3 py-6 text-sm ${isOpen ? 'border-primary ring-primary/20 ring-2' : 'border-input'} ${value && value !== 'all' ? 'bg-primary/5' : ''} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'} h-10 transition-all duration-200`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className="truncate text-gray-700">{selectedOption?.label || placeholder}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="border-input absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-white shadow-lg">
          <ul className="max-h-60 overflow-auto py-1" role="listbox">
            {options.map(option => (
              <li
                key={option.value}
                className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${option.value === value ? 'bg-gray-200 font-medium' : ''} `}
                onClick={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={option.value === value}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
