import { useState, useEffect } from 'react';

export const RecordStatusCustomUI = (row: any) => {
  const [data, setData] = useState<any>(null);

  const streamUrl = row?.data?.metadata?.stream_url;

  useEffect(() => {
    if (!streamUrl) return;
    const connect = () => {
      const accessToken = window?.sessionStorage?.getItem('accessToken') as string;
      const eventSource = new EventSource(`${import.meta.env.VITE_BASR_URL}/ai/${streamUrl}?token=Bearer ${JSON.parse(accessToken)}`);

      eventSource.addEventListener('message', (event: any) => {
        const data = JSON.parse(event.data);

        setData(data);
      });
      eventSource.onerror = (error: any) => {
        console.error('SSE connection error:', error);
        eventSource.close();
      };
    };
    connect();
  }, [streamUrl]);
  return <div className="">{data?.status || ''}</div>;
};
