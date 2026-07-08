import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

// Lazy load pages
const ListReconcilationPage = lazy(() => import('../../modules/reconcilation/index'));
const ListReconcillationNewPage = lazy(() => import('../../modules/reconcilation/list-reconcillation/index'));

const ReconcilationRoutes = () => {
    return (
        <Routes>
            <Route path="list" element={<ListReconcilationPage />} />
            <Route path="recent" element={<ListReconcillationNewPage />} />
        </Routes>
    );
};

export default ReconcilationRoutes;
