import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import ResultsTabs from '../components/ResultsTabs';
import { useDashboardData } from './useDashboardData';
import { channelTotals, deriveDays, grandTotals, filterDaysByRange, CHANNEL_META } from './derive';
import type { ChannelKey } from './types';
import OverviewPanel from './components/OverviewPanel';
import TrendPanel from './components/TrendPanel';
import VerificationPanel from './components/VerificationPanel';
import BranchesPanel from './components/BranchesPanel';
import BranchDailyPanel from './components/BranchDailyPanel';
import KpiStrip from './components/KpiStrip';

const CHANNELS: ChannelKey[] = ['bank', 'qr', 'gateway'];

const ReconciliationDashboardPage: React.FC = () => {
    const { data, isLoading, error, refresh } = useDashboardData();
    const [activeTab, setActiveTab] = useState('overview');

    const days = useMemo(() => (data ? deriveDays(data) : []), [data]);
    const firstDate = days[0]?.date ?? '';
    const lastDate = days[days.length - 1]?.date ?? '';

    // ── Dashboard-wide scope filter ──────────────────────────────────────
    // Date range + branch selection used to live only inside Branch Daily's
    // own state, so narrowing it there had no effect anywhere else. They
    // live here now, and Branch Daily receives them as controlled props.
    // Default = the full loaded range ("live"); narrowing it recomputes
    // the KPI strip and every panel, not just Branch Daily.
    const [startDate, setStartDate] = useState(firstDate);
    const [endDate, setEndDate] = useState(lastDate);
    const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

    // Re-sync to freshly loaded data, but only if the user hasn't already
    // narrowed the range — so a background Refresh doesn't clobber a
    // deliberate filter.
    useEffect(() => {
        if (!firstDate || !lastDate) return;
        setStartDate(prev => (prev && prev >= firstDate && prev <= lastDate ? prev : firstDate));
        setEndDate(prev => (prev && prev >= firstDate && prev <= lastDate ? prev : lastDate));
    }, [firstDate, lastDate]);

    const isRangeFiltered = !!startDate && !!endDate && (startDate !== firstDate || endDate !== lastDate);
    const scopedDays = useMemo(
        () => (isRangeFiltered ? filterDaysByRange(days, startDate, endDate) : days),
        [days, startDate, endDate, isRangeFiltered]
    );

    const totals = useMemo(
        () => ({
            bank: channelTotals(scopedDays, 'bank'),
            qr: channelTotals(scopedDays, 'qr'),
            gateway: channelTotals(scopedDays, 'gateway')
        }),
        [scopedDays]
    );
    const grand = useMemo(() => grandTotals([totals.bank, totals.qr, totals.gateway]), [totals]);
    // "Branches covered" is the one KPI that IS legitimately branch-keyed
    // (branch_totals is a real per-branch breakdown), so it can honor the
    // branch picker too even though rows/auto/hv can't — see the note on
    // BranchesPanel below for why those stay date-only.
    const grandForKpi = selectedBranches.length > 0 ? { ...grand, branches: selectedBranches.length } : grand;
    const activeChannels = CHANNELS.filter(ch => totals[ch].folders > 0);

    const isFiltered = isRangeFiltered || selectedBranches.length > 0;
    const clearScopeFilter = () => {
        setStartDate(firstDate);
        setEndDate(lastDate);
        setSelectedBranches([]);
    };

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'trend', label: 'Daily Trend' },
        { id: 'verification', label: 'Human Verification', count: grand.hv, alert: grand.hv > 0 },
        { id: 'branches', label: 'Branches', count: grand.branches },
        { id: 'branch-daily', label: 'Branch Daily' }
    ];

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-gray-400">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <p className="text-sm font-medium">Loading dashboard…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-5 mt-5 flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 py-16 text-red-600">
                <AlertCircle size={28} />
                <p className="font-semibold">Failed to load the dashboard</p>
                <p className="text-sm text-red-500">{error}</p>
                <button
                    onClick={refresh}
                    className="mt-2 cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!data || data.days.length === 0) {
        return (
            <div className="mx-5 mt-5 flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white py-24 text-gray-400">
                <p className="font-semibold text-gray-500">No reconciliations yet</p>
                <p className="text-sm">Once a bank, QR, or gateway reconciliation runs, it'll show up here automatically.</p>
            </div>
        );
    }

    const period = scopedDays.length
        ? `${scopedDays[0].date}  \u2192  ${scopedDays[scopedDays.length - 1].date}`
        : `${firstDate}  \u2192  ${lastDate}`;

    return (
        <div className="font-[DM_Sans,Segoe_UI,sans-serif] h-full w-full flex-1 bg-gray-50 p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Reconciliation Dashboard</h1>
                    <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span>{period}</span>
                        <span className="text-gray-300">·</span>
                        <span>{activeChannels.map(ch => CHANNEL_META[ch].label).join(' + ')}</span>
                        {isFiltered && (
                            <>
                                <span className="text-gray-300">·</span>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">
                                    Filtered
                                    <button onClick={clearScopeFilter} className="cursor-pointer text-blue-400 hover:text-blue-700">
                                        ✕
                                    </button>
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <button
                    onClick={refresh}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-600"
                >
                    <RefreshCw size={13} />
                    Refresh
                </button>
            </div>

            <div className="mb-5">
                <KpiStrip grand={grandForKpi} dayCount={scopedDays.length} channelLabels={activeChannels.map(ch => CHANNEL_META[ch].label).join(' + ')} />
            </div>

            <ResultsTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
                {activeTab === 'overview' && <OverviewPanel activeChannels={activeChannels} totals={totals} />}
                {activeTab === 'trend' && <TrendPanel days={scopedDays} activeChannels={activeChannels} />}
                {activeTab === 'verification' && <VerificationPanel totals={totals} activeChannels={activeChannels} />}
                {activeTab === 'branches' && (
                    <BranchesPanel days={scopedDays} activeChannels={activeChannels} selectedBranches={selectedBranches} />
                )}
                {activeTab === 'branch-daily' && (
                    <BranchDailyPanel
                        days={days}
                        activeChannels={activeChannels}
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                        selectedBranches={selectedBranches}
                        onSelectedBranchesChange={setSelectedBranches}
                    />
                )}
            </ResultsTabs>
        </div>
    );
};

export default ReconciliationDashboardPage;
