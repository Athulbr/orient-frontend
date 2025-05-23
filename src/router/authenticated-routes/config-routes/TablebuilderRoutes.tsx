import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '../../not-found-routes/GlobalNotFoundPage';
import FullScreenLoader from '../../../components/FullScreenLoader';

const ListTablebuilderPage = lazy(() => import('../../../modules/config/tablebuilder/ListTablebuilderPage'));
const CreateTablebuilderPage = lazy(() => import('../../../modules/config/tablebuilder/CreateTablebuilderPage'));

const TablebuilderRoutes = () => {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route path="/list" element={<ListTablebuilderPage />} />
        <Route path="/create" element={<CreateTablebuilderPage />} />
        <Route path="/update/:id" element={<CreateTablebuilderPage update />} />
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default TablebuilderRoutes;
