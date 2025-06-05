import { useState, useEffect } from 'react';

export const RecordStatusCustomUI = (row: any) => {
  const [data, setData] = useState<any>(null);

  const streamUrl = row?.data?.metadata?.stream_url;

  useEffect(() => {
    if (!streamUrl || row?.data?.extractedData) return;
    const connect = () => {
      const accessToken = window?.sessionStorage?.getItem('accessToken') as string;
      const eventSource = new EventSource(`${import.meta.env.VITE_BASR_URL}/ai/${streamUrl}?token=Bearer ${JSON.parse(accessToken)}`);

      eventSource.addEventListener('task_update', (event: any) => {
        const data = JSON.parse(event.data);
        setData(data);
      });
      eventSource.onerror = (error: any) => {
        eventSource.close();
      };
    };
    connect();
  }, [streamUrl]);

  if (row?.data?.extractedData) {
    return <div className="text-xs font-semibold text-green-700">Complete</div>;
  }
  if (!streamUrl) {
    return <div className="">Error</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-amber-500">{data?.status || ''}</div>
      <div className="flex gap-2">
        <div className="h-2 w-32 rounded-full bg-gray-200">
          <div className="h-full rounded-full bg-amber-500 transition-all duration-300" style={{ width: `${data?.progress || 0}%` }} />
        </div>
        <span className="text-xs text-gray-600">{data?.progress || 0}%</span>
      </div>
    </div>
  );
};
