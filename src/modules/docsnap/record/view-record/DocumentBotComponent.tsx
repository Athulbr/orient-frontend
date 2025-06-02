import { ChatContainer } from './components/ChatContainer';
import { ChatInput } from './components/ChatInput';

interface DocumentBotComponentIF {
  test?: string;
}

const DocumentBotComponent: React.FC<DocumentBotComponentIF> = () => {
  const sendMessage = async (message: string) => {};
  return (
    <div className="flex h-full flex-1 flex-col">
      <ChatContainer>
        <div className="flex flex-1 flex-col">test</div>
        {/* {messages.map((message, index) => (
          <ChatMessage key={index} message={message.text} userMessage={message.userMessage} source={message.source} />
        ))}
        {messages[messages.length - 1]?.userMessage && isLoading && <DotLoader />} */}
      </ChatContainer>
      <ChatInput sendMessage={sendMessage} />
    </div>
  );
};

export default DocumentBotComponent;
