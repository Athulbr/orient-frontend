import { Plus } from 'lucide-react';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/Button';
import { useDashboardState } from '../hooks/dashboardContext';
import { usePermissionStore } from '../../../zustand-store/PermissionStore';
import { useToastStore } from '../../../components/toast/ToastStore';

export const DashboardHeaderComponent: FC = () => {
    const { state, setState } = useDashboardState();
    const { user } = usePermissionStore();
    const toast = useToastStore();
    const navigate = useNavigate();

    const handleCreateTemplateClick = () => {
        if (user?.role?.name === 'superadmin') {
            const selectedTenant = sessionStorage.getItem('selectedTenant');
            if (!selectedTenant) {
                toast.error('Please select a tenant');
                return;
            }
            setState({ ...state, showCreateTemplateDialog: true });
        } else {
            setState({ ...state, showCreateTemplateDialog: true });
        }
    };

    return (
        <section className="flex w-full items-center justify-between gap-y-4 px-2">
            <div className="flex-1 text-xl lg:text-2xl">
                Welcome to makez.ai, <span className="capitalize">{user?.firstName}</span>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    outlined
                    onClick={() => navigate('/docsnap/template/list')}
                >
                    View Template
                </Button>
                <Button
                    permission="create:template"
                    startIcon={<Plus strokeWidth={1.5} size={18} />}
                    onClick={handleCreateTemplateClick}
                    data-tour-id="create-template"
                >
                    Create Template
                </Button>
            </div>
        </section>
    );
};
