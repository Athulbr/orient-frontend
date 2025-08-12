import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '../not-found-routes/GlobalNotFoundPage';
import FullScreenLoader from '../../components/FullScreenLoader';

const PromateRoutes = lazy(() => import('./PromateRoutes'));
const ConfigRoutes = lazy(() => import('./config-routes'));
const DashboardPage = lazy(() => import('../../modules/dashboard'));
const DocSnapRoutes = lazy(() => import('./DocSnapRoutes'));
const UserRoutes = lazy(() => import('./UserRoutes'));

const AuthenticatedRoutes = () => {
    return (
        <Suspense fallback={<FullScreenLoader />}>
            <Routes>
                <Route path="docsnap/*" element={<DocSnapRoutes />} />
                <Route path="promate/*" element={<PromateRoutes />} />
                <Route path="user/*" element={<UserRoutes />} />
                <Route path="config/*" element={<ConfigRoutes />} />
                <Route path="/" element={<DashboardPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
};

export default AuthenticatedRoutes;
