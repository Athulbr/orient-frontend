import React from 'react';
import style from './section.module.css';
import { FieldConfigIF, InputFieldRenderPropsIF } from '../../interface';

export const SectionHeaderRender: React.FC<InputFieldRenderPropsIF> = ({ index, fields }) => {
    return <div className={style.container}>{fields[index].label}</div>;
};

export const validateSectionHeader = (value: number, config: FieldConfigIF): string => {
    return '';
};
