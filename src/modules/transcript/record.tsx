import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useTranscriptGroupStore from '../../zustand-store/transcriptGroupStore';

interface PropsIF {
    update?: boolean;
}

const CreateRecord: React.FC<PropsIF> = ({ update }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { createTranscript, updateTranscript, loading, gettranscript, transcript } = useTranscriptGroupStore();

    useEffect(() => {
        if (!id) return;
        gettranscript(id);
    }, [id]);

    const onSubmit = async (values: any) => {
        let res;
        if (update && id) {
            res = await updateTranscript(values, id);
        } else {
            res = await createTranscript(values);
        }
        if (res) {
            navigate(-1);
        }
    };

    return (
        <RenderFormbuilderForm
            formName="Transcription"
            formHeader={`${update ? 'Update' : 'Create'} Record`}
            existingForm={update ? transcript : null}
            goBack={() => navigate(-1)}
            onSubmit={onSubmit}
            dynamicOptions={[]}
            small
            loading={loading}
        />
    );
};

export default CreateRecord;
