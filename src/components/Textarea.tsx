import React, { forwardRef } from 'react';

/**
 * Simple utility function to conditionally join class names
 */
function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** The label text for the textarea */
  label?: string;
  /** Error message to display below the textarea */
  error?: string;
  /** Helper text to display below the textarea */
  helperText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the textarea takes up the full width of its container */
  fullWidth?: boolean;
  /** Custom class for the textarea wrapper */
  wrapperClassName?: string;
  /** Custom class for the textarea label */
  labelClassName?: string;
  /** Custom class for the error message */
  errorClassName?: string;
  /** Custom class for the helper text */
  helperTextClassName?: string;
}

/**
 * TextArea component that extends all default textarea props
 * and provides additional functionality like labels and error messages.
 */
export const TextAreaComponent = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      disabled = false,
      fullWidth = true,
      className,
      wrapperClassName,
      labelClassName,
      errorClassName,
      helperTextClassName,
      id,
      placeholder,
      rows = 4,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID if none is provided
    const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={classNames('flex flex-col gap-1', fullWidth ? 'w-full' : '', wrapperClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className={classNames('flex items-center gap-1 text-sm font-medium text-gray-700', disabled && 'cursor-not-allowed opacity-50', labelClassName)}
          >
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          className={classNames(
            'rounded-md border px-3 py-2 shadow-sm',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none',
            'placeholder:text-gray-400',
            'transition duration-150 ease-in-out',
            'resize-y',
            fullWidth ? 'w-full' : '',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300',
            disabled && 'cursor-not-allowed bg-gray-100 opacity-75',
            className
          )}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className={classNames('mt-1 text-sm text-red-600', errorClassName)}>
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${textareaId}-helper`} className={classNames('mt-1 text-sm text-gray-500', helperTextClassName)}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
