import { DialogComponent } from '../../../components/DialogComponent';
import DragAndDropFileInput from '../../../components/DragAndDropFileInput';
import { useDocsnapStore } from '../../../zustand-store/DocsnapStore';
import { useNavigate } from 'react-router-dom';
interface UploadDocumentComponentIF {
  template?: string;
  closeDialog: () => void;
}

export const UploadDocumentComponent: React.FC<UploadDocumentComponentIF> = ({ closeDialog, template }) => {
  const { addToExtraction } = useDocsnapStore();
  const navigate = useNavigate();
  const onFileDrop = (files: FileList) => {
    addToExtraction(files, template || '');
    navigate('/docsnap/record/list');
    closeDialog();
  };
  return (
    <DialogComponent
      className="flex max-h-[calc(100vh-200px)] min-h-[calc(100vh-200px)] w-[80vw] flex-col overflow-y-auto"
      name="Upload Documents"
      isOpen={true}
      closeDialog={closeDialog}
    >
      <div className="flex h-full w-full flex-1 flex-col overflow-y-auto p-10">
        <DragAndDropFileInput onFileDrop={onFileDrop} />
      </div>
    </DialogComponent>
  );
};
