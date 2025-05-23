import React, { useState } from 'react';
import { FieldConfigIF, InputFieldRenderPropsIF } from '../../interface';
import { InputWrapper } from '../input-wrapper';
import CustomSelect from './SelectInput';

export const SingleSelectRender: React.FC<InputFieldRenderPropsIF> = ({ index, fields, setFields, inputWrapperClassName }) => {
  const field = fields[index];
  const { config, value, errorMessage } = field;
  const [focus, setFocus] = useState(false);

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

  const options = config.optionSourceType === 'static' ? config.options : dynamicOptions;

  return (
    <InputWrapper className={inputWrapperClassName} focus={focus} field={field} error={errorMessage || ''}>
      <CustomSelect onBlur={handleBlur} onChange={handleChange} value={value} options={options || []} />
    </InputWrapper>
  );
};

export const validateSingleSelect = (value: string, config: FieldConfigIF): string => {
  if (config.mandatory && !value) return 'This field is required.';

  return '';
};

const dynamicOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' },
  { value: 'grape', label: 'Grape' },
  { value: 'mango', label: 'Mango' },
  { value: 'pineapple', label: 'Pineapple' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'blueberry', label: 'Blueberry' },
  { value: 'raspberry', label: 'Raspberry' },
  { value: 'blackberry', label: 'Blackberry' },
  { value: 'kiwi', label: 'Kiwi' },
  { value: 'peach', label: 'Peach' },
  { value: 'plum', label: 'Plum' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'lemon', label: 'Lemon' },
  { value: 'lime', label: 'Lime' },
  { value: 'coconut', label: 'Coconut' },
  { value: 'papaya', label: 'Papaya' },
  { value: 'guava', label: 'Guava' },
  { value: 'dragonfruit', label: 'Dragon Fruit' },
];
