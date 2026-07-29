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
            <Route path="dashboard" element={
                <iframe
                    src="/exchange_dashboard.html"
                    style={{ width: '100%', height: '100vh', border: 'none' }}
                    title="Exchange Dashboard"
                />
            } />
        </Routes>
    );
};

export default ReconcilationRoutes;
