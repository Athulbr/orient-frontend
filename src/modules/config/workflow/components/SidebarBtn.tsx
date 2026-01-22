export const SidebarBtn = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all group"
    >
        <div className="p-2 bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white rounded-lg transition-colors">{icon}</div>
        <span className="text-sm font-semibold text-slate-600">{label}</span>
    </button>
);
