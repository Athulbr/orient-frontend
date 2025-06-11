import { useEffect, useState } from 'react';
import { DialogComponent } from '../../../components/DialogComponent';
import httpRequest from '../../../utils/httpRequest';
import { RenderForm } from '../render-form/RenderForm';
import { FieldIF } from '../interface';

interface UseFormbuilderIF {
  isOpen?: boolean;
  className?: string;
  existingData?: Record<string, any> | null;
  name: string;
  title?: string;
  closeDialog: () => void;
  onSubmit: (fields: FieldIF[]) => void;
}

export const UseFormbuilder: React.FC<UseFormbuilderIF> = ({ isOpen = true, name, closeDialog, onSubmit, existingData = null, className, title }) => {
  const [fields, setFields] = useState<FieldIF[]>([]);
  const [settings, setSettings] = useState({
    columns: 2,
  });

  const getFormbuilder = async () => {
    const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/formbuilder/name`, { name });
    setFields(res.data.fields);
    setSettings(res.data.settings);
  };

  useEffect(() => {
    if (name) getFormbuilder();
  }, [name]);

  useEffect(() => {
    if (!existingData) return;
    const fieldsCopy = [...fields];
    const updatedFields: FieldIF[] = fieldsCopy.map((field: FieldIF) => {
      if (field.type === 'checkbox') {
        field.value = existingData[field.key];
        return field;
      }
      field.value = existingData[field.key] || '';
      return field;
    });
    setFields(updatedFields);
  }, [existingData]);
  return (
    <DialogComponent closeDialog={closeDialog} isOpen={isOpen} name={title ? title : name} className={className}>
      <RenderForm fields={fields} submitClickHandler={onSubmit} cancelClickHandler={closeDialog} columns={settings.columns} />
    </DialogComponent>
  );
};
