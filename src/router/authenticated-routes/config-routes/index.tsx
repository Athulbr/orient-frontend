import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import TablebuilderRoutes from './TablebuilderRoutes';
import RoleRoutes from './RoleRoutes';
import FullScreenLoader from '../../../components/FullScreenLoader';
import UpdatedFieldsListPage from '../../../modules/docsnap/prompt-tuning';
import { NotFoundPage } from '../../not-found-routes/GlobalNotFoundPage';
import FormbuilderRoutes from './FormbuilderRoutes';
import PermissionRoutes from './PermissionRoutes';
import UserRoutes from '../UserRoutes';

const AppConfigMenuPage = lazy(() => import('../../../modules/config/AppConfigMenuPage'));

const ConfigRoutes = () => {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route path="/role/*" element={<RoleRoutes />} />
        <Route path="/permission/*" element={<PermissionRoutes />} />
        <Route path="/tablebuilder/*" element={<TablebuilderRoutes />} />
        <Route path="/formbuilder/*" element={<FormbuilderRoutes />} />
        <Route path="/prompt-tuning" element={<UpdatedFieldsListPage />} />
        <Route path="/user/*" element={<UserRoutes />} />
        <Route path="/" element={<AppConfigMenuPage />} />
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default ConfigRoutes;
