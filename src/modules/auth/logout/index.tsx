import { FC } from 'react';

const LogoutMessagePage: FC = () => {
    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50 text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-800">Your session has expired.</h1>
            <p className="text-[17px] text-gray-600">Please close this tab and login again to the Orient Web Application.</p>
        </div>
    );
};

export default LogoutMessagePage;
