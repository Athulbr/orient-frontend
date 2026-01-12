import { useEffect, useState } from 'react';
import PreviewContainer from './preview-container';
import RightContainer from './right-container';
import { ResizableContainer } from '../docsnap/template/update-template/components/ResizableContainer';
import { ContentCreationEditorStateProvider } from './hooks/DocumentCreationEditorContext';
import httpRequest from '../../global-utils/httpRequest';
import { config } from '../../config/default';
import { useParams } from 'react-router-dom';

interface ContentCreationIF {
    test?: string;
}

export interface Message {
    text: string;
    source?: string[];
    userMessage: boolean;
}

export interface ContentCreationEditorStateIF {}

const initialState: ContentCreationEditorStateIF = {};

const ContentCreationEditor: React.FC<ContentCreationIF> = () => {
    const [state, setState] = useState<ContentCreationEditorStateIF>(initialState);
    const { id } = useParams();
    const [content, setContent] = useState('');

    useEffect(() => {
        if (!id) return;
        const getRecord = async () => {
            const res = await httpRequest('POST', `https://devapi.makez.ai/api/idp/history/696489eba6797347f140da6a`);
            console.log('res.data:===========', res.data);
            setContent(res.data?.content);
        };
        getRecord();
    }, [id]);

    return (
        <ContentCreationEditorStateProvider value={{ state, setState }}>
            <div className="flex flex-1 overflow-y-auto absolute left-0 top-0 h-full w-full bg-white">
                <ResizableContainer
                    className="flex flex-1 overflow-y-auto"
                    left={<PreviewContainer />}
                    right={<RightContainer />}
                    initialLeftWidthPercent={60}
                    minLeftWidthPercent={30}
                    maxLeftWidthPercent={75}
                />
            </div>
        </ContentCreationEditorStateProvider>
    );
};

export default ContentCreationEditor;
