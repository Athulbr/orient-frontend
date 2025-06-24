import { useNavigate } from 'react-router-dom';
import { UseTablebuilder } from '../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import PageNameComponent from '../../../components/PageName';
import PageContainer from '../../../components/PageContainer';
import { StatusCustomUI } from '../../../builders/tablebuilder/render-tablebuilder/components/CustomUI';
import Breadcrumbs from '../../../components/Breadcrumbs';

interface ListPermissionPageIF {
  test?: string;
}

const ListPermissionPage: React.FC<ListPermissionPageIF> = () => {
  const navigate = useNavigate();
  const actionButtons = [
    {
      label: 'Create Permission',
      action: () => {
        navigate('/config/permission/create');
      },
    },
  ];
  const customFunctions = {
    rowClickHandler: (row: Record<string, string>) => {
      navigate(`/config/permission/update/${row._id}`);
    },
  };
  const customUI = {
    status: StatusCustomUI,
  };
  return (
    <PageContainer className="gap-4 p-4">
      <PageNameComponent name="Permission List">
        <Breadcrumbs page="listPermission" />
      </PageNameComponent>
      <UseTablebuilder name="list user" fluidHeight customUI={customUI} />
    </PageContainer>
  );
};

export default ListPermissionPage;
