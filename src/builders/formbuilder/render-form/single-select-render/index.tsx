import React, { useEffect, useState } from 'react';
import { FieldConfigIF, InputFieldRenderPropsIF } from '../../interface';
import { InputWrapper } from '../input-wrapper';
import CustomSelect from './SelectInput';
import httpRequest from '../../../../utils/httpRequest';

export const SingleSelectRender: React.FC<InputFieldRenderPropsIF> = ({ index, fields, setFields, inputWrapperClassName }) => {
  const field = fields[index];
  const { config, value, errorMessage } = field;
  const [focus, setFocus] = useState(false);
  const [optionList, setOptionList] = useState([]);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (config.optionSourceType === 'from API') {
      const getOptions = async () => {
        try {
          const res: any = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}${config.apiEndpoint}`);
          setOptionList(res.data);
        } catch (error) {
          setApiError('Failed to fetch options');
        }
      };
      getOptions();
    }
  }, [config.optionSourceType]);

  const handleBlur = () => {
    setFields(prev => {
      const updatedFields = [...prev];
      updatedFields[index] = { ...field, errorMessage: validateSingleSelect(value, config) };
      return updatedFields;
    });
    setFocus(false);
  };

  const handleChange = (newValue: string) => {
    setFields(prev => {
      const updatedFields = [...prev];
      updatedFields[index] = { ...field, value: newValue, errorMessage: validateSingleSelect(newValue, config) };
      return updatedFields;
    });
  };

  let options = config.optionSourceType === 'static' ? config.options : [];

  console.log('apiError:===========', apiError);

  return (
    <InputWrapper className={inputWrapperClassName} focus={focus} field={field} error={apiError || errorMessage || ''}>
      <CustomSelect onBlur={handleBlur} onChange={handleChange} value={value} options={optionList || options || []} />
    </InputWrapper>
  );
};

export const validateSingleSelect = (value: string, config: FieldConfigIF): string => {
  if (config.mandatory && !value) return 'This field is required.';

  return '';
};
