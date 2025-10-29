import { FC } from 'react';

interface TableHeaderIF {
    columns: { label: string; key: string }[];
}

export const TableHeader: FC<TableHeaderIF> = ({ columns }) => {
    return (
        <thead>
            <tr>
                <th scope="col" className="sticky top-0 w-12 bg-gray-50 px-5 py-3">
                    <input
                        type="checkbox"
                        className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        // checked={Boolean(selectedIds.length && selectedIds.length === data.length)}
                        // onChange={e => onSelectAllRow(e)}
                    />
                </th>
                {columns.map((column: any, index: number) => {
                    return (
                        <th
                            key={index + 5}
                            scope="col"
                            className={`sticky top-0 z-1 h-14 bg-gray-50 px-2 py-3 text-left text-xs font-medium tracking-wider text-nowrap text-gray-500 uppercase xl:px-5`}
                        >
                            <div className="flex items-center gap-2 md:text-xs lg:text-sm">{column.label}</div>
                        </th>
                    );
                })}
            </tr>
        </thead>
    );
};
