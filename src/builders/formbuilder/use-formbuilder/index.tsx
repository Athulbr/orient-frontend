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
  loading?: boolean;
}

export const UseFormbuilder: React.FC<UseFormbuilderIF> = ({ isOpen = true, name, closeDialog, onSubmit, existingData = null, className, title, loading }) => {
  const [fields, setFields] = useState<FieldIF[]>([]);
  const [settings, setSettings] = useState({
    columns: 1,
  });

  const getFormbuilder = async () => {
    // const formbuilder = window?.sessionStorage?.getItem('formbuilder');
    // if (formbuilder) {
    //   const data = JSON.parse(formbuilder);
    //   const formData = data.find((item: any) => item.name === name);
    //   if (formData.fields.length) {
    //     setFields(formData.fields);
    //     setSettings(formData.settings);
    //     return;
    //   }
    // }
    const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/builder/formbuilder/name`, { name });
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
    <DialogComponent loading={loading} closeDialog={closeDialog} isOpen={isOpen} name={title ? title : name} className={className}>
      <RenderForm fields={fields} submitClickHandler={onSubmit} cancelClickHandler={closeDialog} columns={settings.columns} />
    </DialogComponent>
  );
};
