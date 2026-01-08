import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '../not-found-routes/GlobalNotFoundPage';

// const ListPromatePage = lazy(() => import('../../modules/promate/ListPromatePage'));
// const CreatePromatePage = lazy(() => import('../../modules/promate/CreatePromatePage'));

const PromateRoutes = () => {
    return (
        <Routes>
            {/* <Route path="list" element={<ListPromatePage />} />
            <Route path="create" element={<CreatePromatePage />} /> */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default PromateRoutes;
