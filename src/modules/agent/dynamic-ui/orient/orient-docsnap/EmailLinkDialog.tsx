import React from 'react';
import { Mail, Paperclip } from 'lucide-react';
import { Email } from './types';

interface EmailLinkDialogProps {
    availableEmails: Email[];
    onLink: (emailId: string) => void;
}

const EmailLinkDialog: React.FC<EmailLinkDialogProps> = ({ availableEmails, onLink }) => {
    return (
        <div className="bg-white overflow-hidden flex-1 rounded-b-lg pb-4">
            {availableEmails.length === 0 ? (
                <div className="px-6 py-12 text-center">
                    <Mail size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-base text-gray-500">No unlinked emails available</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {availableEmails.map(email => (
                        <button key={email.id} onClick={() => onLink(email.id)} className="w-full text-left px-6 py-4 hover:bg-purple-50 transition-colors group">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-semibold text-gray-900 break-words group-hover:text-purple-800 mb-1.5">{email.subject}</p>
                                        <p className="text-sm text-gray-600 mb-1">
                                            <span className="font-medium text-gray-500">From:</span> {email.from}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(email.date).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                        {email.body && <p className="text-sm text-gray-600 line-clamp-2 mt-2 italic border-l-2 border-gray-200 pl-3">{email.body}</p>}
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0 mt-1 bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm">
                                        <Paperclip size={14} className="text-gray-500" />
                                        <span className="text-sm font-medium text-gray-600">{email.attachments.length}</span>
                                    </div>
                                </div>
                                {email.attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {email.attachments.map((att, i) => (
                                            <div key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                                                <Paperclip size={12} className="text-gray-400" />
                                                <span className="truncate max-w-[150px]">{att.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmailLinkDialog;
