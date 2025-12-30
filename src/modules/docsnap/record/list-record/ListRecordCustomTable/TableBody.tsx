import { cn } from '../../../../../global-utils/twMerge';
import { ActionButtons } from './components/ActionButtons';
import { useListRecordCustomTableState } from './hooks/listRecordCustomTableStateContext';

export const TableBody: React.FC = () => {
    const { state } = useListRecordCustomTableState();

    const rowStyle = 'w-fit max-w-[300px] min-w-[80px] truncate text-xs whitespace-nowrap text-gray-800 lg:text-sm';
    return (
        <tbody className="divide-y divide-gray-200 border-b-[1px] border-b-gray-200">
            {state.records?.map((row: any, index: number) => {
                return (
                    <tr key={index}>
                        <td onClick={e => e.stopPropagation()} className="px-5 py-4 whitespace-nowrap">
                            <input type="checkbox" className="cursor-pointer rounded border-gray-300 p-0 text-blue-600 focus:ring-blue-500" />
                        </td>

                        <td className="px-2 py-4 xl:px-5">
                            <div className={cn(rowStyle)}>{row.name}</div>
                        </td>
                        <td className="px-2 py-4 xl:px-5">
                            <div className={cn(rowStyle)}>{row.documentNumber || 'N/A'}</div>
                        </td>
                        <td className="px-2 py-4 xl:px-5">
                            <div className={cn(rowStyle)}>{row.status}</div>
                        </td>
                        <td className="px-2 py-4 xl:px-5">
                            <div className={cn(rowStyle)}>{row.extractedBy || 'N/A'}</div>
                        </td>
                        <td className="px-2 py-4 xl:px-5">
                            <div className={cn(rowStyle)}>{row.createdAt}</div>
                        </td>
                        <td className="px-2 py-4 xl:px-5">
                            <ActionButtons row={row} />
                        </td>
                    </tr>
                );
            })}
        </tbody>
    );
};
