import { ArrowLeft } from 'lucide-react';

interface BackButtonIF {
  onClick: () => void;
}

const BackButton: React.FC<BackButtonIF> = ({ onClick }) => {
  return (
    <span onClick={onClick} className="flex h-8 w-10 cursor-pointer items-center justify-center rounded-lg border bg-gray-50 hover:bg-gray-200">
      <ArrowLeft size={20} />
    </span>
  );
};

export default BackButton;
