import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '../not-found-routes/GlobalNotFoundPage';
import FullScreenLoader from '../../components/FullScreenLoader';
import PromateRoutes from './PromateRoutes';
import ConfigRoutes from './config-routes';
import DashboardPage from '../../modules/dashboard';
import DocSnapRoutes from './DocSnapRoutes';

const AuthenticatedRoutes = () => {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route path="/docsnap/*" element={<DocSnapRoutes />} />
        <Route path="/promate/*" element={<PromateRoutes />} />
        <Route path="/config/*" element={<ConfigRoutes />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AuthenticatedRoutes;
