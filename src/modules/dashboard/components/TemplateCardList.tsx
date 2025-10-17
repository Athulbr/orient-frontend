import { ChevronRight } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardState } from '../hooks/dashboardContext';
import { useDashboardApi } from '../hooks/useDashboardApi';
import { TemplateCardComponent } from '../../docsnap/template/list-template/components/TemplateCard';
import { usePermissionStore } from '../../../zustand-store/PermissionStore';

interface TemplateCardsComponentIF {
    test?: string;
}

export const TemplateCardListComponent: React.FC<TemplateCardsComponentIF> = () => {
    const { state, setState } = useDashboardState();
    const [cardsPerRow, setCardsPerRow] = useState(4);
    const { getTemplatesApi, getPredefinedTemplatesApi } = useDashboardApi();
    const { checkPermission } = usePermissionStore();

    // Calculate how many cards can fit based on screen width
    const calculateCardsPerRow = useCallback(() => {
        const screenWidth = window.innerWidth;
        const cardMinWidth = 300; // min-w-80 = 320px
        const containerPadding = 48; // accounting for container padding
        const gapBetweenCards = 24; // gap-6 = 24px

        // Calculate maximum cards that can fit
        const availableWidth = screenWidth - containerPadding;
        const maxCards = Math.floor((availableWidth + gapBetweenCards) / (cardMinWidth + gapBetweenCards));

        // Ensure at least 2 cards (1 template + 1 "View All") and max 6 cards
        return Math.max(2, Math.min(maxCards, 6));
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setCardsPerRow(calculateCardsPerRow());
        };

        // Set initial value
        handleResize();

        // Add resize listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, [calculateCardsPerRow]);

    useEffect(() => {
        getTemplatesApi();
    }, [state.refresh]);
    useEffect(() => {
        getPredefinedTemplatesApi();
    }, []);

    // Get selected tenant id from localStorage
    const selectedTenantId = localStorage.getItem('selectedTenant');

    // Calculate total templates count based on tenant id
    const totalTemplates =
        !selectedTenantId || selectedTenantId === 'all'
            ? state.templates.length
            : state.templates.filter((template: any) => template.tenantId === selectedTenantId).length;

    // Calculate how many template cards to show (reserve 1 slot for "View All")
    const templatesToShow = Math.max(0, cardsPerRow - 1);

    // Reorder templates: recently clicked first
    const recentTemplateIds = (() => {
        try {
            const arr = localStorage.getItem('recentTemplate');
            return arr ? JSON.parse(arr) : [];
        } catch {
            return [];
        }
    })();

    let orderedTemplates: any[] = state.templates;
    if (Array.isArray(recentTemplateIds) && recentTemplateIds.length > 0) {
        const recentTemplates: any[] = [];
        const otherTemplates: any[] = [];
        orderedTemplates.forEach((template: any) => {
            if (recentTemplateIds.includes(template._id)) {
                recentTemplates.push(template);
            } else {
                otherTemplates.push(template);
            }
        });
        // Sort recentTemplates by order in recentTemplateIds
        recentTemplates.sort((a: any, b: any) => recentTemplateIds.indexOf(a._id) - recentTemplateIds.indexOf(b._id));
        orderedTemplates = [...recentTemplates, ...otherTemplates];
    }

    const onClickUploadButton = (template: any) => {
        const recentlyUsedTemplates = JSON.parse(localStorage.getItem('recentlyUsedTemplates') || '[]');
        const filteredTemplates = recentlyUsedTemplates.filter((item: any) => item !== template._id);
        const finalTemplates = [template._id, ...filteredTemplates];
        localStorage.setItem('recentlyUsedTemplates', JSON.stringify(finalTemplates));
        setState({ ...state, showUploadDocumentDialog: true, selectedTemplate: template, refresh: state.refresh + 1 });
    };

    const visibleTemplates = orderedTemplates.slice(0, templatesToShow);

    return (
        <div className="relative">
            {!checkPermission('read:record') ? (
                <div className="flex h-full min-h-40 w-full flex-col items-center justify-center rounded-2xl bg-white text-sm text-gray-400">
                    You do not have permission to view templates
                </div>
            ) : state.loadingTemplates ? (
                <div className="flex min-h-40 gap-6">
                    {Array.from({ length: cardsPerRow }).map((_, idx) => (
                        <TemplateCardComponent key={idx} isLoading flexBasis={`${100 / cardsPerRow}%`} />
                    ))}
                </div>
            ) : visibleTemplates.length > 0 ? (
                <div className="flex min-h-40 gap-6">
                    {visibleTemplates.map((template, idx) => (
                        <TemplateCardComponent
                            key={idx}
                            template={template}
                            flexBasis={`${100 / cardsPerRow}%`}
                            onClickUpload={() => onClickUploadButton(template)}
                            refreshPage={() => getTemplatesApi()}
                        />
                    ))}
                    {totalTemplates > templatesToShow && <ViewAllCard totalTemplates={totalTemplates} flexBasis={`${100 / cardsPerRow}%`} />}
                </div>
            ) : (
                <div className="flex h-40 w-full items-center justify-center rounded-2xl bg-white text-gray-400">
                    Your recently created template will appear here
                </div>
            )}
        </div>
    );
};

interface ViewAllCardProps {
    flexBasis: string;
    totalTemplates: number;
}

const ViewAllCard: React.FC<ViewAllCardProps> = ({ flexBasis, totalTemplates }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate('/docsnap/template/list')}
            className="cursor-pointer rounded-2xl border border-sky-200 bg-white transition hover:bg-gray-50"
            style={{ flexBasis, minWidth: 0 }}
        >
            <div className="flex h-40 items-center justify-center">
                <div className="flex items-center gap-2 text-sky-600">
                    <span className="text-sm font-medium">View All {totalTemplates} Templates</span>
                    <ChevronRight size={16} />
                </div>
            </div>
        </div>
    );
};
