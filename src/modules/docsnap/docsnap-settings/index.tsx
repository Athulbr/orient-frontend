import { useEffect, useState } from 'react';
import { UseFormbuilder } from '../../../builders/formbuilder/use-formbuilder';
import httpRequest from '../../../global-utils/httpRequest';
import { useSettingsStore } from '../../../zustand-store/SettingsStore';
import { useAlertStore } from '../../../components/alert/AlertStore';
import { useToastStore } from '../../../components/toast/ToastStore';

interface DocsnapSettingsPageIF {
    test?: string;
}

const DocsnapSettingsPage: React.FC<DocsnapSettingsPageIF> = () => {
    const { submitDocsnapSettings, docsnapSettings, getDocsnapSettings, docsnapSettingResponse } = useSettingsStore();
    const [loading, setLoading] = useState(false);
    const { showAlert, closeAlert } = useAlertStore();
    const toast = useToastStore();
    const onSubmit = async (data: any) => {
        showAlert({
            alertText: 'Are you sure you want to save this configuration?',
            primaryButtonText: 'Save',
            onPrimaryAction: async () => {
                setLoading(true);
                await submitDocsnapSettings(data);
                setLoading(false);
                toast.success(docsnapSettingResponse);
                closeAlert();
            }
        });
    };
    useEffect(() => {
        getDocsnapSettings();
    }, []);
    return (
        <div className="h-full w-full">
            <p className="text-xl">Docsnap Settings</p>
            <UseFormbuilder
                renderFormClassName=""
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
