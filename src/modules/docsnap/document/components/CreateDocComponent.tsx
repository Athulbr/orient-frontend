import { UseFormbuilder } from '../../../../builders/formbuilder/use-formbuilder';
import { useDocumentState } from '../hooks/documentContext';
import { useDocumentsApi } from '../hooks/useDocumentApi';

const CreateDocComponent: React.FC = ({}) => {
    const { state, setState } = useDocumentState();
    const { createDocumentApi, updateDocumentApi } = useDocumentsApi();
    return (
        <UseFormbuilder
            isOpen={state.showCreateDialog}
            title={state.id ? 'Update Document' : 'Add Document'}
            name="Create Document Form"
            className="w-130"
            onSubmit={state.id ? updateDocumentApi : createDocumentApi}
            closeDialog={() => setState(prev => ({ ...prev, showCreateDialog: false, showCreatePage: false, id: '', document: {} }))}
            existingData={state.document || {}}
            loading={state.loading}
        />
    );
};

export default CreateDocComponent;
