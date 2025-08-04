import { useNavigate } from 'react-router-dom';
import { StatusCustomUI } from '../../../builders/tablebuilder/render-tablebuilder/components/CustomUI';
import { UseTablebuilder } from '../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import { useProjectState } from './hooks/projectContext';
import { useProjectApi } from './hooks/useProjectApi';

export const ListProjectComponent: React.FC = () => {
    const { state, setState } = useProjectState();
    const { getProjectApi, deleteProjectApi } = useProjectApi();

    const navigate = useNavigate();
    const actionButtons = [
        {
            label: 'Create Project',
            action: () => {
                setState(prev => ({ ...prev, showCreateDialog: true }));
            }
        }
    ];
    const customFunctions = {
        rowClickHandler: (row: any) => {
            navigate(`/docsnap/document/list/${row._id}`);
        },
        editClickHandler: (row: any) => {
            getProjectApi(row._id);
            setState(prev => ({ ...prev, showCreateDialog: true, id: row._id }));
        },
        deleteClickHandler: (row: any) => {
            deleteProjectApi(row._id);
        }
    };
    const customUI = {
        status: StatusCustomUI
    };
    return (
        <UseTablebuilder
            name="List Project Table"
            fluidHeight
            refresh={state.refresh}
            customFunctions={customFunctions}
            customUI={customUI}
            actionButtons={actionButtons}
            deletePermission="delete:project"
            updatePermission="update:project"
        />
    );
};
