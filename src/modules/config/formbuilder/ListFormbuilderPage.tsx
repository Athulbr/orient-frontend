import { useNavigate } from 'react-router-dom';
import { StatusCustomUI } from '../../../builders/tablebuilder/render-tablebuilder/components/CustomUI';
import { UseTablebuilder } from '../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';
import httpRequest from '../../../global-utils/httpRequest';
import { useToastStore } from '../../../components/toast/ToastStore';
import { useState } from 'react';
import Breadcrumbs from '../../../components/Breadcrumbs';

interface ListFormbuilderPageIF {
    test?: string;
}

const ListFormbuilderPage: React.FC<ListFormbuilderPageIF> = () => {
    const navigate = useNavigate();
    const [refresh, setRefresh] = useState(1);
    const [refreshingCache, setRefreshingCache] = useState(false);

    const toast = useToastStore();

    const refreshCache = async () => {
        try {
            setRefreshingCache(true);
            const formbuilderesponse = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/builder/formbuilder/query`, { pageSize: 1000 });
            window?.sessionStorage?.setItem('formbuilder', JSON.stringify(formbuilderesponse?.data));
            toast.success('Cache refreshed successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to refresh cache');
        } finally {
            setRefreshingCache(false);
        }
    };

    const actionButtons = [
        {
            label: 'Create Formbuilder',
            action: () => {
                navigate('/config/formbuilder/create');
            }
        },
        {
            label: refreshingCache ? 'Refreshing Cache...' : 'Refresh Cache',
            action: refreshCache,
            loading: refreshingCache
        }
    ];

    const customFunctions = {
        editClickHandler: (row: Record<string, string>) => {
            navigate(`/config/formbuilder/update/${row._id}`);
        },
        deleteClickHandler: async (row: Record<string, string>) => {
            try {
                await httpRequest('DELETE', `${import.meta.env.VITE_NODE_URL}/builder/formbuilder/${row._id}`);
                toast.success('Formbuilder updated successfully');
                setRefresh(prev => prev + 1);
                return true;
            } catch (error) {
                console.error(error);
                return false;
            }
        }
    };
    const customUI = {
        status: StatusCustomUI
    };
    return (
        <PageContainer className="gap-2">
            <PageNameComponent name="Formbuilder List" />
            <UseTablebuilder
                refresh={refresh}
                name="list formbuilder"
                customUI={customUI}
                fluidHeight
                actionButtons={actionButtons}
                customFunctions={customFunctions}
                deletePermission="delete:formbuilder"
                updatePermission="update:formbuilder"
            />
        </PageContainer>
    );
};

export default ListFormbuilderPage;
