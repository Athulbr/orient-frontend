import { useEffect, useState } from 'react';
import { UseFormbuilder } from '../../../builders/formbuilder/use-formbuilder';
import { useSettingsStore } from '../../../zustand-store/SettingsStore';
import { useAlertStore } from '../../../components/alert/AlertStore';
import { useToastStore } from '../../../components/toast/ToastStore';

interface UserPreferencePageIF {
    test?: string;
}

const UserPreferencePage: React.FC<UserPreferencePageIF> = () => {
    const { submitUserSettings, userSettings, userSettingResponse, getUserSettings } = useSettingsStore();
    const [loading, setLoading] = useState(false);
    const { showAlert, closeAlert } = useAlertStore();
    const toast = useToastStore();
    const onSubmit = async (data: any) => {
        showAlert({
            alertText: 'Are you sure you want to save this configuration?',
            primaryButtonText: 'Save',
            onPrimaryAction: async () => {
                setLoading(true);
                await submitUserSettings(data);
                setLoading(false);
                toast.success(userSettingResponse);
                closeAlert();
            }
        });
    };
    useEffect(() => {
        getUserSettings();
    }, []);
    return (
        <div className="h-full w-full">
            <p className="text-xl">User Preference</p>
            <UseFormbuilder
                renderFormClassName=""
                showInDialog={false}
                title="User Preference"
                name="User Preference Form"
                isOpen={true}
                closeDialog={() => {}}
                onSubmit={onSubmit}
                existingData={userSettings}
                loadingPrimaryButton={loading}
            />
        </div>
    );
};

export default UserPreferencePage;
