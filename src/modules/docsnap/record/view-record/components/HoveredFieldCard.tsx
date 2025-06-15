import { CircleCheck, Trash } from 'lucide-react';
import { formatFieldLabel } from '../utils';

interface HoveredFieldCardProps {
  hoveredField: any;
  hoveredFieldId: string;
  bbox: any;
  onValueChange: (value: string) => void;
  onCheckToggle: () => void;
  isChecked: boolean;
}

export const HoveredFieldCard: React.FC<HoveredFieldCardProps> = ({ hoveredField, hoveredFieldId, bbox, onValueChange, onCheckToggle, isChecked }) => {
  const activeClasses = 'focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1';

  return (
    <div
      className="absolute rounded-lg border border-gray-200 bg-gray-800 p-4 shadow-lg"
      style={{
        left: `${bbox.x_min * 100 - 1}%`,
        top: `${bbox.y_max * 100 + 1}%`,
        minWidth: '220px',
      }}
    >
      <div className="flex justify-between gap-2 pl-1 font-semibold text-white">
        {formatFieldLabel(hoveredFieldId?.split(':')[1] || '')}
        <Trash className="cursor-pointer hover:text-red-500" size={18} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-lg text-white">
        <textarea
          rows={2}
          onChange={e => onValueChange(e.target.value)}
          value={hoveredField.value}
          className={`w-full rounded-md border bg-transparent p-2 text-white outline-none ${activeClasses}`}
        />
        <CircleCheck onClick={onCheckToggle} className={`cursor-pointer text-gray-300 ${isChecked ? 'text-green-500' : ''}`} size={24} />
      </div>
    </div>
  );
};
