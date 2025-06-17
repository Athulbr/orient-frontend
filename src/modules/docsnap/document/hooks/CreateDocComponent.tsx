import { UseFormbuilder } from '../../../../builders/formbuilder/use-formbuilder';
import { useDocumentState } from './documentContext';
import { useDocumentsApi } from './useDocumentApi';

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
// This component is used to create or update a document using the form builder.
// It uses the `UseFormbuilder` component to handle the form submission and display.
// The `onSubmit` prop is set to either `createDocumentApi` or `updateDocumentApi` based on whether an ID is present in the state.
// The `closeDialog` prop is used to close the dialog and reset the state after submission.
// The `existingData` prop is used to pre-fill the form with existing document data if available.
// The component also displays a loading state while the form is being submitted.
// The `isOpen` prop controls the visibility of the form dialog based on the `showCreateDialog` state.
// The `title` prop sets the title of the dialog based on whether the document is being created or updated.
// The `className` prop sets the width of the form dialog.
