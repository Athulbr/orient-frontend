import React from 'react';
import { Calendar, Layers, Activity, CreditCard } from 'lucide-react';
import { STATUS_CONFIG, formatDate } from './constants';
import MetaPill from './MetaPill';
import type { Reconciliation } from './types';

interface ReconciliationCardProps {
    reconciliation: Reconciliation;
}

const ReconciliationCard: React.FC<ReconciliationCardProps> = ({ reconciliation }) => {
    const statusCfg = STATUS_CONFIG[reconciliation.status] ?? STATUS_CONFIG['pending'];

    const getTransactionTypeIcon = (type: string) => {
        switch (type) {
            case 'bank': return <Activity size={12} className="text-blue-500" />;
            case 'qr': return <Activity size={12} className="text-purple-500" />;
            case 'gateway': return <CreditCard size={12} className="text-emerald-500" />;
            default: return <Activity size={12} className="text-gray-500" />;
        }
    };

    const getTransactionTypeColor = (type: string) => {
        switch (type) {
            case 'bank': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'qr': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'gateway': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    return (
        <div className="reconciliation-card font-[DM_Sans,Segoe_UI,sans-serif] bg-white border border-gray-200 rounded-xl w-full shadow-sm shadow-gray-100 transition-all duration-150 hover:shadow-md hover:border-gray-300">
            <div className="flex items-stretch h-full">
                {/* Left status accent bar */}
                <div className={`w-[3px] flex-shrink-0 bg-gradient-to-b ${statusCfg.stripe} to-transparent rounded-l-4xl relative top-1`} />

                <div className="flex-1 flex items-center gap-4 px-5 py-5 min-w-0">
                    {/* File name */}
                    <div className="min-w-0 flex-shrink" style={{ width: '25%' }}>
                        <p className="text-[14px] font-bold text-gray-800 truncate leading-tight" title={reconciliation.fileName}>
                            {reconciliation.fileName}
                        </p>
                    </div>

                    <div className="h-9 w-px bg-gray-100 flex-shrink-0" />

                    {/* Metadata pills */}
                    <div className="flex items-center gap-2 flex-1 flex-wrap min-w-0">
                        <MetaPill 
                            icon={getTransactionTypeIcon(reconciliation.transactionType)} 
                            colorClass={getTransactionTypeColor(reconciliation.transactionType)}
                        >
                            <span className="capitalize">{reconciliation.transactionType}</span>
                        </MetaPill>

                        <MetaPill icon={<Layers size={12} className="text-slate-500" />} colorClass="bg-slate-50 text-slate-700 border-slate-100">
                            {reconciliation.rowCount} Rows
                        </MetaPill>

                        <MetaPill icon={<Activity size={12} className="text-indigo-500" />} colorClass="bg-indigo-50 text-indigo-700 border-indigo-100">
                            {reconciliation.transactionCount} Transactions
                        </MetaPill>

                        <MetaPill icon={<Calendar size={12} className="text-slate-500" />} colorClass="bg-slate-50 text-slate-700 border-slate-100">
                            {formatDate(reconciliation.createdAt)}
                        </MetaPill>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold border ${statusCfg.badgeBg}`}>
                            {statusCfg.icon}
                            {statusCfg.label}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReconciliationCard;
