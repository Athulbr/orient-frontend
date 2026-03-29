import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mail, Paperclip, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Email } from './types';
import { config } from '../../../../../config/default';
import { SingleSelect } from '../../../../../components/SingleSelect';

interface EmailLinkDialogProps {
    onLink: (emailId: string) => void;
}

interface PaginatedEmailResponse {
    data: Email[];
    pagination: {
        totalCount: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
}

const EmailLinkDialog: React.FC<EmailLinkDialogProps> = ({ onLink }) => {
    const [emails, setEmails] = useState<Email[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [perPage, setPerPage] = useState('10');
    const [currentPage, setCurrentPage] = useState(1);

    // Debounce search input
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(value);
            setCurrentPage(1);
        }, 300);
    };

    const handlePerPageChange = (value: string) => {
        setPerPage(value);
        setCurrentPage(1);
    };

    const fetchEmails = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('status', 'unlinked');
            params.set('page', currentPage.toString());
            params.set('limit', perPage);
            if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());

            const res = await fetch(`${config.workflowService}/api/emails?${params.toString()}`);
            if (res.ok) {
                const json: PaginatedEmailResponse = await res.json();
                setEmails(json.data ?? []);
                setTotalCount(json.pagination?.totalCount ?? 0);
                setTotalPages(json.pagination?.totalPages ?? 1);
            }
        } catch (err) {
            console.error('Failed to fetch available emails', err);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, perPage, currentPage]);

    useEffect(() => {
        fetchEmails();
    }, [fetchEmails]);

    const pageStart = totalCount === 0 ? 0 : (currentPage - 1) * Number(perPage) + 1;
    const pageEnd = Math.min(currentPage * Number(perPage), totalCount);

    return (
        <div className="bg-white overflow-hidden flex-1 rounded-b-lg pb-4 flex flex-col">
            {/* Toolbar */}
            <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-2 bg-gray-50">
                {/* Search */}
                <div className="relative flex-1 min-w-[180px]">
                    <input
                        type="text"
                        className="w-full h-9 pl-9 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400"
                        placeholder="Search subject, from or body…"
                        value={searchInput}
                        onChange={e => handleSearchChange(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    {searchInput && (
                        <button
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            onClick={() => {
                                setSearchInput('');
                                setDebouncedSearch('');
                                setCurrentPage(1);
                            }}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Row count */}
                <div className="shrink-0">
                    <SingleSelect
                        value={perPage}
                        onValueChange={handlePerPageChange}
                        options={[
                            { label: '10 / page', value: '10' },
                            { label: '20 / page', value: '20' },
                            { label: '50 / page', value: '50' },
                            { label: '100 / page', value: '100' }
                        ]}
                    />
                </div>

                {/* Result count */}
                <span className="text-xs text-gray-400 shrink-0">{loading ? 'Loading…' : `${totalCount} result${totalCount !== 1 ? 's' : ''}`}</span>
            </div>

            {/* Email list */}
            <div className="flex-1 overflow-auto">
                {loading ? (
                    <div className="px-6 py-12 text-center text-gray-400 text-sm">Loading emails…</div>
                ) : emails.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <Mail size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-base text-gray-500">{debouncedSearch ? 'No emails match your search' : 'No unlinked emails available'}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {emails.map(email => (
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

            {/* Pagination footer */}
            {totalCount > 0 && (
                <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                    <span className="text-xs text-gray-500">
                        {pageStart}–{pageEnd} of {totalCount}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-xs text-gray-600 px-2 min-w-[64px] text-center">
                            Page {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailLinkDialog;
