import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

// Lazy load pages
const ListAgentPage = lazy(() => import('../../modules/agent/list-agent'));
const RunAgentPage = lazy(() => import('../../modules/agent/run-agent'));
const ViewAgentPage = lazy(() => import('../../modules/agent/view-agent'));
const ListAgentTemplatePage = lazy(() => import('../../modules/agent/agent-template/list-agent-template'));
const ViewAgentTemplatePage = lazy(() => import('../../modules/agent/agent-template/view-agent-template'));
const ScannedDocuments = lazy(() => import('../../modules/agent/dynamic-ui/orient/orient-docsnap/ScannedDocuments'));

const AgentRoutes = () => {
    return (
        <Routes>
            <Route path="list" element={<ListAgentPage />} />
            <Route path="run/:name" element={<RunAgentPage />} />
            <Route path="/:id" element={<ViewAgentPage />} />
            <Route path="template/list" element={<ListAgentTemplatePage />} />
            <Route path="template/create" element={<ViewAgentTemplatePage isCreate={true} />} />
            <Route path="template/:id" element={<ViewAgentTemplatePage />} />
            <Route path="scanned-documents" element={<ScannedDocuments />} />
        </Routes>
    );
};

export default AgentRoutes;
