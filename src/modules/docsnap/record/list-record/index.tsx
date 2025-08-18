import PageContainer from '../../../../components/PageContainer';
import PageNameComponent from '../../../../components/PageName';
import { useState } from 'react';
import { ListRecordPageStateProvider } from './hooks/listRecordPageContext';
import { ListRecordComponent } from './ListRecordComponent';
import { PromptFieldIF } from '../../document';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import { Button } from '../../../../components/Button';
interface Project {
    _id: string;
    name: string;
}
interface Document {
    _id: string;
    name: string;
    fields: PromptFieldIF[];
    docType: string;
    primaryModel: string;
    enableOcr: boolean;
}

export interface ListRecordPageStateIF {
    refresh: number;
    fileUploadDialog: boolean;
    loadingProjects: boolean;
    loadingDocuments: boolean;
    projects: Project[];
    projectId: string;
    documents: Document[];
    document: Document | null;
    processing: boolean;
    uploading: boolean;
    analyzing: boolean;
    uploadDone: boolean;
    analyzeDone: boolean;
    dealerSelectionDialog: boolean;
    query: any;
}

const initialState = {
    refresh: 1,
    loadingProjects: false,
    loadingDocuments: false,
    projects: [],
    projectId: '',
    documents: [],
    document: null,
    fileUploadDialog: false,
    processing: false,
    uploading: false,
    analyzing: false,
    uploadDone: false,
    analyzeDone: false,
    dealerSelectionDialog: false,
    query: {}
};

const ListRecordPage: React.FC = () => {
    const [state, setState] = useState<ListRecordPageStateIF>(initialState);
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const selectedFilter = params.get('status') || '' ? { status: params.get('status') || '' } : {};

    return (
        <ListRecordPageStateProvider value={{ state, setState }}>
            <PageContainer className="gap-4 p-6">
                <Breadcrumbs page="listRecord" />
                <PageNameComponent
                    name={`List of ${selectedFilter.status ? selectedFilter.status?.charAt(0).toUpperCase() + selectedFilter.status?.slice(1) : 'All'} Records`}
                    showBackButton
                    customGoBackFunction={() => navigate('/')}
                >
                    <Button outlined onClick={() => navigate('/docsnap/template/list')}>
                        Templates
                    </Button>
                </PageNameComponent>
                <ListRecordComponent />
                {/* <FileUploadDialogComponent /> */}
            </PageContainer>
        </ListRecordPageStateProvider>
    );
};

export default ListRecordPage;
