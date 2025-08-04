import { useNavigate } from 'react-router-dom';
import { UseTablebuilder } from '../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';

interface ListCommentPageIF {
    test?: string;
}

const ListCommentPage: React.FC<ListCommentPageIF> = () => {
    const navigate = useNavigate();
    const actionButtons = [
        {
            label: 'Create Comment',
            action: () => {
                navigate('/config/comment/create');
            }
        }
    ];
    const customFunctions = {
        rowClickHandler: (row: Record<string, string>) => {
            navigate(`/config/comment/update/${row._id}`);
        },
        editClickHandler: () => {
            alert('vinayak');
        }
    };
    const customUI = {};
    return (
        <PageContainer className="gap-4">
            <PageNameComponent name="Comment List" />
            <UseTablebuilder
                name="List Comments"
                customFunctions={customFunctions}
                fluidHeight
                customUI={customUI}
                deletePermission="delete:comment"
                updatePermission="update:comment"
            />
        </PageContainer>
    );
};

export default ListCommentPage;
