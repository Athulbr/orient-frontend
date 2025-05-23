import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '../../not-found-routes/GlobalNotFoundPage';
import FullScreenLoader from '../../../components/FullScreenLoader';

const ListPermissionPage = lazy(() => import('../../../modules/config/permission/ListPermissionPage'));
const CreatePermissionPage = lazy(() => import('../../../modules/config/permission/CreatePermissionPage'));

const PermissionRoutes = () => {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route path="/list" element={<ListPermissionPage />} />
        <Route path="/create" element={<CreatePermissionPage />} />
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default PermissionRoutes;
