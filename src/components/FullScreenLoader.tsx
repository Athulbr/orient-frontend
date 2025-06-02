import { Loader } from 'lucide-react';

interface FullScreenLoaderIF {
  test?: string;
}

const FullScreenLoader: React.FC<FullScreenLoaderIF> = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <Loader role="img" size={26} className="ml-2 animate-spin" />
        <div className="pt-2 pl-4 text-sm">Loading...</div>
      </div>
    </div>
  );
};

export default FullScreenLoader;
