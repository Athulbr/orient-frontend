import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

// Lazy load pages
const ListReconcilationPage = lazy(() => import('../../modules/reconcilation/index'));

const ReconcilationRoutes = () => {
    return (
        <Routes>
            <Route path="list" element={<ListReconcilationPage />} />
        </Routes>
    );
};

export default ReconcilationRoutes;
