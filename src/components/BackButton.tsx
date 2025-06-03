import { ArrowLeft } from 'lucide-react';

interface BackButtonIF {
  onClick: () => void;
}

const BackButton: React.FC<BackButtonIF> = ({ onClick }) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="flex h-8 w-10 cursor-pointer items-center justify-center rounded-lg border bg-gray-50 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
    >
      <ArrowLeft role="img" size={20} />
    </span>
  );
};

export default BackButton;
