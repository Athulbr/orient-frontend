import { FC } from 'react';
import * as XLSX from 'xlsx';
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
    ...state.objectFields,
    ...arrays,
  };
  const downloadJSONFile = () => {
    const jsonString = JSON.stringify(extractedData);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${state.record?.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const downloadXlsxFile = async () => {
    const recordId = state.record?._id;
    const accessToken = window?.sessionStorage?.getItem('accessToken') as string;

    const response = await fetch(`${import.meta.env.VITE_NODE_URL}/api/idp/history/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${accessToken ? JSON.parse(accessToken) : ''}`,
      },
      body: JSON.stringify({ recordId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${state.record?.name?.split('.pdf')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };
  const onChangeOption = (value: string) => {
    if (value === 'JSON') {
      downloadJSONFile();
    }
    if (value === 'XLSX') {
      downloadXlsxFile();
    }
  };
  if (!showExportButton) return;
  return (
    <Dropdown onChange={onChangeOption} options={['XLSX', 'JSON']}>
      {/* ISSUE:Button is preventing (e.preventDefault()) */}
      <button className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 hover:bg-gray-100">Export</button>
    </Dropdown>
  );
};
