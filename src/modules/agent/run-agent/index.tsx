import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import getDynamicUserInterface from '../dynamic-ui';
import httpRequest from '../../../global-utils/httpRequest';

const RunAgentPage: React.FC = () => {
    const { id } = useParams();
    const [workflow, setWorkflow] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkflow = async () => {
            try {
                const address = 'devapi.makez.ai/agents';
                // const address = 'localhost';
                const data = await httpRequest('GET', `https://${address}/api/workflows/${id}`);
                setWorkflow(data.data);
            } catch (error) {
                console.error('Error fetching workflow:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchWorkflow();
        } else {
            setLoading(false);
        }
    }, [id]);

    // console.log('workflow:===========', workflow);

    const DynamicUI = getDynamicUserInterface(workflow?.agentSettings?.inputUiId);

    if (loading) {
        return <div>Loading workflow...</div>;
    }

    if (!DynamicUI) {
        return <div>Dynamic UI not found</div>;
    }

    // We can pass the workflow data to the dynamic UI component if needed
    return <DynamicUI />;
};

export default RunAgentPage;
