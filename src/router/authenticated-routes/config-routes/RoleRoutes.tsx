import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '../../not-found-routes/GlobalNotFoundPage';
import FullScreenLoader from '../../../components/FullScreenLoader';

const ListRolePage = lazy(() => import('../../../modules/config/role/ListRolePage'));
const CreateRolePage = lazy(() => import('../../../modules/config/role/CreateRolePage'));

const RoleRoutes = () => {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route path="/list" element={<ListRolePage />} />
        <Route path="/create" element={<CreateRolePage />} />
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default RoleRoutes;
