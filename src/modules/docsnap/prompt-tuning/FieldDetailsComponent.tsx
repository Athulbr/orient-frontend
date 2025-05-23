import { UpdatedFieldsIF } from './interface';

interface FieldDetailsComponentIF {
  selectedRow: UpdatedFieldsIF | null;
}

const FieldDetailsComponent: React.FC<FieldDetailsComponentIF> = ({ selectedRow }) => {
  return (
    <section className="flex flex-col gap-3 rounded-lg border p-4">
      <header className="text-l font-semibold">Project: {selectedRow?.projectName}</header>
      <header className="text-l">Field: {selectedRow?.fieldName}</header>
    </section>
  );
};

export default FieldDetailsComponent;
