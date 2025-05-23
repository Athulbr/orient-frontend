import { forwardRef, InputHTMLAttributes } from 'react';
import { MessageSquareMore } from 'lucide-react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
  onMouseAction?: () => void;
}

export const CompareResponseInputField = forwardRef<HTMLInputElement, InputFieldProps>(({ label, errorMessage, onMouseAction, ...props }, ref) => {
  return (
    <div className="group w-1/2 rounded-lg p-2 pt-1" onMouseEnter={() => onMouseAction && onMouseAction()}>
      <label className="pl-1 text-sm text-gray-600 group-hover:text-[#2563eb]">{label}</label>

      <div className="flex h-9 w-full items-center justify-between rounded-sm border border-gray-300 bg-white group-hover:border-[#2563eb] focus-within:border-[#2563eb]">
        <input ref={ref} className="min-w-0 flex-1 px-2 text-sm text-gray-700 focus:outline-none" {...props} />
        <div className="flex h-full w-10 cursor-pointer items-center justify-center rounded-sm border-l border-gray-200 bg-gray-100 hover:bg-gray-200">
          <MessageSquareMore size={18} className="text-gray-600" />
        </div>
      </div>

      {errorMessage && <p className="mt-1 pl-1 text-xs text-red-500">{errorMessage}</p>}
    </div>
  );
});

CompareResponseInputField.displayName = 'CompareResponseInputField';
