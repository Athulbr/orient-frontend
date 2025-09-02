import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../../../zustand-store/SettingsStore';
import { UseFormbuilder } from '../../../../builders/formbuilder/use-formbuilder';
import { useAlertStore } from '../../../../components/alert/AlertStore';

interface TenantSettingsPageIF {
    test?: string;
}

const TenantSettingsPage: React.FC<TenantSettingsPageIF> = () => {
    const { submitTenantSettings, tenantSettings, getTenantSettings } = useSettingsStore();
    const { showAlert, closeAlert } = useAlertStore();
    const [loading, setLoading] = useState(false);
    const onSubmit = async (data: any) => {
        showAlert({
            alertText: 'Are you sure you want to save this configuration?',
            primaryButtonText: 'Save',
            onPrimaryAction: async () => {
                setLoading(true);
                await submitTenantSettings(data);
                setLoading(false);
                closeAlert();
            }
        });
    };
    useEffect(() => {
        getTenantSettings();
    }, []);
    return (
        <div className="h-full w-full">
            <p className="text-xl">Tenant Settings</p>
            <UseFormbuilder
                renderFormClassName="bg-red-200"
                showInDialog={false}
                title="Tenant Settings"
                name="Tenant Settings Form"
                isOpen={true}
                closeDialog={() => {}}
                onSubmit={onSubmit}
                existingData={tenantSettings}
                loadingPrimaryButton={loading}
            />
        </div>
    );
};

export default TenantSettingsPage;
