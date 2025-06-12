// FormBuilderProvider.tsx
import React, { createContext, useState, ReactNode } from 'react';
import { FieldIF, FormBuilderContextType, FormSettingsIF } from '../../interface';
import { httpAiRequest } from '../../utils/functions/httpAiRequest';
import { useNavigate, useParams } from 'react-router-dom';
import { useToastStore } from '../../../../components/toast/ToastStore';

const FormBuilderContext = createContext<FormBuilderContextType | undefined>(undefined);

export const FormBuilderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showInputType, setShowInputType] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showFieldInputError, setShowFieldInputError] = useState(false);
  const [showSettings, setShowSettings] = useState(-1);
  const [fields, setFields] = useState<FieldIF[]>([]);
  const [formSettings, setFormSettings] = useState<FormSettingsIF>({
    columns: 2,
  });
  const [formbuilderName, setFormbuilderName] = useState('');
  const toast = useToastStore();

  const createForm = async () => {
    try {
      setLoading(true);
      const formName = prompt('Enter form name');
      await httpAiRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/builder/formbuilder`, {
        name: formName || 'Form-1',
        fields,
        settings: formSettings,
      });
      toast.success('Formbuilder updated successfully');
      navigate('/config/formbuilder/list');
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  const updateForm = async () => {
    try {
      setLoading(true);
      await httpAiRequest('PUT', `${import.meta.env.VITE_NODE_URL}/api/builder/formbuilder/${id}`, {
        name: formbuilderName || 'Form-1',
        fields,
        settings: formSettings,
      });
      toast.success('Formbuilder updated successfully');
      navigate('/config/formbuilder/list');
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  const getFormbuilderByIdApi = async () => {
    try {
      setLoading(true);
      const res = await httpAiRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/builder/formbuilder/${id}`);
      setFields(res?.data.fields);
      setFormbuilderName(res?.data.name);
      setFormSettings(res?.data.settings);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const contextValue: FormBuilderContextType = {
    loading,
    showInputType,
    setShowInputType,
    showSettings,
    setShowSettings,
    fields,
    setFields,
    showChatbot,
    setShowChatbot,
    showFieldInputError,
    setShowFieldInputError,
    formSettings,
    setFormSettings,
    createForm,
    updateForm,
    getFormbuilderByIdApi,
  };

  return <FormBuilderContext.Provider value={contextValue}>{children}</FormBuilderContext.Provider>;
};

export { FormBuilderContext };
