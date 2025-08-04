import { ArrowLeft } from 'lucide-react';
import Tooltip from './Tooltip';
import { cn } from '../global-utils/twMerge';

interface BackButtonIF {
    onClick: () => void;
    tooltipText?: string;
    className?: string;
}

const BackButton: React.FC<BackButtonIF> = ({ onClick, tooltipText = 'Go back', className }) => {
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
        }
    };

    return (
        <Tooltip text={tooltipText} position="bottom">
            <span
                role="button"
                tabIndex={0}
                onClick={onClick}
                onKeyDown={handleKeyDown}
                className={cn(
                    'flex h-8 w-10 cursor-pointer items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none',
                    className
                )}
            >
                <ArrowLeft role="img" size={20} />
            </span>
        </Tooltip>
    );
};

export default BackButton;
