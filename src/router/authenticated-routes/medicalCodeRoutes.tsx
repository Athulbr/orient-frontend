import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '../not-found-routes/GlobalNotFoundPage';

const CreatePromatePage = lazy(() => import('../../modules/transcript/audioRecorder'));
// const CreatePromatePage = lazy(() => import('../../modules/promate/CreatePromatePage'));

const MedicalCodeRoutes = () => {
    return (
        <Routes>
            {/* <Route path="create" element={<CreatePromatePage />} /> */}
            {/* <Route path="/transcripts/list" element={<TranscriptListPage />} />
            <Route path="/transcripts/create/:id" element={<TranscriptProjectPage />} />
            <Route path="/transcripts/view/:id" element={<TranscriptProjectPage update />} />
            <Route path="/transcripts/record" element={<CreateRecord />} />
            <Route path="/transcripts/record/:id" element={<CreateRecord update />} />
            <Route path="/transcripts/list/:id" element={<ListRecords />} /> */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default MedicalCodeRoutes;
