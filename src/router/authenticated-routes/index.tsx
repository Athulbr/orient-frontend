import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '../not-found-routes/GlobalNotFoundPage';
import FullScreenLoader from '../../components/FullScreenLoader';
import DocumentCreationEditor from '../../modules/documentCreation/create-document';
import ContentCreationEditor from '../../modules/content-creation';

const PromateRoutes = lazy(() => import('./PromateRoutes'));
const ConfigRoutes = lazy(() => import('./config-routes'));
const DashboardPage = lazy(() => import('../../modules/dashboard'));
const DocSnapRoutes = lazy(() => import('./DocSnapRoutes'));
const UserRoutes = lazy(() => import('./UserRoutes'));
const MedicalCodeRoutes = lazy(() => import('./medicalCodeRoutes'));

const AuthenticatedRoutes = () => {
    const permissions = sessionStorage.getItem('permissions');
    const docsnapModule = JSON.parse(permissions || '[]')?.some((permission: any) => permission.key === 'docsnap:module');
    const dataEntryModule = JSON.parse(permissions || '[]')?.some((permission: any) => permission.key === 'dataentry:module');
    const transcriptModule = JSON.parse(permissions || '[]')?.some((permission: any) => permission.key === 'transcript:module');
    const sldModule = JSON.parse(permissions || '[]')?.some((permission: any) => permission.key === 'sld:module');
    const documentCreationModule = JSON.parse(permissions || '[]')?.some((permission: any) => permission.key === 'documentCreation:module');
    const ppeDetectionModule = JSON.parse(permissions || '[]')?.some((permission: any) => permission.key === 'ppeDetection:module');
    const invoiceTracking = JSON.parse(permissions || '[]')?.some((permission: any) => permission.key === 'invoiceTracking:module');
    const contentCreation = JSON.parse(permissions || '[]')?.some((permission: any) => permission.key === 'contentCreation:module');

    const module = docsnapModule
        ? 'docsnap'
        : dataEntryModule
          ? 'data-entry'
          : transcriptModule
            ? 'transcription'
            : sldModule
              ? 'sld'
              : documentCreationModule
                ? 'document-creation'
                : ppeDetectionModule
                  ? 'ppe-detection'
                  : invoiceTracking
                    ? 'invoice-tracking'
                    : contentCreation
                      ? 'content-creation'
                      : 'docsnap';
    sessionStorage.setItem('module', module);
    const paths = {
        docsnap: '/docsnap',
        'data-entry': '/data-entry',
        transcription: '/transcription',
        sld: '/sld',
        'document-creation': '/document-creation',
        'ppe-detection': '/ppe-detection',
        'invoice-tracking': '/invoice-tracking',
        'content-creation': 'content-creation'
    };
    return (
        <Suspense fallback={<FullScreenLoader />}>
            <Routes>
                <Route path="docsnap/*" element={<DocSnapRoutes />} />
                <Route path="data-entry/*" element={<DocSnapRoutes />} />
                <Route path="sld/*" element={<DocSnapRoutes />} />
                <Route path="invoice-tracking/*" element={<DocSnapRoutes />} />
                <Route path="content-creation/*" element={<DocSnapRoutes />} />
                <Route path="promate/*" element={<PromateRoutes />} />
                <Route path="user/*" element={<UserRoutes />} />
                <Route path="config/*" element={<ConfigRoutes />} />
                <Route path="/transcription/record/*" element={<MedicalCodeRoutes />} />
                <Route path="/docsnap" element={<DashboardPage />} />
                <Route path="/invoice-tracking" element={<DashboardPage />} />
                <Route path="/transcription" element={<DashboardPage />} />
                <Route path="/data-entry" element={<DashboardPage />} />
                <Route path="/sld" element={<DashboardPage />} />
                <Route path="/document-creation" element={<DashboardPage />} />
                <Route path="/document-creation/create/:id" element={<DocumentCreationEditor />} />
                <Route path="/ppe-detection" element={<DashboardPage />} />
                <Route path="/content-creation/view-content/:id" element={<ContentCreationEditor />} />
                <Route path="/content-creation" element={<DashboardPage />} />
                <Route path="/" element={<Navigate to={paths[module]} replace />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
};

export default AuthenticatedRoutes;
