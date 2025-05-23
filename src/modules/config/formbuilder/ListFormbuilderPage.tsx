import { useNavigate } from 'react-router-dom';
import { StatusCustomUI, DeleteCustomUI, DateCustomUI } from '../../../builders/tablebuilder/render-tablebuilder/components/CustomUI';
import { UseTablebuilder } from '../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';
import httpRequest from '../../../utils/httpRequest';
import { useToastStore } from '../../../components/toast/ToastStore';
import { useState } from 'react';

interface ListFormbuilderPageIF {
  test?: string;
}

const ListFormbuilderPage: React.FC<ListFormbuilderPageIF> = () => {
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(1);

  const toast = useToastStore();

  const actionButtons = [
    {
      label: 'Create Formbuilder',
      action: () => {
        navigate('/config/formbuilder/create');
      },
    },
  ];

  const customFunctions = {
    editClickHandler: (row: Record<string, string>) => {
      navigate(`/config/formbuilder/update/${row._id}`);
    },
    deleteClickHandler: async (row: Record<string, string>) => {
      try {
        await httpRequest('DELETE', `http://localhost:4600/api/formbuilder/${row._id}`);
        toast.success('Formbuilder updated successfully');
        setRefresh(prev => prev + 1);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      } finally {
      }
    },
  };
  const customUI = {
    status: StatusCustomUI,
  };
  return (
    <PageContainer className="gap-2">
      <PageNameComponent name="Formbuilder List" showBackButton />
      <UseTablebuilder
        refresh={refresh}
        name="list formbuilder"
        customUI={customUI}
        fluidHeight
        actionButtons={actionButtons}
        customFunctions={customFunctions}
      />
    </PageContainer>
  );
};

export default ListFormbuilderPage;
