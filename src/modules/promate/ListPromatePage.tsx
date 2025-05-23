import { useNavigate } from 'react-router-dom';
import { UseTablebuilder } from '../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import PageNameComponent from '../../components/PageName';
import PageContainer from '../../components/PageContainer';
import { StatusCustomUI } from '../../builders/tablebuilder/render-tablebuilder/components/CustomUI';

interface ListPromatePageIF {
  test?: string;
}

const ListPromatePage: React.FC<ListPromatePageIF> = () => {
  const navigate = useNavigate();
  const actionButtons = [
    {
      label: 'Create Promate',
      action: () => {
        navigate('/config/promate/create');
      },
    },
  ];
  const customFunctions = {
    rowClickHandler: (row: Record<string, string>) => {
      navigate(`/config/promate/update/${row._id}`);
    },
  };
  const customUI = {
    status: StatusCustomUI,
  };
  return (
    <PageContainer className="gap-4">
      <PageNameComponent name="Promate List" />
      <UseTablebuilder name="list user" fluidHeight customUI={customUI} />
    </PageContainer>
  );
};

export default ListPromatePage;
