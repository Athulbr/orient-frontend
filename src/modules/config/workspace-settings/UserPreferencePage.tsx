import { useEffect, useState } from 'react';
import { UseFormbuilder } from '../../../builders/formbuilder/use-formbuilder';
import httpRequest from '../../../global-utils/httpRequest';

interface UserPreferencePageIF {
    test?: string;
}

const UserPreferencePage: React.FC<UserPreferencePageIF> = () => {
    const [settings, setSettings] = useState<any>(null);
    const onSubmit = async (data: any) => {
        try {
            const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/user/settings/submit`, {
                settings: data
            });
        } catch (error) {}
    };
    useEffect(() => {
        const getSettings = async () => {
            const res: any = await httpRequest('GET', `${import.meta.env.VITE_NODE_URL}/api/user/settings/list`);
            setSettings(res.data.settings);
        };
        getSettings();
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
                existingData={settings}
            />
        </div>
    );
};

export default UserPreferencePage;
