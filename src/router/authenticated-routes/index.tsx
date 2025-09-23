import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '../not-found-routes/GlobalNotFoundPage';
import FullScreenLoader from '../../components/FullScreenLoader';

const PromateRoutes = lazy(() => import('./PromateRoutes'));
const ConfigRoutes = lazy(() => import('./config-routes'));
const DashboardPage = lazy(() => import('../../modules/dashboard'));
const TranscriptionListPage = lazy(() => import('../../modules/transcript/list-record/index'));
const TranscriptionCreatePage = lazy(() => import('../../modules/transcript/create'));
const DocSnapRoutes = lazy(() => import('./DocSnapRoutes'));
const UserRoutes = lazy(() => import('./UserRoutes'));

const AuthenticatedRoutes = () => {
    const permissions = sessionStorage.getItem('permissions');
    const docsnapModule = JSON.parse(permissions || '[]')?.some((permission: any) => permission.key === 'docsnap:module');
    const dataEntryModule = JSON.parse(permissions || '[]')?.some((permission: any) => permission.key === 'dataentry:module');
    const transcriptModule = JSON.parse(permissions || '[]')?.some((permission: any) => permission.key === 'transcript:module');

    const module = docsnapModule ? 'docsnap' : dataEntryModule ? 'dataentry' : transcriptModule ? 'transcript' : 'docsnap';
    const paths = {
        docsnap: '/docsnap',
        dataentry: '/dataentry',
        transcript: '/audio-transcript/list'
    };
    return (
        <Suspense fallback={<FullScreenLoader />}>
            <Routes>
                <Route path="docsnap/*" element={<DocSnapRoutes />} />
                <Route path="promate/*" element={<PromateRoutes />} />
                <Route path="user/*" element={<UserRoutes />} />
                <Route path="config/*" element={<ConfigRoutes />} />
                <Route path="/audio-transcript/list" element={<TranscriptionListPage />} />
                <Route path="/audio-transcript/create" element={<TranscriptionCreatePage />} />
                <Route path="/audio-transcript/view/:id" element={<TranscriptionCreatePage />} />
                <Route path="/docsnap" element={<DashboardPage module="docsnap" />} />
                <Route path="/dataentry" element={<DashboardPage module="dataentry" />} />
                <Route path="/" element={<Navigate to={paths[module]} replace />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
};

export default AuthenticatedRoutes;
