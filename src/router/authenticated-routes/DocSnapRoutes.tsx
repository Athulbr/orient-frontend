import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import FullScreenLoader from '../../components/FullScreenLoader';
import ListProjectPage from '../../modules/docsnap/project';
import ListDocumentPage from '../../modules/docsnap/document';
import ViewRecordPage from '../../modules/docsnap/record/view-record';
import ListRecordPage from '../../modules/docsnap/record/list-record';
import ListTemplatePage from '../../modules/docsnap/template/list-template';
import UpdateTemplatePage from '../../modules/docsnap/template/update-template';

const DocSnapRoutes = () => {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route path="/project/list" element={<ListProjectPage />} />
        <Route path="/template/list" element={<ListTemplatePage />} />
        <Route path="/template/update/:id" element={<UpdateTemplatePage />} />
        <Route path="/document/list/:id" element={<ListDocumentPage />} />
        <Route path="/record/list" element={<ListRecordPage />} />
        <Route path="/record/view/:id" element={<ViewRecordPage />} />
      </Routes>
    </Suspense>
  );
};

export default DocSnapRoutes;
