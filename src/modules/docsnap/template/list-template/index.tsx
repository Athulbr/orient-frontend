import { useState } from 'react';
import PageContainer from '../../../../components/PageContainer';
import PageNameComponent from '../../../../components/PageName';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import { TemplateStateProvider } from './hooks/templateContext';
import { UploadDocumentComponent } from '../../upload-document';
import { CreateTemplateComponent } from './components/CreateTemplateDialog';
import PageActionsComponent from './components/PageActionsComponent';
import ListTemplateComponent from './ListTemplateComponent';
import { UploadDocumentComponentNew } from '../../upload-document-new';

export interface TemplateStateIF {
    id: string;
    templates: any[];
    loadingTemplates: boolean;
    showCreateTemplateDialog: boolean;
    showUploadDocumentDialog: boolean;
    selectedTemplate: any;
    refresh: number;
    predefinedTemplates: any[];
    loadingPredefinedTemplates: boolean;
    loadingCreateTemplate: boolean;
    searchText: string;
}
const initialState = {
    id: '',
    templates: [],
    loadingTemplates: false,
    showCreateTemplateDialog: false,
    showUploadDocumentDialog: false,
    selectedTemplate: null,
    refresh: 1,
    predefinedTemplates: [],
    loadingPredefinedTemplates: false,
    loadingCreateTemplate: false,
    searchText: ''
};

const ListTemplatePage: React.FC = () => {
    const [state, setState] = useState<TemplateStateIF>(initialState);
    const showNewExtractionWindowUI = localStorage.getItem('user') === 'vinayak' ? true : false;

    return (
        <TemplateStateProvider value={{ state, setState }}>
            <PageContainer className="gap-4 p-2 md:p-6">
                <Breadcrumbs page="listTemplate" />
                <PageNameComponent name="List of Templates" showBackButton>
                    <PageActionsComponent />
                </PageNameComponent>
                <div className="w-full flex-1 flex-col overflow-y-auto">
                    <ListTemplateComponent />
                </div>
            </PageContainer>
            <CreateTemplateComponent state={state} setState={setState} />
            {state.showUploadDocumentDialog && (
                <>
                    {!showNewExtractionWindowUI ? (
                        <UploadDocumentComponent
                            template={state.selectedTemplate}
                            closeDialog={() => setState({ ...state, showUploadDocumentDialog: false })}
                        />
                    ) : (
                        <UploadDocumentComponentNew
                            template={state.selectedTemplate}
                            closeDialog={() => setState({ ...state, showUploadDocumentDialog: false })}
                        />
                    )}
                </>
            )}
        </TemplateStateProvider>
    );
};

export default ListTemplatePage;
