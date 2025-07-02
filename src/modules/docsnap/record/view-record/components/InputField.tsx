import { FC, RefObject, useId, useState } from 'react';
import { CircleCheck, Eye, MessageSquareMore, MessageSquareText } from 'lucide-react';
import { Button } from '../../../../../components/Button';
import { useEffect, useRef } from 'react';
import { CommentDialog } from './CommentDialog';
import { ValidateSkuButton } from './ValidateSkuButton';
import { ConfidenceScore } from './ConfidenceScore';

interface InputFieldProps {
  label?: string;
  confidence?: string;
  errorMessage?: string;
  onMouseAction?: () => void;
  onchange: (bbox: any) => void;
  ref?: RefObject<any>;
  value: string;
  checked?: boolean;
  checkClickHandler?: (checked: boolean) => void;
}

export const InputField = ({ label, errorMessage, onMouseAction, ref, confidence, value, onchange, checked, checkClickHandler, ...props }: InputFieldProps) => {
  const [commentDialog, setCommentDialog] = useState(false);
  const id = useId();

  return (
    <div className={`group relative w-full min-w-0 rounded-sm p-2 pt-1`} onClick={() => onMouseAction?.()}>
      {label && (
        <label htmlFor={id} className="flex items-center justify-between pl-1 text-sm text-gray-600 group-hover:text-[#2563eb]">
          {label}
          <ValidateSkuButton label={label} value={value} />
          {confidence && <ConfidenceScore confidence={confidence} />}
        </label>
      )}

      <div
        className={`flex h-9.5 w-full items-center justify-between overflow-hidden rounded-sm border ${checked ? 'border border-green-500' : 'border-gray-400'} bg-white group-hover:border-[#2563eb] focus-within:border-[#2563eb]`}
      >
        <input
          onFocus={() => onMouseAction?.()}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              checkClickHandler?.(true);
            }
          }}
          ref={ref}
          className="min-w-0 flex-1 px-2 text-sm text-gray-700 focus:outline-none"
          value={value ? value : ''}
          onChange={onchange}
          {...props}
          id={id}
        />
        <div className="mr-1">
          {checked ? (
            <CircleCheck onClick={e => checkClickHandler?.(false)} className="cursor-pointer text-green-500 hover:text-green-600" size={16} />
          ) : (
            <Eye onClick={e => checkClickHandler?.(true)} className="cursor-pointer text-orange-400 hover:text-orange-500" size={16} />
          )}
        </div>

        <div
          onClick={() => setCommentDialog(true)}
          className="relative flex h-full w-10 cursor-pointer items-center justify-center rounded-r-sm border-l border-gray-300 hover:bg-gray-100"
        >
          <MessageSquareText size={16} className="text-gray-800" strokeWidth={1.3} />
        </div>
      </div>

      {errorMessage && <p className="mt-1 pl-1 text-xs text-red-500">{errorMessage}</p>}
      <CommentDialog isOpen={commentDialog} closeDialog={() => setCommentDialog(false)} />
    </div>
  );
};
