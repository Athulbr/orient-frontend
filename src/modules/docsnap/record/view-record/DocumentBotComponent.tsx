import { useEffect } from 'react';
import { Button } from '../../../../components/Button';
import { useSettingsStore } from '../../../../zustand-store/SettingsStore';
import { ChatContainer } from './components/ChatContainer';
import { ChatInput } from './components/ChatInput';
import ChatMessage from './components/ChatMessage';
import DotLoader from './components/dot-loader';
import { useViewRecordApi } from './hooks/useViewRecordApi';
import { useViewRecordState } from './hooks/viewRecordContext';
import { useNavigate } from 'react-router-dom';

interface DocumentBotComponentIF {
    test?: string;
}

const DocumentBotComponent: React.FC<DocumentBotComponentIF> = () => {
    const { state, setState } = useViewRecordState();
    const { sendMessage, sendMessageToNode } = useViewRecordApi();
    const navigate = useNavigate();
    const { getUserSettings, userSettings } = useSettingsStore();

    useEffect(() => {
        if (userSettings?.extractionEngine) return;
        getUserSettings();
    }, []);
    const sendMessageHandler = async (message: string) => {
        if (userSettings?.extractionEngine === 'node') {
            sendMessageToNode(message);
        } else {
            sendMessage(message);
        }
    };
    const messages = state.messages;
    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <ChatContainer>
                {state.messages.map((message, index) => (
                    <ChatMessage key={index} message={message.text} userMessage={message.userMessage} source={message.source} />
                ))}
                {messages[messages.length - 1]?.userMessage && state.chatLoading && <DotLoader />}
            </ChatContainer>
            <ChatInput sendMessage={sendMessageHandler} />
            <div className="flex items-center justify-end gap-2 border-t bg-white p-2">
                <Button onClick={() => navigate('/docsnap/record/list')} outlined small>
                    Cancel
                </Button>
            </div>
        </div>
    );
};

export default DocumentBotComponent;
