import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import httpRequest from '../../global-utils/httpRequest';
import DynamicForm from './DynamicForm';
import nunjucks from 'nunjucks';
import FullScreenLoader from '../../components/FullScreenLoader';

interface DocumentCreationIF {
    test?: string;
}

const DocumentCreationEditor: React.FC<DocumentCreationIF> = () => {
    const { id } = useParams();
    const [template, setTemplate] = useState<any>(null);
    const [formFields, setFormFields] = useState<any>([]);
    const [documentText, setDocumentText] = useState<any>('');
    const [loading, setLoading] = useState<boolean>(false);

    console.log('template:===========', template);

    useEffect(() => {
        const getTemplateByIdApi = async () => {
            setLoading(true);
            const res: any = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/idp/template/${id}`);
            setTemplate(res.data);
            const fields = res.data?.fields.find((field: any) => field.jsonKey === 'document_fields');
            setFormFields(fields?.subFields || []);
            const values: any = {};
            fields?.subFields?.map((field: any) => {
                values[field.jsonKey] = '_______________';
            });
            const finalDocumentText = nunjucks.renderString(res.data?.description, values);
            setDocumentText(finalDocumentText);
            setLoading(false);
        };
        getTemplateByIdApi();
    }, [id]);

    const handleFormDataChange = (data: any) => {
        if (!template) return;
        const values: any = {};
        const fields = template?.fields.find((field: any) => field.jsonKey === 'document_fields');

        fields?.subFields?.map((field: any) => {
            values[field.jsonKey] = data[field.jsonKey] || '___________';
        });
        const finalDocumentText = nunjucks.renderString(template?.description, values);
        setDocumentText(finalDocumentText);
    };

    if (loading) {
        return <FullScreenLoader />;
    }

    return (
        <div className="w-full flex overflow-y-auto">
            <div className="w-[50%] h-[calc(100vh-56px)] overflow-y-auto">
                <DynamicForm formConfig={formFields} onChange={handleFormDataChange} />
            </div>
            <div className="w-[50%]  overflow-y-auto">
                {documentText && (
                    <div className="w-full p-6  flex flex-col gap-4 leading-8 justify-center overflow-y-auto">
                        {documentText.split('\n').map((item: string, index: number) => (
                            <div key={index}>{item}</div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentCreationEditor;
