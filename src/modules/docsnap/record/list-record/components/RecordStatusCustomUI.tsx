import { useState, useEffect } from 'react';
import { useListRecordPageState } from '../hooks/listRecordPageContext';

export const RecordStatusCustomUI = (row: any) => {
  const [data, setData] = useState<any>(null);
  const { state } = useListRecordPageState();
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setRefresh(state.refresh);
  }, []);

  console.log('refresh:===========', refresh);

  const streamUrl = row?.data?.metadata?.stream_url;

  useEffect(() => {
    if (!streamUrl || row?.data?.extractedData) return;
    const connect = () => {
      const accessToken = window?.sessionStorage?.getItem('accessToken') as string;
      const eventSource = new EventSource(`${import.meta.env.VITE_PYTHON_URL}/ai/${streamUrl}?token=Bearer ${JSON.parse(accessToken)}`);

      eventSource.addEventListener('task_update', (event: any) => {
        const data = JSON.parse(event.data);
        setData(data);
        if (data.status === 'PENDING') {
          eventSource.close();
        }
      });
      eventSource.onerror = (error: any) => {
        eventSource.close();
      };
    };
    connect();
  }, [streamUrl]);

  if (row?.data?.extractedData) {
    return (
      <div className="w-fit cursor-pointer rounded-lg border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-500 hover:bg-blue-100 hover:text-blue-700">
        Review
      </div>
    );
  }
  if (!streamUrl) {
    return <div className="font-semibold text-red-400">Failed</div>;
  }

  return (
    <div className="w-fit cursor-pointer rounded-lg border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-500 hover:bg-amber-100 hover:text-amber-700">
      Processing
    </div>
  );

  // console.log('data:===========', data);

  // return (
  //   <div className="flex flex-col">
  //     <div className="text-[10px] text-amber-500">{data?.current_step || ''}</div>
  //     <div className="flex items-center gap-2">
  //       <div className="h-[6px] w-32 rounded-full bg-gray-200">
  //         <div className="h-full rounded-full bg-amber-500 transition-all duration-300" style={{ width: `${data?.progress || 0}%` }} />
  //       </div>
  //       <span className="text-[10px] text-gray-600">{data?.progress || 0}%</span>
  //     </div>
  //   </div>
  // );
};
