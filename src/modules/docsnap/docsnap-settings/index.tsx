import { useEffect, useState } from 'react';
import { UseFormbuilder } from '../../../builders/formbuilder/use-formbuilder';
import httpRequest from '../../../global-utils/httpRequest';
import { useSettingsStore } from '../../../zustand-store/SettingsStore';

interface DocsnapSettingsPageIF {
    test?: string;
}

const DocsnapSettingsPage: React.FC<DocsnapSettingsPageIF> = () => {
    const { submitDocsnapSettings, docsnapSettings, getDocsnapSettings } = useSettingsStore();
    const [loading, setLoading] = useState(false);
    const onSubmit = async (data: any) => {
        setLoading(true);
        await submitDocsnapSettings(data);
        setLoading(false);
    };
    useEffect(() => {
        getDocsnapSettings();
    }, []);
    return (
        <div className="h-full w-full">
            <p className="text-xl">Docsnap Settings</p>
            <UseFormbuilder
                renderFormClassName="bg-red-200"
                showInDialog={false}
                title="Docsnap Settings"
                name="Docsnap Settings Form"
                isOpen={true}
                closeDialog={() => {}}
                onSubmit={onSubmit}
                existingData={docsnapSettings}
                loadingPrimaryButton={loading}
            />
        </div>
    );
};

export default DocsnapSettingsPage;
