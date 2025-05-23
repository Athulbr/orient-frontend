import { ReactNode } from 'react';

interface PageContainerIF {
  className?: string;
  children?: ReactNode;
}

const PageContainer: React.FC<PageContainerIF> = ({ className, children }) => {
  return <div className={`flex flex-1 flex-col overflow-y-auto p-6 ${className}`}>{children}</div>;
};

export default PageContainer;
