import { useState } from 'react';
import { emptyInitialData, filledInitialData } from './static-data/Settings';
import { TableSettings } from './table-settings';
import { BuilderIF, TablebuilderSettingsProvider } from './hooks/useTablebuilderSettingsContext';
import { RenderTablebuilder } from '../render-tablebuilder';
import { StatusCustomUI, DeleteCustomUI, DateCustomUI } from '../render-tablebuilder/components/CustomUI';
import { TablebuilderSettingsIF } from '../render-tablebuilder/interface';

interface PropsIF {
  update?: boolean;
}

export const CreateTablebuilder: React.FC<PropsIF> = ({ update }) => {
  const [settings, setSettings] = useState<TablebuilderSettingsIF>(update ? emptyInitialData : filledInitialData);
  const [builder, setBuilder] = useState<BuilderIF>({ name: '', loading: false });

  const customUI = {
    status: StatusCustomUI,
    delete: DeleteCustomUI,
    date: DateCustomUI,
  };

  return (
    <TablebuilderSettingsProvider value={{ settings, setSettings, builder, setBuilder }}>
      <div className="flex w-full gap-2 divide-gray-200 overflow-y-auto p-2 pb-1">
        <TableSettings />
        <RenderTablebuilder settings={settings} fluidHeight customUI={customUI} />
      </div>
    </TablebuilderSettingsProvider>
  );
};
