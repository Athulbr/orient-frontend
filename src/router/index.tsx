import React from 'react';
import AuthenticatedRoutes from './authenticated-routes';
import UnauthenticatedRoutes from './unauthenticated-routes';
import AuthenticatedLayout from '../modules/layout/AuthenticatedLayout';

const IndexRouter: React.FC = () => {
    const accessToken = window?.sessionStorage?.getItem('accessToken') || '';

    return accessToken ? (
        <AuthenticatedLayout>
            <AuthenticatedRoutes />
        </AuthenticatedLayout>
    ) : (
        <UnauthenticatedRoutes />
    );
};

export default IndexRouter;
