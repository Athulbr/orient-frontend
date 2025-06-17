import { CircleCheck, Eye, MessageSquareMore, Trash, X, XCircle } from 'lucide-react';
import { formatFieldLabel } from '../utils';
import { useEffect } from 'react';

interface HoveredFieldCardProps {
  hoveredField: any;
  hoveredFieldId: string;
  bbox: any;
  onValueChange: (value: string) => void;
  onCheckToggle: (checked?: boolean) => void;
  isChecked: boolean;
  arrayLength?: number;
}

export const HoveredFieldCard: React.FC<HoveredFieldCardProps> = ({
  hoveredField,
  hoveredFieldId,
  bbox,
  onValueChange,
  onCheckToggle,
  isChecked,
  arrayLength = 2,
}) => {
  const activeClasses = 'focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1';

  useEffect(() => {
    onCheckToggle(true);
  }, []);

  return (
    <div
      className="absolute flex flex-col gap-2 rounded-lg border border-gray-300 bg-gray-50 p-3 shadow-lg shadow-gray-400"
      style={{
        left: `${bbox.x_min * 100 - 1}%`,
        top: `${bbox.y_max * 100 + 1}%`,
        minWidth: '220px',
      }}
    >
      <div className="flex items-center justify-between gap-2 pl-1 font-semibold">
        {arrayLength === 3 ? formatFieldLabel(hoveredFieldId?.split(':')[2] || '') : formatFieldLabel(hoveredFieldId?.split(':')[1] || '')}
        <XCircle className="cursor-pointer text-gray-400 hover:text-red-500" size={22} />
      </div>
      <div className="flex items-center justify-between gap-2 text-lg">
        <textarea
          rows={2}
          onChange={e => onValueChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onCheckToggle(true);
            }
          }}
          value={hoveredField.value}
          className={`w-full rounded-md border border-gray-300 bg-white p-2 outline-none ${activeClasses}`}
        />
        <div className="w-6">
          {isChecked ? (
            <CircleCheck onClick={() => onCheckToggle()} className="text-green-500" size={24} />
          ) : (
            <Eye onClick={() => onCheckToggle()} className="text-orange-400" size={24} />
          )}
        </div>
      </div>
    </div>
  );
};
