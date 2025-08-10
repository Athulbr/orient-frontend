import { useEffect, useState } from 'react';
import { UseFormbuilder } from '../../../builders/formbuilder/use-formbuilder';
import httpRequest from '../../../global-utils/httpRequest';
import { useSettingsStore } from '../../../zustand-store/SettingsStore';

interface UserPreferencePageIF {
    test?: string;
}

const UserPreferencePage: React.FC<UserPreferencePageIF> = () => {
    const { submitUserSettings, userSettings, getUserSettings } = useSettingsStore();
    const [loading, setLoading] = useState(false);
    const onSubmit = async (data: any) => {
        setLoading(true);
        await submitUserSettings(data);
        setLoading(false);
    };
    useEffect(() => {
        getUserSettings();
    }, []);
    return (
        <div className="h-full w-full">
            <p className="text-xl">User Preference</p>
            <UseFormbuilder
                renderFormClassName="bg-red-200"
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
