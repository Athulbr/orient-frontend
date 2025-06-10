import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '../not-found-routes/GlobalNotFoundPage';
import FullScreenLoader from '../../components/FullScreenLoader';
import DocSnapRoutes from './DocSnapRoutes';
import UserRoutes from './UserRoutes';
import PromateRoutes from './PromateRoutes';
import ConfigRoutes from './config-routes';

const AuthenticatedRoutes = () => {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route path="/docsnap/*" element={<DocSnapRoutes />} />
        <Route path="/promate/*" element={<PromateRoutes />} />
        <Route path="/config/*" element={<ConfigRoutes />} />
        <Route path="/*" element={<DocSnapRoutes />} />
      </Routes>
    </Suspense>
  );
};

export default AuthenticatedRoutes;
