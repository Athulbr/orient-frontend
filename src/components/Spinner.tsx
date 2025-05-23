import { Loader } from 'lucide-react';

interface SpinnerIF {
  className?: string;
  size?: number;
}

const Spinner: React.FC<SpinnerIF> = ({ className, size }) => {
  return <Loader size={size} className={`animate-spin ${className}`} />;
};

export default Spinner;
