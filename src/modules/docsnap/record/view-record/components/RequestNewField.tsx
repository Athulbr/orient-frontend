import { UseFormbuilder } from '../../../../../builders/formbuilder/use-formbuilder';
import { Button } from '../../../../../components/Button';
import { DialogComponent } from '../../../../../components/DialogComponent';
import { useState } from 'react';

interface RequestNewFieldIF {
  test?: string;
}

const RequestNewField: React.FC<RequestNewFieldIF> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onSubmit = (fields: any) => {
    console.log('fields:============', fields);
  };
  return (
    <div className="">
      <Button small outlined onClick={() => setIsOpen(true)}>
        Request New Field
      </Button>
      <UseFormbuilder onSubmit={onSubmit} name="Request New Field Form" className="w-100" closeDialog={() => setIsOpen(false)} isOpen={isOpen} />
    </div>
  );
};

export default RequestNewField;
