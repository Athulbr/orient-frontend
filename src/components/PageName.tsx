import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import { ReactElement } from 'react';
import { cn } from '../global-utils/twMerge';

interface PageNameComponentIF {
    showBackButton?: boolean;
    name: string;
    customGoBackFunction?: () => void;
    children?: ReactElement;
    className?: string;
}

const PageNameComponent: React.FC<PageNameComponentIF> = ({ showBackButton, name, customGoBackFunction, children, className }) => {
    const navigate = useNavigate();

    const onClickHandler = () => {
        customGoBackFunction ? customGoBackFunction() : navigate(-1);
    };
    return (
        <div className={cn('flex justify-between pb-1', className)}>
            <div className="flex items-center gap-2 text-xl text-nowrap">
                {showBackButton && <BackButton onClick={onClickHandler} />} {name}
            </div>
            {children}
        </div>
    );
};

export default PageNameComponent;
