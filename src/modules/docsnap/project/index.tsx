import { useState } from 'react';
import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';
import { ProjectStateProvider } from './hooks/projectContext';
import CreateProjectComponent from './CreateProjectComponent';
import { ListProjectComponent } from './ListProjectComponent';

export interface ProjectStateIF {
  showCreateDialog: boolean;
  loading: boolean;
  id: string;
}
const initialState = {
  showCreateDialog: false,
  loading: false,
  id: '',
};

const ListProjectPage: React.FC = () => {
  const [state, setState] = useState<ProjectStateIF>(initialState);

  return (
    <ProjectStateProvider value={{ state, setState }}>
      <PageContainer className="gap-4">
        <PageNameComponent name="Project List" showBackButton />
        <ListProjectComponent />
        <CreateProjectComponent />
      </PageContainer>
    </ProjectStateProvider>
  );
};

export default ListProjectPage;
