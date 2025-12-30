import { X } from 'lucide-react';
import { Button } from '../../../../../../components/Button';

interface ClearButtonIF {
    test?: string;
}

export const ClearButton: React.FC<ClearButtonIF> = () => {
    return (
        <Button
            className="flex cursor-pointer items-center gap-1 rounded border px-3 py-2 text-sm transition-colors hover:bg-gray-100"
            onClick={() => {}} // TODO: implement clear functionality
            outlined
        >
            <X className="h-3.5 w-3.5" />
            Clear
        </Button>
    );
};
