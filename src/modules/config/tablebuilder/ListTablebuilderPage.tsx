import { useNavigate } from 'react-router-dom';
import { UseTablebuilder } from '../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';
import Breadcrumbs from '../../../components/Breadcrumbs';

interface ListTablebuilderPageIF {
  test?: string;
}

const ListTablebuilderPage: React.FC<ListTablebuilderPageIF> = () => {
  const navigate = useNavigate();
  const actionButtons = [
    {
      label: 'Create Tablebuilder',
      action: () => {
        navigate('/config/tablebuilder/create');
      },
    },
  ];
  const customFunctions = {
    rowClickHandler: (row: Record<string, string>) => {
      navigate(`/config/tablebuilder/update/${row._id}`);
    },
  };
  return (
    <PageContainer className="gap-2">
      <PageNameComponent name="Tablebuilder List" showBackButton>
        <Breadcrumbs page="listTablebuilder" />
      </PageNameComponent>
      <UseTablebuilder name="list tablebuilder" fluidHeight actionButtons={actionButtons} customFunctions={customFunctions} />
    </PageContainer>
  );
};

export default ListTablebuilderPage;
