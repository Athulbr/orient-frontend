import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface FormField {
    name: string;
    dataType: 'str' | 'int' | 'float' | 'bool';
    jsonKey: string;
    regenerateFieldValueWithAI: boolean;
    required: boolean;
    excludeExtraction: boolean;
    isHidden: boolean;
    _id: string;
}

interface FormErrors {
    [key: string]: string;
}

const DynamicForm: React.FC<{ formConfig: FormField[]; onChange: (data: any) => void }> = ({ formConfig, onChange }) => {
    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        onChange(formData);
    }, [formData]);

    const validateField = (field: FormField, value: any): string => {
        if (field.required && (!value || value === '')) {
            return `${field.name} is required`;
        }

        if (value && value !== '') {
            if (field.dataType === 'int') {
                const numValue = Number(value);
                if (isNaN(numValue) || !Number.isInteger(numValue)) {
                    return 'Please enter a valid integer';
                }
            } else if (field.dataType === 'float') {
                const numValue = Number(value);
                if (isNaN(numValue)) {
                    return 'Please enter a valid number';
                }
            }
        }

        return '';
    };

    const handleChange = (field: FormField, value: any) => {
        setFormData(prev => ({ ...prev, [field.jsonKey]: value }));

        if (touched[field.jsonKey]) {
            const error = validateField(field, value);
            setErrors(prev => ({
                ...prev,
                [field.jsonKey]: error
            }));
        }
    };

    const handleBlur = (field: FormField) => {
        setTouched(prev => ({ ...prev, [field.jsonKey]: true }));
        const error = validateField(field, formData[field.jsonKey]);
        setErrors(prev => ({ ...prev, [field.jsonKey]: error }));
    };

    const handleSubmit = () => {
        const newErrors: FormErrors = {};
        formConfig.forEach(field => {
            if (!field.isHidden) {
                const error = validateField(field, formData[field.jsonKey]);
                if (error) newErrors[field.jsonKey] = error;
            }
        });

        setErrors(newErrors);
        setTouched(formConfig.reduce((acc, field) => ({ ...acc, [field.jsonKey]: true }), {}));

        if (Object.keys(newErrors).length === 0) {
            console.log('Form submitted:', formData);
            alert('Form submitted successfully! Check console for data.');
        }
    };

    const renderField = (field: FormField) => {
        if (field.isHidden) return null;

        const value = formData[field.jsonKey] || '';
        const error = errors[field.jsonKey];
        const isTouched = touched[field.jsonKey];

        switch (field.dataType) {
            case 'bool':
                return (
                    <div key={field._id} className="mb-5">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={value || false}
                                onChange={e => handleChange(field, e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-gray-700">
                                {field.name}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </span>
                        </label>
                    </div>
                );

            case 'int':
            case 'float':
                return (
                    <div key={field._id} className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {field.name}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                            type="number"
                            step={field.dataType === 'float' ? 'any' : '1'}
                            value={value}
                            onChange={e => handleChange(field, e.target.value)}
                            onBlur={() => handleBlur(field)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                isTouched && error ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                            // placeholder={`Enter ${field.name.toLowerCase()}`}
                        />
                        {isTouched && error && (
                            <div className="flex items-center mt-1.5 text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                );

            default:
                return (
                    <div key={field._id} className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {field.name}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                            type="text"
                            value={value}
                            onChange={e => handleChange(field, e.target.value)}
                            onBlur={() => handleBlur(field)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                isTouched && error ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                            // placeholder={`Enter ${field.name.toLowerCase()}`}
                        />
                        {isTouched && error && (
                            <div className="flex items-center mt-1.5 text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="w-full p-4 flex flex-col overflow-y-auto relative">
            <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-2xl font-semibold text-gray-900">Document Fields</h2>
                    <p className="text-gray-600 text-sm mt-1">Please fill in the required information</p>
                </div>

                <div className="p-6">
                    {formConfig.map(field => renderField(field))}

                    <div className=" sticky bottom-0 left-0 flex gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="flex-1 bg-blue-600 text-white font-medium py-2.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            Submit Form
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setFormData({});
                                setErrors({});
                                setTouched({});
                            }}
                            className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicForm;
