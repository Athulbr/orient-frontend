import Editor from '@monaco-editor/react';

const getLanguage = (file: string) => {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) return 'typescript';
    if (file.endsWith('.js') || file.endsWith('.jsx')) return 'javascript';
    if (file.endsWith('.json')) return 'json';
    if (file.endsWith('.css')) return 'css';
    if (file.endsWith('.html')) return 'html';
    return 'plaintext';
};

export const MonacoEditor = ({ content, file }: { content: string; file: string }) => {
    return (
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
            <div className="h-9 bg-[#2d2d2d] border-b border-[#333] px-4 flex items-center text-sm text-[#cccccc]">{file || 'No file selected'}</div>

            <Editor
                height="100%"
                language={getLanguage(file)}
                value={content}
                theme="vs-dark"
                options={{
                    readOnly: true,
                    fontSize: 16,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true,
                    cursorStyle: 'line',
                    renderLineHighlight: 'line'
                }}
            />
        </div>
    );
};
