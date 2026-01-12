import { Button } from '../../../components/Button';
import { TextAreaComponent } from '../../../components/Textarea';
import { useState } from 'react';
import httpRequest from '../../../global-utils/httpRequest';
import { config } from '../../../config/default';
import Spinner from '../../../components/Spinner';

export default function RightContainer({ htmlContent, setContent }: { htmlContent: string; setContent: (content: string) => void }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const sendPrompt = async () => {
        setLoading(true);
        const res = await httpRequest('POST', `${config.mlServiceNodejs}/content-creation/edit-blog`, {
            userQuery: input,
            htmlContent: htmlContent
        });
        setContent(res.data?.htmlContent);
        setInput('');
        setLoading(false);
    };
    return (
        <div className=" flex flex-col overflow-y-auto flex-1 h-full p-4 pt-0 gap-2">
            <div className="p-2">
                <p className="text-xl font-semibold">Content Details</p>
            </div>
            <TextAreaComponent rows={10} value={input} onChange={e => setInput(e.target.value)} />
            <Button startIcon={loading ? <Spinner size={16} /> : null} disabled={input.trim() === '' || loading} onClick={sendPrompt}>
                {loading ? 'Updating...' : 'Send'}
            </Button>
        </div>
    );
}
