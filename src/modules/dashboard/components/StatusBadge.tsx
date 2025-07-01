import { ThumbsUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const StatusBadge = ({ status }: { status: string }) => {
  let color = '';
  let icon = null;
  switch (status) {
    case 'Processed':
      color = 'bg-green-100 text-green-700 border-green-300';
      icon = <ThumbsUp size={14} className="mr-2 text-green-500" />;
      break;
    case 'In Progress':
      color = 'bg-yellow-100 text-yellow-700 border-yellow-300';
      icon = <Clock size={14} className="mr-2 text-yellow-500" />;
      break;
    case 'Review':
      color = 'bg-blue-100 text-blue-700 border-blue-300';
      icon = <CheckCircle size={14} className="mr-2 text-blue-500" />;
      break;
    case 'Invalid':
      color = 'bg-red-100 text-red-700 border-red-300';
      icon = <AlertCircle size={14} className="mr-2 text-red-500" />;
      break;
    default:
      color = 'bg-gray-100 text-gray-700 border-gray-300';
  }
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${color}`}>
      {icon}
      {status}
    </span>
  );
};
