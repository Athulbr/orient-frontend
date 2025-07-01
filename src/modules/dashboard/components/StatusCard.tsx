import { ChevronRight, ThumbsUp, CheckCircle, Clock, AlertCircle, FileWarning } from 'lucide-react';
import { useDashboardState } from '../hooks/dashboardContext';

export const StatusCardComponent = () => {
  const { state } = useDashboardState();

  return (
    // <div className="flex h-full flex-col gap-y-4 px-3 rounded-2xl border bg-red-200 p-5 shadow-sm">
    <div className="order-[-1] flex h-fit w-full flex-col gap-y-4 rounded-2xl border border-[#F9F0FF] bg-white px-5 py-6 lg:order-1 lg:h-full lg:w-100">
      <div className="flex items-center justify-between">
        <div className="text-gray-800">Quick Summary</div>
        {/* <a href="#" className="flex items-center gap-1 text-sm text-sky-500 hover:underline">
          See More <ChevronRight size={16} />
        </a> */}
      </div>
      <div className="mb-1 flex items-center justify-between rounded-xl border bg-white px-4 py-4 xl:py-6">
        {state.loadingRecords || !state.totalRecords ? (
          <div className="h-[30px] w-18 animate-pulse rounded bg-gray-200" />
        ) : (
          <div className="text-[24px]">{state.totalRecords}</div>
        )}
        <div className="text-sm font-light text-gray-500">Total Documents</div>
      </div>
      {/* <div className="border-b" /> */}
      <div className="flex h-full flex-col gap-y-4">
        {statusItems.map((item, idx) => (
          <div key={item.label} className="flex min-h-17 flex-1 cursor-pointer items-center justify-between rounded-xl border bg-white px-5 transition">
            <div className="flex items-center gap-3">
              {item.icon}
              <div className="flex flex-col">
                <span className="text-[12px] font-light text-gray-500">{item.label}</span>
                <span className="font-semibold text-gray-700">{item.count}</span>
              </div>
            </div>
            <ChevronRight className="text-sky-500" size={22} />
          </div>
        ))}
      </div>
    </div>
  );
};

const statusItems = [
  {
    label: 'Processed Documents',
    count: 350,
    icon: (
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <ThumbsUp className="text-[#53c31c]" size={28} />
      </span>
    ),
  },
  {
    label: 'Ready to Review',
    count: 660,
    icon: (
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
        <CheckCircle className="text-blue-500" size={28} />
      </span>
    ),
  },
  {
    label: 'In Progress',
    count: 910,
    icon: (
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
        <Clock className="text-yellow-500" size={28} />
      </span>
    ),
  },
  {
    label: 'Invalid Files',
    count: 421,
    icon: (
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <FileWarning className="text-red-500" size={28} />
      </span>
    ),
  },
  {
    label: 'Failed Files',
    count: 120,
    icon: (
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="text-red-500" size={28} />
      </span>
    ),
  },
];
