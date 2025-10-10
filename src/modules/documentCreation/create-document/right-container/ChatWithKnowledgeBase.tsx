interface ChatWithKnowledgeBaseIF {
    test?: string;
}

const ChatWithKnowledgeBase: React.FC<ChatWithKnowledgeBaseIF> = () => {
    return (
        <div className="w-full flex flex-col overflow-y-auto ">
            <div className="p-2 pb-0 flex flex-col overflow-y-auto flex-1">ChatWithKnowledgeBase</div>
        </div>
    );
};

export default ChatWithKnowledgeBase;
