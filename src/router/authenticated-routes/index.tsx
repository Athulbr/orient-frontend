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
          ? 'dataentry'
          : transcriptModule
            ? 'transcript'
            : sldModule
              ? 'sld'
              : documentCreationModule
                ? 'documentCreation'
                : ppeDetectionModule
                  ? 'ppeDetection'
                  : invoiceTracking
                    ? 'invoiceTracking'
                    : contentCreation
                      ? 'contentCreation'
                      : 'docsnap';
    sessionStorage.setItem('module', module);
    const paths = {
        docsnap: '/docsnap',
        dataentry: '/dataentry',
        transcript: '/transcript',
        sld: '/sld',
        documentCreation: '/document-creation',
        ppeDetection: '/ppe-detection',
        invoiceTracking: '/invoice-tracking',
        contentCreation: 'content-creation'
    };
    return (
        <Suspense fallback={<FullScreenLoader />}>
            <Routes>
                <Route path="docsnap/*" element={<DocSnapRoutes />} />
                <Route path="dataentry/*" element={<DocSnapRoutes />} />
                <Route path="sld/*" element={<DocSnapRoutes />} />
                <Route path="invoice-tracking/*" element={<DocSnapRoutes />} />
                <Route path="content-creation/*" element={<DocSnapRoutes />} />
                <Route path="promate/*" element={<PromateRoutes />} />
                <Route path="user/*" element={<UserRoutes />} />
                <Route path="config/*" element={<ConfigRoutes />} />
                <Route path="/transcript/record/*" element={<MedicalCodeRoutes />} />
                <Route path="/docsnap" element={<DashboardPage module="docsnap" />} />
                <Route path="/invoice-tracking" element={<DashboardPage module="invoiceTracking" />} />
                <Route path="/transcript" element={<DashboardPage module="transcript" />} />
                <Route path="/dataentry" element={<DashboardPage module="dataentry" />} />
                <Route path="/sld" element={<DashboardPage module="sld" />} />
                <Route path="/document-creation" element={<DashboardPage module="documentCreation" />} />
                <Route path="/document-creation/create/:id" element={<DocumentCreationEditor />} />
                <Route path="/ppe-detection" element={<DashboardPage module="ppeDetection" />} />
                <Route path="/content-creation/view-content/:id" element={<ContentCreationEditor />} />
                <Route path="/content-creation" element={<DashboardPage module="contentCreation" />} />
                <Route path="/" element={<Navigate to={paths[module]} replace />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
};

export default AuthenticatedRoutes;
