import { JSX, useState } from 'react';
import { tablebuilderInitialState } from './static-data/State';
import { TablebuilderStateProvider } from './hooks/useTablebuilderStateContext';
import Table from './table';
import { TablebuilderSettingsIF, TablebuilderStateIF } from './interface';

interface PropsIF {
  settings: TablebuilderSettingsIF;
  customUI?: Record<string, ({ data }: { data: any }) => JSX.Element>;
  externalFilters?: Record<string, string>;
  customFunctions?: Record<string, (row: any, data: any) => void>;
  fluidHeight?: boolean;
  actionButtons?: { label: string; action: () => void }[];
  refresh?: number;
}

export const RenderTablebuilder: React.FC<PropsIF> = ({
  settings,
  customUI = {},
  customFunctions = {},
  fluidHeight,
  externalFilters = {},
  actionButtons = [],
  refresh,
}) => {
  const [state, setState] = useState<TablebuilderStateIF>(tablebuilderInitialState);
  return (
    <TablebuilderStateProvider value={{ state, setState, settings, injectedData: { customUI, customFunctions, fluidHeight, externalFilters, actionButtons } }}>
      <Table refresh={refresh} />
    </TablebuilderStateProvider>
  );
};
