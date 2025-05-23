import { useState } from 'react';
import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';
import { DocumentStateProvider } from './hooks/documentContext';
import CreateDocumentComponent from './CreateDocumentComponent';
import { ListDocumentComponent } from './ListDocumentComponent';

export interface DocumentStateIF {
  showCreatePage: boolean;
  loading: boolean;
  id: string;
  showAddFieldDialog: boolean;
  showAddSubFieldDialog: boolean;
  prompt: any[];
}
const initialState = {
  showCreatePage: false,
  loading: false,
  id: '',
  showAddFieldDialog: false,
  showAddSubFieldDialog: false,
  prompt: [],
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
