import { FC, RefObject, useState } from 'react';
import { MessageSquareMore } from 'lucide-react';
import { Button } from '../../../../../components/Button';
import { useEffect, useRef } from 'react';
import { CommentDialog } from './CommentDialog';
import { ValidateSkuButton } from './ValidateSkuButton';
import { ConfidenceScore } from './ConfidenceScore';

interface InputFieldProps {
  description?: boolean;
  label?: string;
  confidence?: string;
  errorMessage?: string;
  onMouseAction?: (bbox: any) => void;
  onchange: (bbox: any) => void;
  ref?: RefObject<any>;
  value: string;
  bbox: string;
}

export const InputField = ({ label, errorMessage, onMouseAction, description, ref, confidence, value, bbox, onchange, ...props }: InputFieldProps) => {
  const [commentDialog, setCommentDialog] = useState(false);

  return (
    <div className={`group relative w-full min-w-0 rounded-lg p-2 pt-1`} onMouseEnter={() => onMouseAction?.(bbox)}>
      {label && (
        <label className="flex items-center justify-between pl-1 text-sm text-gray-600 group-hover:text-[#2563eb]">
          {label}
          <ValidateSkuButton label={label} value={value} />
          {confidence && <ConfidenceScore confidence={confidence} />}
        </label>
      )}

      <div
        className={`flex ${description ? 'h-18' : 'h-9'} w-full items-center justify-between overflow-hidden rounded-sm border border-gray-300 bg-white group-hover:border-[#2563eb] focus-within:border-[#2563eb]`}
      >
        {description ? (
          <textarea rows={3} ref={ref} className="min-w-0 flex-1 resize-none px-2 text-sm text-gray-700 focus:outline-none" value={value} {...props} />
        ) : (
          <input
            onFocus={() => onMouseAction?.(bbox)}
            ref={ref}
            className="min-w-0 flex-1 px-2 text-sm text-gray-700 focus:outline-none"
            value={value}
            onChange={onchange}
            {...props}
          />
        )}
        <div
          onClick={() => setCommentDialog(true)}
          className="relative flex h-full w-10 cursor-pointer items-center justify-center rounded-r-sm border-l border-gray-200 hover:bg-gray-100"
        >
          <MessageSquareMore size={16} className="text-gray-600" strokeWidth={1.3} />
        </div>
      </div>

      {errorMessage && <p className="mt-1 pl-1 text-xs text-red-500">{errorMessage}</p>}
      <CommentDialog isOpen={commentDialog} closeDialog={() => setCommentDialog(false)} />
    </div>
  );
};
