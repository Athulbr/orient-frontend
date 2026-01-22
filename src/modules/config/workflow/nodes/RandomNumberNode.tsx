import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Dice5 } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const RandomNumberNode = memo(({ data, selected }: NodeProps) => (
    <div
        className={`relative min-w-[180px] bg-white rounded-xl shadow-lg border-2 transition-all ${
            selected ? 'border-green-500 ring-4 ring-green-50' : 'border-slate-100'
        }`}
    >
        <StatusBadge status={data.status} />
        <Handle type="target" position={Position.Left} />
        <div className="flex items-center gap-2 p-3 border-b bg-green-50/30 rounded-t-xl">
            <Dice5 size={14} className="text-green-600" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Random</span>
        </div>
        <div className="p-4 text-sm text-slate-700">
            <div>
                Min: <b>{data.min}</b>
            </div>
            <div>
                Max: <b>{data.max}</b>
            </div>
        </div>
        <Handle type="source" position={Position.Right} />
    </div>
));
