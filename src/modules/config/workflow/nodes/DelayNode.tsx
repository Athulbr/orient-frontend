import { memo } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { StatusBadge } from '../components/StatusBadge';
import { Clock } from 'lucide-react';

export const DelayNode = memo(({ data, selected }: NodeProps) => (
    <div
        className={`relative min-w-[180px] bg-white rounded-xl shadow-lg border-2 transition-all ${selected ? 'border-amber-500 ring-4 ring-amber-50' : 'border-slate-100'}`}
    >
        <StatusBadge status={data.status} />
        <Handle type="target" position={Position.Left} />
        <div className="flex items-center gap-2 p-3 border-b bg-amber-50/30 rounded-t-xl">
            <Clock size={14} className="text-amber-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Delay</span>
        </div>
        <div className="p-4">
            <p className="text-sm font-semibold">{data.delay || 1000}ms</p>
        </div>
        <Handle type="source" position={Position.Right} />
    </div>
));
