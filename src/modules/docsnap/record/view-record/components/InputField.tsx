import { RefObject, useId, useState } from 'react';
import { CircleCheck, Eye, MessageSquareText } from 'lucide-react';
import { CommentDialog } from './CommentDialog';
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
    disabled?: boolean;
    handleRegenerateField?: () => void;
    jsonKey?: string;
    showRegenButton?: boolean;
    validationUrl?: string;
    showTextarea?: boolean;
}

export const InputField = ({
    label,
    errorMessage,
    onMouseAction,
    ref,
    confidence,
    value,
    onchange,
    disabled,
    checked,
    checkClickHandler,
    jsonKey,
    handleRegenerateField,
    showRegenButton,
    validationUrl,
    showTextarea,
    ...props
}: InputFieldProps) => {
    const [commentDialog, setCommentDialog] = useState(false);
    const id = useId();
    const [commentList, setCommentList] = useState<{ text: string; date: string; time: string }[]>([]);

    const renderTemplate = (template: string, data: Record<string, string>) => {
        return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => encodeURIComponent(data[key] ?? ''));
    };

    const validateLink = (validationUrl: string, value: string) => {
        if (!validationUrl.trim() || !value.trim()) return;
        const finalUrl = renderTemplate(validationUrl, { value });
        window.open(finalUrl, '_blank');
    };

    return (
        <div className={`group relative w-full min-w-0 rounded-sm p-2 pt-1`} onClick={() => onMouseAction?.()}>
            {label && (
                <label htmlFor={id} className="flex items-center justify-between pl-1 text-gray-900 group-hover:text-[#2563eb]">
                    {label}
                    <div className="flex items-center gap-4">
                        {showRegenButton && (
                            <span
                                onClick={handleRegenerateField}
                                className="text-xs text-gray-600 cursor-pointer border  px-2 py-0.5 rounded-md hover:bg-sky-50 hover:border-gray-500"
                            >
                                Regenerate
                            </span>
                        )}
                        {validationUrl && (
                            <span
                                onClick={() => validateLink(validationUrl, value)}
                                className="text-xs text-gray-600 cursor-pointer border  px-2 py-0.5 rounded-md hover:bg-sky-50 hover:border-gray-500"
                            >
                                Validate
                            </span>
                        )}
                        {confidence && <ConfidenceScore confidence={confidence} />}
                    </div>
                </label>
            )}

            <div
                className={`mt-0.5 flex h-10.5 ${showTextarea ? 'h-auto py-2' : 'h-10.5'} w-full items-center justify-between overflow-hidden rounded-sm border ${checked ? 'border border-green-500' : 'border-gray-400'} bg-white group-hover:border-[#2563eb] focus-within:border-[#2563eb]`}
            >
                {showTextarea ? (
                    <textarea
                        data-gramm="false"
                        rows={6}
                        onFocus={() => onMouseAction?.()}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                checkClickHandler?.(true);
                            }
                        }}
                        ref={ref}
                        className="min-w-0 flex-1 px-3 text-gray-900 focus:outline-none"
                        value={value ? value : ''}
                        onChange={onchange}
                        {...props}
                        disabled={disabled}
                        id={id}
                    />
                ) : (
                    <input
                        onFocus={() => onMouseAction?.()}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                checkClickHandler?.(true);
                            }
                        }}
                        ref={ref}
                        className="min-w-0 flex-1 px-3 text-gray-900 focus:outline-none"
                        value={value ? value : ''}
                        onChange={onchange}
                        {...props}
                        disabled={disabled}
                        id={id}
                    />
                )}

                <div className="mr-1">
                    {checked ? (
                        <CircleCheck
                            onClick={e => {
                                e.stopPropagation();
                                checkClickHandler?.(false);
                            }}
                            className="cursor-pointer text-green-500 hover:text-green-600"
                            size={16}
                        />
                    ) : (
                        <Eye onClick={e => checkClickHandler?.(true)} className="cursor-pointer text-orange-400 hover:text-orange-500" size={16} />
                    )}
                </div>

                <div
                    onClick={() => setCommentDialog(true)}
                    className="relative flex h-full w-10 cursor-pointer items-center justify-center rounded-r-sm border-l border-gray-300 hover:bg-gray-100"
                >
                    {commentList.length > 0 && <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-green-600"></span>}
                    <MessageSquareText size={20} strokeWidth={1.3} />
                </div>
            </div>

            {errorMessage && <p className="mt-1 pl-1 text-xs text-red-500">{errorMessage}</p>}
            <CommentDialog
                commentList={commentList}
                setCommentList={setCommentList}
                jsonKey={jsonKey || ''}
                isOpen={commentDialog}
                closeDialog={() => setCommentDialog(false)}
            />
        </div>
    );
};
