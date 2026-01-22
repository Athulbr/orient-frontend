import { CheckCircle2, Settings, AlertCircle } from 'lucide-react';

export const StatusBadge = ({ status }: { status?: string }) => {
    if (status === 'running') {
        return (
            <div className="absolute -top-3 -right-3 bg-amber-500 text-white p-1 rounded-full shadow-lg z-50">
                <Settings size={14} className="animate-spin" />
            </div>
        );
    }
    if (status === 'success') {
        return (
            <div className="absolute -top-3 -right-3 bg-emerald-500 text-white p-1 rounded-full shadow-lg z-50">
                <CheckCircle2 size={14} />
            </div>
        );
    }
    if (status === 'error') {
        return (
            <div className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full shadow-lg z-50">
                <AlertCircle size={14} />
            </div>
        );
    }
    return null;
};
