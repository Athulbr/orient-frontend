import { useState, useRef } from 'react';
import { DialogComponent } from '../../../components/DialogComponent';
import { Button } from '../../../components/Button';
import { Check, ChevronDown, Plus, X } from 'lucide-react';
import Spinner from '../../../components/Spinner';
import { useAlertStore } from '../../../components/alert/AlertStore';

export interface KeywordItem {
    keyword: string;
    source: string;
    selected: boolean;
}

export interface KeywordGroup {
    name: string;
    primary_keyword: string;
    keywords: KeywordItem[];
}

interface KeywordSelectionDialogProps {
    isOpen: boolean;
    keywordGroups: KeywordGroup[];
    isFetching: boolean;
    onClose: () => void;
    onProceed: (groups: KeywordGroup[]) => void;
    isSubmitting?: boolean;
}

export const KeywordSelectionDialog: React.FC<KeywordSelectionDialogProps> = ({
    isOpen,
    keywordGroups: initialGroups,
    isFetching,
    onClose,
    onProceed,
    isSubmitting = false,
}) => {
    const { showAlert } = useAlertStore();
    const [groups, setGroups] = useState<KeywordGroup[]>(initialGroups);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(
        new Set(initialGroups.map((_, i) => i).slice(1))
    );

    // Sync when initialGroups changes (e.g. after fetch)
    const [lastGroups, setLastGroups] = useState(initialGroups);
    if (initialGroups !== lastGroups) {
        setLastGroups(initialGroups);
        setGroups(initialGroups);
        setCollapsedGroups(new Set(initialGroups.map((_, i) => i).slice(1)));
    }

    const toggleGroupCollapse = (gi: number) => {
        setCollapsedGroups(prev => {
            const allIndices = groups.map((_, i) => i);
            if (prev.has(gi)) {
                const next = new Set(allIndices);
                next.delete(gi);
                return next;
            }
            return new Set(allIndices);
        });
    };

    const handleToggleKeyword = (groupIndex: number, kwIndex: number) => {
        setGroups(prev => prev.map((g, gi) =>
            gi !== groupIndex ? g : {
                ...g,
                keywords: g.keywords.map((k, ki) => ki === kwIndex ? { ...k, selected: !k.selected } : k)
            }
        ));
    };

    const handleSelectAllInGroup = (groupIndex: number, selectAll: boolean) => {
        setGroups(prev => prev.map((g, gi) =>
            gi !== groupIndex ? g : { ...g, keywords: g.keywords.map(k => ({ ...k, selected: selectAll })) }
        ));
    };

    const handleSelectAll = (selectAll: boolean) => {
        setGroups(prev => prev.map(g => ({ ...g, keywords: g.keywords.map(k => ({ ...k, selected: selectAll })) })));
    };

    const totalSelected = groups.reduce((acc, g) => acc + g.keywords.filter(k => k.selected).length, 0);
    const totalKeywords = groups.reduce((acc, g) => acc + g.keywords.length, 0);

    // Per-group add keyword state: Map<groupIndex, inputValue>
    const [addingKeyword, setAddingKeyword] = useState<Map<number, string>>(new Map());
    const addInputRef = useRef<HTMLInputElement>(null);

    const openAddKeyword = (gi: number) => {
        setAddingKeyword(prev => { const next = new Map(prev); next.set(gi, ''); return next; });
        setTimeout(() => addInputRef.current?.focus(), 50);
    };

    const closeAddKeyword = (gi: number) => {
        setAddingKeyword(prev => { const next = new Map(prev); next.delete(gi); return next; });
    };

    const commitAddKeyword = (gi: number) => {
        const value = (addingKeyword.get(gi) || '').trim();
        if (!value) { closeAddKeyword(gi); return; }
        setGroups(prev => prev.map((g, i) => i !== gi ? g : {
            ...g,
            keywords: [...g.keywords, { keyword: value, source: 'manual', selected: true }]
        }));
        closeAddKeyword(gi);
    };

    const handleClose = () => {
        showAlert({
            alertText: "Are you sure you want to cancel? This will remove your selected keywords and terminate block generation.",
            primaryButtonText: 'Yes, Cancel',
            secondaryButtonText: 'Go Back',
            onPrimaryAction: onClose,
        });
    };

    return (
        <DialogComponent
            className="flex max-h-[calc(100vh-200px)] min-h-[calc(100vh-200px)] w-[80vw] flex-col"
            name="Select Keywords"
            isOpen={isOpen}
            closeDialog={handleClose}
            disableBlurCloseDialog
        >
            <div className="flex w-full min-h-0 flex-1 flex-col overflow-hidden p-10 pt-5">
                {/* Loading */}
                {isFetching && (
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                        <Spinner size={32} />
                        <p className="text-sm text-gray-500">Fetching SEO keywords for your content...</p>
                    </div>
                )}

                {/* Keyword selection */}
                {!isFetching && groups.length > 0 && (
                    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
                        {/* Global header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-base font-semibold text-gray-800">SEO Keywords</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {totalSelected} of {totalKeywords} selected across {groups.length} product{groups.length > 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleSelectAll(true)} className="text-xs text-blue-600 hover:underline cursor-pointer">Select All</button>
                                <span className="text-gray-300">|</span>
                                <button onClick={() => handleSelectAll(false)} className="text-xs text-gray-500 hover:underline cursor-pointer">Deselect All</button>
                            </div>
                        </div>

                        {/* Groups list — scrollable */}
                        <div className="show-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
                            {groups.map((group, gi) => {
                                const groupSelected = group.keywords.filter(k => k.selected).length;
                                const allGroupSelected = groupSelected === group.keywords.length;
                                const isCollapsed = collapsedGroups.has(gi);
                                return (
                                    <div key={gi} className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                                        {/* Group header */}
                                        <div
                                            className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-gray-100 transition-colors"
                                            onClick={() => toggleGroupCollapse(gi)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <ChevronDown
                                                    size={16}
                                                    className={`text-gray-400 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                                                />
                                                <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                                    {groupSelected}/{group.keywords.length}
                                                </span>
                                                <p className="text-sm font-semibold text-gray-800 capitalize">{group.name}</p>
                                            </div>
                                            <button
                                                onClick={e => { e.stopPropagation(); handleSelectAllInGroup(gi, !allGroupSelected); }}
                                                className="text-xs text-blue-600 hover:underline cursor-pointer"
                                            >
                                                {allGroupSelected ? 'Deselect All' : 'Select All'}
                                            </button>
                                        </div>

                                        {/* Keywords grid + add keyword */}
                                        {!isCollapsed && (
                                            <div className="px-4 pb-3">
                                                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                                    {group.keywords.map((kw, ki) => (
                                                        <button
                                                            key={ki}
                                                            onClick={() => handleToggleKeyword(gi, ki)}
                                                            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all cursor-pointer ${
                                                                kw.selected
                                                                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                                                                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            <span className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${
                                                                kw.selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                                                            }`}>
                                                                {kw.selected && <Check size={9} className="text-white" strokeWidth={3} />}
                                                            </span>
                                                            <span className="leading-snug break-words">{kw.keyword}</span>
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Add keyword row */}
                                                <div className="mt-2">
                                                    {addingKeyword.has(gi) ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                ref={addInputRef}
                                                                type="text"
                                                                value={addingKeyword.get(gi) || ''}
                                                                onChange={e => setAddingKeyword(prev => {
                                                                    const next = new Map(prev);
                                                                    next.set(gi, e.target.value);
                                                                    return next;
                                                                })}
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter') commitAddKeyword(gi);
                                                                    if (e.key === 'Escape') closeAddKeyword(gi);
                                                                }}
                                                                placeholder="Type a keyword and press Enter"
                                                                className="flex-1 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => commitAddKeyword(gi)}
                                                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                                            >
                                                                <Check size={13} strokeWidth={3} />
                                                            </button>
                                                            <button
                                                                onClick={() => closeAddKeyword(gi)}
                                                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-100 transition-colors"
                                                            >
                                                                <X size={13} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => openAddKeyword(gi)}
                                                            className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer"
                                                        >
                                                            <Plus size={13} />
                                                            Add keyword
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-2 border-t pt-4">
                            <Button outlined onClick={handleClose}>Cancel</Button>
                            <Button
                                onClick={() => onProceed(groups)}
                                disabled={isSubmitting}
                                startIcon={isSubmitting ? <Spinner size={14} /> : null}
                            >
                                {isSubmitting ? 'Processing...' : `Proceed with ${totalSelected} Keywords`}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </DialogComponent>
    );
};
