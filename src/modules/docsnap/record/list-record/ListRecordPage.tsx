import { useNavigate } from 'react-router-dom';
import { StatusCustomUI } from '../../../../builders/tablebuilder/render-tablebuilder/components/CustomUI';
import { UseTablebuilder } from '../../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import { useAlertStore } from '../../../../components/alert/AlertStore';
import PageContainer from '../../../../components/PageContainer';
import PageNameComponent from '../../../../components/PageName';
import { ListProjectComponent } from './ListProjectComponent';

interface ListRecordPageIF {
  test?: string;
}

const ListRecordPage: React.FC<ListRecordPageIF> = () => {
  const { showAlert } = useAlertStore();
  const navigate = useNavigate();

  const handleClick = () => {
    showAlert({
      alertText:
        'Are you sure you want to delete this item? Are you sure you want to delete this item? Are you sure you want to delete this item? Are you sure you want to delete this item?',
      primaryButtonText: 'Delete',
      onPrimaryAction: () => {
        console.log('Deleted');
      },
    });
  };

  const customFunctions = {
    rowClickHandler: (row: any) => {
      navigate(`/docsnap/record/view/${row._id}`);
    },
  };
  const customUI = {
    status: StatusCustomUI,
  };
  return (
    <PageContainer className="gap-2">
      <PageNameComponent name="DocSnap"  />
      <ListProjectComponent />
      <UseTablebuilder customUI={customUI} name="List Record Table" fluidHeight customFunctions={customFunctions} />
    </PageContainer>
  );
};

export default ListRecordPage;
