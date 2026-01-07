import { useEffect, useState } from 'react';
import { Explorer } from './Explorer';
import { MonacoEditor } from './Editor';

export type FileNode = {
    name: string;
    path: string;
    type: 'file' | 'folder';
    children?: FileNode[];
};

const API = 'http://localhost:4000';

function CodeEditor() {
    const [tree, setTree] = useState<FileNode[]>([]);
    const [content, setContent] = useState('');
    const [activeFile, setActiveFile] = useState('');

    useEffect(() => {
        fetch(`${API}/tree`)
            .then(res => res.json())
            .then(setTree);
    }, []);

    const openFile = async (path: string) => {
        setActiveFile(path);
        const res = await fetch(`${API}/file?path=${encodeURIComponent(path)}`);
        const data = await res.json();
        setContent(data.content);
    };

    return (
        <div className="h-screen flex bg-[#1e1e1e] text-[#cccccc] font-mono">
            <Explorer tree={tree} onFileClick={openFile} activeFile={activeFile} />
            <MonacoEditor content={content} file={activeFile} />
        </div>
    );
}

export default CodeEditor;
