import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

// Lazy load pages
const ListAgentPage = lazy(() => import('../../modules/agent/list-agent'));
const RunAgentPage = lazy(() => import('../../modules/agent/run-agent'));

const AgentRoutes = () => {
    return (
        <Routes>
            <Route path="list" element={<ListAgentPage />} />
            <Route path="run/:id" element={<RunAgentPage />} />
        </Routes>
    );
};

export default AgentRoutes;
