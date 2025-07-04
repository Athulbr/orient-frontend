import PageContainer from '../../../../components/PageContainer';
import PageNameComponent from '../../../../components/PageName';
import { RenderProjectComponent } from './ListProjectComponent';
import { useState } from 'react';
import { ListRecordPageStateProvider } from './hooks/listRecordPageContext';
import { ListRecordComponent } from './ListRecordComponent';
import FileUploadDialogComponent from './components/FileUploadDialogComponent';
import { PromptFieldIF } from '../../document';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '../../../../components/Breadcrumbs';
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
};

const ListRecordPage: React.FC = () => {
  const [state, setState] = useState<ListRecordPageStateIF>(initialState);
  const navigate = useNavigate();
  return (
    <ListRecordPageStateProvider value={{ state, setState }}>
      <PageContainer className="gap-4 p-6">
        <Breadcrumbs page="listRecord" />
        <PageNameComponent name="List of Records" showBackButton customGoBackFunction={() => navigate('/')} />
        <ListRecordComponent />
        <FileUploadDialogComponent />
      </PageContainer>
    </ListRecordPageStateProvider>
  );
};

export default ListRecordPage;
