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
        const getRecord = async () => {
            const res = await httpRequest('POST', `${config.nodeApiUrl}/idp/history/${id}`);
            setContent(res.data?.content);
        };
        getRecord();
    }, []);

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
