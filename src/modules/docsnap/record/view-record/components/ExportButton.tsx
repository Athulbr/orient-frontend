import { FC } from 'react';
import { Button } from '../../../../../components/Button';
import { Dropdown } from '../../../../../components/Dropdown';
import { useViewRecordState } from '../hooks/viewRecordContext';

interface ExportButtonPropsIF {
  showExportButton?: boolean;
}

export const ExportButton: FC<ExportButtonPropsIF> = ({ showExportButton = true }) => {
  const { state } = useViewRecordState();
  const arrays: any = {};
  state.tableNames.forEach((item, index) => {
    arrays[item] = state.arrayFields[index];
  });
  const extractedData = {
    ...state.topLevelFields,
    ...state.objectFields,
    ...arrays,
  };
  const downloadJSONFile = () => {
    const jsonString = JSON.stringify(extractedData);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  if (!showExportButton) return;
  return (
    <Dropdown onChange={downloadJSONFile} options={['XLSX', 'JSON']}>
      <Button small outlined>
        Export
      </Button>
    </Dropdown>
  );
};
