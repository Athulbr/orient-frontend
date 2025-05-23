import { JSX, useEffect, useState } from 'react';
import { RenderTablebuilder } from '..';
import httpRequest from '../utils/HttpRequest';
import { TablebuilderSettingsIF } from '../interface';
import FullScreenLoader from '../../../../components/FullScreenLoader';
import { useFetchDataFromApi } from '../hooks/useFetchDataFromApi';

interface UseTablebuilderPropsIF {
  fluidHeight?: boolean;
  name: string;
  customUI?: Record<string, ({ data }: { data: any }) => JSX.Element>;
  externalFilters?: Record<string, string>;
  customFunctions?: Record<string, (data: any) => void>;
  actionButtons?: { label: string; action: () => void }[];
  refresh?: number;
}

export const UseTablebuilder: React.FC<UseTablebuilderPropsIF> = ({
  name,
  customUI,
  customFunctions,
  fluidHeight,
  externalFilters,
  actionButtons,
  refresh,
}) => {
  const [settings, setSettings] = useState<TablebuilderSettingsIF | null>(null);
  useEffect(() => {
    const getTableSettings = async () => {
      try {
        const res: any = await httpRequest('POST', 'http://localhost:4600/api/tablebuilder/name', { name });
        setSettings(res?.data?.settings);
      } catch (error: any) {
        console.log('error.message:===========', error.message);
      }
    };
    getTableSettings();
  }, [name]);

  if (!settings)
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <FullScreenLoader />
      </div>
    );

  return (
    <div className="flex h-full w-full overflow-y-auto">
      <RenderTablebuilder
        settings={settings}
        customUI={customUI}
        customFunctions={customFunctions}
        fluidHeight={fluidHeight}
        externalFilters={externalFilters}
        actionButtons={actionButtons}
        refresh={refresh}
      />
    </div>
  );
};
