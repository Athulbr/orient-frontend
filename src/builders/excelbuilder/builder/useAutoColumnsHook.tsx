import { useEffect } from 'react';
import { capitalize } from 'lodash';
import { ExcelSheetConfig, ExcelColumnIF } from '.';

const generateId = () => Math.random().toString(36).substr(2, 9);

const normalizePath = (path: string) => {
    return path.replace(/\[\d+\]/g, '[*]');
};

interface UseAutoColumnsProps {
    inputData: any;
    sheets: ExcelSheetConfig[];
    setSheets: React.Dispatch<React.SetStateAction<ExcelSheetConfig[]>>;
    activeSheetIndex?: number;
}

export const useAutoColumns = ({ inputData, sheets, setSheets, activeSheetIndex = 0 }: UseAutoColumnsProps) => {
    useEffect(() => {
        if (!inputData || !Array.isArray(inputData) || sheets[activeSheetIndex]?.columns.length > 0) {
            // Don't auto-add if data is empty, not an array, or columns already exist
            return;
        }

        const detectedPaths = new Set<string>();

        // Map through each item in the array
        inputData.forEach(item => {
            const traverseData = (data: any, path: string = '') => {
                if (data === null || data === undefined) {
                    return;
                }

                const isObject = data !== null && typeof data === 'object';
                const isArray = Array.isArray(data);

                if (!isObject) {
                    // Check if the current path ends with 'value'
                    const pathParts = path.split('.');
                    const lastKey = pathParts[pathParts.length - 1]?.replace(/\[\d+\]/, '');

                    if (lastKey === 'value') {
                        const normalizedPath = normalizePath(path);
                        detectedPaths.add(normalizedPath);
                    }
                    return;
                }

                // Traverse object/array
                Object.keys(data).forEach(key => {
                    const currentPath = path ? (isArray ? `${path}[${key}]` : `${path}.${key}`) : key;

                    traverseData(data[key], currentPath);
                });
            };

            // Start traversal without array index - path starts from the key name
            traverseData(item);
        });

        // Convert paths to columns
        const newColumns: ExcelColumnIF[] = Array.from(detectedPaths).map(path => {
            // Extract column name from the parent key (before 'value')
            const pathParts = path.split('.');
            // Get the parent key before 'value'
            const parentKey = pathParts.length > 1 ? pathParts[pathParts.length - 2]?.replace(/\[\*\]/, '') : 'Column';
            const columnName = capitalize(parentKey.replace(/_/g, ' '));

            return {
                id: generateId(),
                columnName,
                jsonPath: path
            };
        });

        // Update the active sheet with detected columns
        if (newColumns.length > 0) {
            const updatedSheets = [...sheets];
            updatedSheets[activeSheetIndex] = {
                ...updatedSheets[activeSheetIndex],
                columns: newColumns
            };
            setSheets(updatedSheets);
        }
    }, [inputData]); // Only re-run when inputData changes
};
