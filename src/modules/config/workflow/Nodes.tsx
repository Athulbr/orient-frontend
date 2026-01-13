import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Mail, Clock, Terminal } from 'lucide-react';

// Email Node Component
export const EmailNode = memo(({ data, selected }: NodeProps) => (
    <div
        className={`min-w-[200px] bg-white rounded-xl shadow-lg border-2 transition-all ${selected ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-100'}`}
    >
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-indigo-500" />
        <div className="flex items-center gap-2 p-3 border-b border-slate-50 bg-indigo-50/30 rounded-t-xl">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
                <Mail size={14} className="text-white" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</span>
        </div>
        <div className="p-4">
            <p className="text-sm font-semibold text-slate-700 truncate">{data.recipient || 'No Recipient'}</p>
        </div>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-indigo-500" />
    </div>
));

// Delay Node Component
export const DelayNode = memo(({ data, selected }: NodeProps) => (
    <div
        className={`min-w-[180px] bg-white rounded-xl shadow-lg border-2 transition-all ${selected ? 'border-amber-500 ring-4 ring-amber-50' : 'border-slate-100'}`}
    >
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-amber-500" />
        <div className="flex items-center gap-2 p-3 border-b border-slate-50 bg-amber-50/30 rounded-t-xl">
            <div className="p-1.5 bg-amber-500 rounded-lg">
                <Clock size={14} className="text-white" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Delay</span>
        </div>
        <div className="p-4">
            <p className="text-sm font-semibold text-slate-700">{data.delay || 1000}ms</p>
        </div>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-amber-500" />
    </div>
));

// Log Node Component
export const LogNode = memo(({ data, selected }: NodeProps) => (
    <div
        className={`min-w-[180px] bg-white rounded-xl shadow-lg border-2 transition-all ${selected ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-100'}`}
    >
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-emerald-500" />
        <div className="flex items-center gap-2 p-3 border-b border-slate-50 bg-emerald-50/30 rounded-t-xl">
            <div className="p-1.5 bg-emerald-500 rounded-lg">
                <Terminal size={14} className="text-white" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Log</span>
        </div>
        <div className="p-4 bg-slate-900 m-2 rounded">
            <p className="text-[10px] font-mono text-emerald-400 truncate">{`> ${data.message || '...'}`}</p>
        </div>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-emerald-500" />
    </div>
));
