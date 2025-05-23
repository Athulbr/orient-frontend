import { createContext, JSX, useContext } from 'react';
import { TablebuilderSettingsIF, TablebuilderStateIF } from '../interface';

interface InjectedDataIF {
  customUI: Record<string, ({ data }: { data: any }) => JSX.Element>;
  externalFilters: Record<string, string>;
  customFunctions: Record<string, (data: any) => void>;
  fluidHeight?: boolean;
  actionButtons?: { label: string; action: () => void }[];
}

const TablebuilderStateContext = createContext<
  | {
      state: TablebuilderStateIF;
      setState: React.Dispatch<React.SetStateAction<TablebuilderStateIF>>;
      settings: TablebuilderSettingsIF;
      injectedData: InjectedDataIF;
      // getDataFromApi: (customQuery?: Partial<QueryParams>) => void;
    }
  | undefined
>(undefined);
export const TablebuilderStateProvider = TablebuilderStateContext.Provider;

export const useTablebuilderState = () => {
  const context = useContext(TablebuilderStateContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
