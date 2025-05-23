import { X } from 'lucide-react';
import { FieldIF, FormSettingsIF } from '../interface';
import { RenderForm } from '../render-form/RenderForm';
import style from './form-preview.module.css';
import { useRef, useEffect } from 'react';
import { DialogComponent } from '../../../components/Dialog';

interface FormPreviewIF {
  fields: FieldIF[];
  formSettings: FormSettingsIF;
  closePreview: () => void;
}

export const FormPreview: React.FC<FormPreviewIF> = ({ fields, formSettings, closePreview }) => {
  return (
    <DialogComponent isOpen closeDialog={() => alert('a')}>
      {/* <RenderForm formSettings={formSettings} fields={fields} />
       */}
      aa
    </DialogComponent>
  );
};
