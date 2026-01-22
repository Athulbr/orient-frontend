import { memo } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { StatusBadge } from '../components/StatusBadge';
import { Terminal } from 'lucide-react';

export const LogNode = memo(({ data, selected }: NodeProps) => (
    <div
        className={`relative min-w-[180px] bg-white rounded-xl shadow-lg border-2 transition-all ${selected ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-100'}`}
    >
        <StatusBadge status={data.status} />
        <Handle type="target" position={Position.Left} />
        <div className="flex items-center gap-2 p-3 border-b bg-emerald-50/30 rounded-t-xl">
            <Terminal size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Log</span>
        </div>
        <div className="p-4 bg-slate-900 m-2 rounded">
            <p className="text-[10px] font-mono text-emerald-400 truncate">{`> ${data.message || '...'}`}</p>
        </div>
        <Handle type="source" position={Position.Right} />
    </div>
));
