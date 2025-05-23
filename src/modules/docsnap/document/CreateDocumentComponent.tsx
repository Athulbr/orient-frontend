import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';
import { useDocumentState } from './hooks/documentContext';
import pdfLocation from '../../../assets/temp/PO_Private_00114126882.pdf';
import { Button } from '../../../components/button/Button';
import { Copy, Edit, Plus, Save, Trash } from 'lucide-react';
import { UseFormbuilder } from '../../../builders/formbuilder/use-formbuilder';

const array = ['1', '2', '3', '4', '1', '2', '3', '4', '1', '2', '3', '4'];

const CreateDocumentComponent: React.FC = ({}) => {
  const { state, setState } = useDocumentState();
  return (
    <PageContainer className="gap-2">
      <PageNameComponent
        name={state.id ? 'Update Document' : 'Create Document'}
        showBackButton
        customGoBackFunction={() => setState(prev => ({ ...prev, showCreatePage: false, id: '' }))}
      />
      <div className="flex h-full flex-1 gap-2 overflow-auto">
        <DocumentPreviewComponent />
        <div className="flex flex-1 flex-col overflow-auto">
          <ActionButtons />
          <FieldListComponent />
        </div>
      </div>
      <UseFormbuilder
        className="w-200"
        isOpen={state.showAddFieldDialog}
        name="Create Document Field Form"
        closeDialog={() => setState(prev => ({ ...prev, showAddFieldDialog: false }))}
        onSubmit={field => setState(prev => ({ ...prev, prompt: [...prev.prompt, field], showAddFieldDialog: false }))}
      />
    </PageContainer>
  );
};

export default CreateDocumentComponent;

const DocumentPreviewComponent = () => {
  return (
    <div className="h-full w-3/5">
      <iframe src={pdfLocation} width="100%" height="100%" />
    </div>
  );
};
const ActionButtons = () => {
  const { state, setState } = useDocumentState();

  return (
    <div className="sticky top-0 flex justify-between bg-white p-2 pt-1">
      <Button outlined startIcon={<Plus size={18} />} onClick={() => setState(prev => ({ ...prev, showAddFieldDialog: true }))}>
        Add Field
      </Button>
      <Button outlined startIcon={<Save size={18} />}>
        Save
      </Button>
    </div>
  );
};

const FieldListComponent = () => {
  const { state, setState } = useDocumentState();

  const iconClassName = 'cursor-pointer text-gray-600 hover:text-sky-800';

  return (
    <div className="flex w-full flex-1 flex-col gap-4 overflow-y-auto px-2">
      {state.prompt.map((item, index) => (
        <div className="flex w-full flex-col justify-between gap-5 rounded-lg border bg-gray-50 p-4 shadow-sm">
          <div className="flex w-full justify-between">
            <div className="text-sm">
              <span className="pr-2 font-semibold">Name:</span>Purchase Order
            </div>
            <div className="text-sm">
              <span className="pr-2 font-semibold">Json Key:</span>purchase_order
            </div>
            <div className="text-sm">
              <span className="pr-2 font-semibold">Type:</span>String
            </div>
            <div className="flex gap-2">
              <Copy className={iconClassName} size={18} /> <Edit className={iconClassName} size={18} /> <Trash className={iconClassName} size={18} />
            </div>
          </div>
          <div className="text-sm">
            <span className="pr-2 font-semibold">Instruction:</span>

            <span className="leading-7">
              Look for labels such as 'PO Number', 'PO #', 'Purchase Order #','Service Authorization Number' or similar. Extract the full alphanumeric
              identifier without any prefixes.
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
