import { CreateTablebuilder } from '../../../builders/tablebuilder/create-tablebuilder';

interface CreateTablebuilderPageIF {
  update?: boolean;
}

const CreateTablebuilderPage: React.FC<CreateTablebuilderPageIF> = ({ update }) => {
  return <CreateTablebuilder update={update} />;
};

export default CreateTablebuilderPage;
