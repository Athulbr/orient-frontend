import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';

interface PageNameComponentIF {
  showBackButton?: boolean;
  name: string;
  customGoBackFunction?: () => void;
}

const PageNameComponent: React.FC<PageNameComponentIF> = ({ showBackButton, name, customGoBackFunction }) => {
  const navigate = useNavigate();

  const onClickHandler = () => {
    customGoBackFunction ? customGoBackFunction() : navigate(-1);
  };
  return (
    <div className="">
      <div className="flex items-center gap-4 text-xl">
        {showBackButton && <BackButton onClick={onClickHandler} />} {name}
      </div>
    </div>
  );
};

export default PageNameComponent;
