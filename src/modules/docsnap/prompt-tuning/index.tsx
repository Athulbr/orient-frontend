import { useState } from 'react';
import { UpdatedFieldsIF } from './interface';
import FieldDetailsComponent from './FieldDetailsComponent';
import TuningInputComponent from './TuningInputComponent';
import { DialogComponent } from '../../../components/Dialog';
import { UseTablebuilder } from '../../../builders/tablebuilder/render-tablebuilder/components/UseTablebuilder';
import PageNameComponent from '../../../components/PageName';
import PageContainer from '../../../components/PageContainer';

const UpdatedFieldsListPage: React.FC = () => {
  const [dialog, setDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<UpdatedFieldsIF | null>(null);

  const customFunctions = {
    rowClickHandler: (data: UpdatedFieldsIF) => {
      setDialog(true);
      setSelectedRow(data);
    },
  };
  const tablebuilderFilters = { projectName: selectedRow?.projectName || '', jsonKey: selectedRow?.jsonKey || '' };

  return (
    <PageContainer>
      <PageNameComponent name="Updated Fields" showBackButton />
      <UseTablebuilder name="updated fields" customFunctions={customFunctions} fluidHeight />
      {/* <PromptTuningDialog isOpen={dialog} closeDialog={() => setDialog(false)} selectedRow={selectedRow} /> */}
      <DialogComponent name="Prompt Tunning" className="h-4/5 w-3/4" isOpen={dialog} closeDialog={() => setDialog(false)}>
        <div className="flex max-w-full flex-col gap-10 p-5">
          <FieldDetailsComponent selectedRow={selectedRow} />
          <UseTablebuilder name="updated field comment" externalFilters={tablebuilderFilters} />
          <TuningInputComponent selectedRow={selectedRow} />
        </div>
      </DialogComponent>
    </PageContainer>
  );
};

export default UpdatedFieldsListPage;
