import { useNavigate } from 'react-router-dom';
import { UseTablebuilder } from '../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import PageNameComponent from '../../../components/PageName';
import PageContainer from '../../../components/PageContainer';
import { StatusCustomUI } from '../../../builders/tablebuilder/render-tablebuilder/components/CustomUI';

interface ListRolePageIF {
  test?: string;
}

const ListRolePage: React.FC<ListRolePageIF> = () => {
  const navigate = useNavigate();
  const actionButtons = [
    {
      label: 'Create Role',
      action: () => {
        navigate('/config/role/create');
      },
    },
  ];
  const customFunctions = {
    rowClickHandler: (row: Record<string, string>) => {
      navigate(`/config/role/update/${row._id}`);
    },
  };
  const customUI = {
    status: StatusCustomUI,
  };
  return (
    <PageContainer className="gap-4">
      <PageNameComponent name="Role List" showBackButton />
      <UseTablebuilder name="list user" fluidHeight customUI={customUI} />
    </PageContainer>
  );
};

export default ListRolePage;
