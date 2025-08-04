import { UseFormbuilder } from '../../../builders/formbuilder/use-formbuilder';
import { useProjectState } from './hooks/projectContext';
import { useProjectApi } from './hooks/useProjectApi';

const CreateProjectComponent: React.FC = ({}) => {
    const { state, setState } = useProjectState();
    const { createProjectApi, updateProjectApi } = useProjectApi();
    return (
        <UseFormbuilder
            isOpen={state.showCreateDialog}
            title={state.id ? 'Update Project' : 'Add Project'}
            name="Create Project Form"
            className="w-130"
            onSubmit={state.id ? updateProjectApi : createProjectApi}
            closeDialog={() => setState(prev => ({ ...prev, showCreateDialog: false, id: '', project: {} }))}
            existingData={state.project || {}}
            loading={state.loadingProject}
        />
    );
};

export default CreateProjectComponent;
