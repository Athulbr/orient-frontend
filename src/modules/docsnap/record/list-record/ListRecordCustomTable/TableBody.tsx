import { useListRecordPageState } from '../hooks/listRecordPageContext';

interface TableBodyIF {
    columns: { label: string; key: string }[];
}

export const TableBody: React.FC<TableBodyIF> = ({ columns }) => {
    const { state } = useListRecordPageState();
    const data = [
        {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '123-456-7890',
            address: '123 Main St',
            actions: 'Edit'
        },
        {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '123-456-7890',
            address: '123 Main St',
            actions: 'Edit'
        },
        {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '123-456-7890',
            address: '123 Main St',
            actions: 'Edit'
        }
    ];
    return (
        <tbody className="divide-y divide-gray-200 border-b-[1px] border-b-gray-200">
            {state.records?.map((row: any, index: number) => {
                return (
                    <tr
                        // onClick={e => rowClickHandler(e, row)}
                        key={index}
                        // className={selectedIds.includes(row._id) && rowSelection.enableRowHighlight ? 'bg-blue-50' : ''}
                    >
                        <td onClick={e => e.stopPropagation()} className="px-5 py-4 whitespace-nowrap">
                            <input
                                type="checkbox"
                                className="cursor-pointer rounded border-gray-300 p-0 text-blue-600 focus:ring-blue-500"
                                // checked={selectedIds.includes(row._id)}
                                // onChange={e => rowCheckHandler(e, row._id)} // handleSelectRow(row._id, e.target.checked); todo
                            />
                        </td>

                        <td key={index + 5} className="px-2 py-4 xl:px-5">
                            <div className={`w-fit max-w-[300px] min-w-[80px] truncate text-xs whitespace-nowrap text-gray-800 lg:text-sm `}>{row.name}</div>
                        </td>
                        <td key={index + 5} className="px-2 py-4 xl:px-5">
                            <div className={`w-fit max-w-[300px] min-w-[80px] truncate text-xs whitespace-nowrap text-gray-800 lg:text-sm `}>
                                {row.extractedBy}
                            </div>
                        </td>
                    </tr>
                );
            })}
        </tbody>
    );
};
