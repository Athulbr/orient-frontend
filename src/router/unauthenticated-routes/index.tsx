import { Navigate, Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import FullScreenLoader from '../../components/FullScreenLoader';
import GraphComponent from '../../temp/GraphComponent';

// Lazy load the whole auth module
const AuthRoutes = lazy(() => import('./AuthRoutes'));

const UnauthenticatedRoutes = () => {
    return (
        <Suspense fallback={<FullScreenLoader />}>
            <Routes>
                <Route path="/auth/*" element={<AuthRoutes />} />
                <Route path="/chart-page" element={<GraphComponent />} />
                {/* Redirect everything else to auth/login */}
                <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
        </Suspense>
    );
};

export default UnauthenticatedRoutes;
