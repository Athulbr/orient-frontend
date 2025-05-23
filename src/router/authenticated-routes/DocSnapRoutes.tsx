import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '../not-found-routes/GlobalNotFoundPage';
import FullScreenLoader from '../../components/FullScreenLoader';
import ListRecordPage from '../../modules/docsnap/record/list-record/ListRecordPage';
import ListProjectPage from '../../modules/docsnap/project';
import ListDocumentPage from '../../modules/docsnap/document';
import ViewRecordPage from '../../modules/docsnap/record/view-record';

const DocSnapRoutes = () => {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route path="/project/list" element={<ListProjectPage />} />
        <Route path="/document/list/:id" element={<ListDocumentPage />} />
        <Route path="/record/list" element={<ListRecordPage />} />
        <Route path="/record/view/:id" element={<ViewRecordPage />} />
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default DocSnapRoutes;
