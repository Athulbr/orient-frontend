import { CreateFormbuilder } from '../../../builders/formbuilder/create-form';

interface CreateFormbuilderPageIF {
  test?: string;
}

const CreateFormbuilderPage: React.FC<CreateFormbuilderPageIF> = () => {
  return (
    <div className="flex-1 overflow-y-auto p-2">
      <CreateFormbuilder />
    </div>
  );
};

export default CreateFormbuilderPage;
