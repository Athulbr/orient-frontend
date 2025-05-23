import { useEffect, useState } from 'react';
import { DialogComponent } from '../../../components/Dialog';
import httpRequest from '../../../utils/httpRequest';
import { RenderForm } from '../render-form/RenderForm';
import { FieldIF } from '../interface';

interface UseFormbuilderIF {
  isOpen?: boolean;
  className?: string;
  name: string;
  title?: string;
  closeDialog: () => void;
  onSubmit: (fields: FieldIF[]) => void;
}

export const UseFormbuilder: React.FC<UseFormbuilderIF> = ({ isOpen = true, name, closeDialog, onSubmit, className, title }) => {
  const [fields, setFields] = useState([]);
  const [settings, setSettings] = useState({
    columns: 2,
  });

  const getFormbuilder = async () => {
    const res = await httpRequest('POST', 'http://localhost:4600/api/formbuilder/name', { name });
    setFields(res.data.fields);
    setSettings(res.data.settings);
  };

  useEffect(() => {
    if (name) getFormbuilder();
  }, [name]);
  return (
    <DialogComponent closeDialog={closeDialog} isOpen={isOpen} name={title ? title : name} className={className}>
      <RenderForm fields={fields} submitClickHandler={onSubmit} cancelClickHandler={closeDialog} columns={settings.columns} />
    </DialogComponent>
  );
};
