import { useState } from 'react';
import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';
import { DocumentStateProvider } from './hooks/documentContext';
import CreateDocumentComponent from './CreateDocumentComponent';
import { ListDocumentComponent } from './ListDocumentComponent';

export interface PromptFieldIF {
  name: string;
  dataType: string;
  jsonKey: string;
  excludeExtraction: boolean;
  description: string;
  instruction: string;
  subFields?: {
    name: string;
    dataType: string;
    jsonKey: string;
    excludeExtraction: boolean;
    description: string;
    instruction: string;
  }[];
}

export interface DocumentStateIF {
  showCreatePage: boolean;
  showCreateDialog: boolean;
  loading: boolean;
  id: string;
  document: any | null;
  projectId: string;
  showAddFieldDialog: boolean;
  showAddSubFieldDialog: boolean;
  fields: PromptFieldIF[];
  editFieldData: Record<string, any> | null;
  editFieldIndex: number | null;
  refresh: number;
}
const initialState: DocumentStateIF = {
  showCreatePage: false,
  showCreateDialog: false,
  loading: false,
  id: '',
  document: null,
  projectId: '',
  showAddFieldDialog: false,
  showAddSubFieldDialog: false,
  fields: [],
  editFieldData: null,
  editFieldIndex: null,
  refresh: 0,
};

const ListDocumentPage: React.FC = () => {
  const [state, setState] = useState<DocumentStateIF>(initialState);

  return (
    <DocumentStateProvider value={{ state, setState }}>
      {state.showCreatePage ? (
        <CreateDocumentComponent />
      ) : (
        <PageContainer className="gap-2">
          <PageNameComponent name="Document List" showBackButton />
          <ListDocumentComponent />
        </PageContainer>
      )}
    </DocumentStateProvider>
  );
};

export default ListDocumentPage;
