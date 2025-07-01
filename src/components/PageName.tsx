import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import { ReactElement } from 'react';
import { cn } from '../utils/twMerge';

interface PageNameComponentIF {
  showBackButton?: boolean;
  name: string;
  customGoBackFunction?: () => void;
  children?: ReactElement[] | ReactElement;
  className?: string;
}

const PageNameComponent: React.FC<PageNameComponentIF> = ({ showBackButton, name, customGoBackFunction, children, className }) => {
  const navigate = useNavigate();

  const onClickHandler = () => {
    customGoBackFunction ? customGoBackFunction() : navigate(-1);
  };
  return (
    <div className={cn('flex justify-between', className)}>
      <div className="">
        <div className="flex items-center gap-4 text-xl">
          {showBackButton && <BackButton onClick={onClickHandler} />} {name}
        </div>
        {Array.isArray(children) ? children[0] : children}
      </div>
      {Array.isArray(children) ? children[1] : children}
    </div>
  );
};

export default PageNameComponent;
