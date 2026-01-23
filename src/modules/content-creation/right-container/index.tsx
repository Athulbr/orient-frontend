import { Button } from '../../../components/Button';
import { TextAreaComponent } from '../../../components/Textarea';
import { useState } from 'react';
import httpRequest from '../../../global-utils/httpRequest';
import { config } from '../../../config/default';
import Spinner from '../../../components/Spinner';
import { useContentCreationEditorState } from '../hooks/DocumentCreationEditorContext';
import { Pencil, Trash2, Check, X } from 'lucide-react';

export default function RightContainer({ htmlContent, setContent, name }: { htmlContent: string; setContent: (content: string) => void; name: string }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const { state, setState } = useContentCreationEditorState();
    const [editingKeywordIndex, setEditingKeywordIndex] = useState<number | null>(null);
    const [editedKeywordValue, setEditedKeywordValue] = useState('');
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

    const downloadHTML = () => {
        const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Generated content">
    <title>Document</title>
</head>
<body>
${htmlContent}
</body>
</html>`;

        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `content-${Date.now()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleEditKeyword = (index: number) => {
        setEditingKeywordIndex(index);
        setEditedKeywordValue(state.keywords?.[index]?.keyword || '');
    };

    const handleSaveKeyword = (index: number) => {
        if (!state.keywords) return;
        const updatedKeywords = [...state.keywords];
        updatedKeywords[index] = { ...updatedKeywords[index], keyword: editedKeywordValue };
        setState({ ...state, keywords: updatedKeywords });
        setEditingKeywordIndex(null);
        setEditedKeywordValue('');
    };

    const handleCancelEdit = () => {
        setEditingKeywordIndex(null);
        setEditedKeywordValue('');
    };

    const handleDeleteKeyword = (index: number) => {
        if (!state.keywords) return;
        const updatedKeywords = state.keywords.filter((_, i) => i !== index);
        setState({ ...state, keywords: updatedKeywords });
    };

    return (
        <div className=" flex flex-col overflow-y-auto flex-1 h-full p-4 pt-0 gap-2">
            <div className="p-2">
                <p className="text-xl font-semibold">Content Details</p>
            </div>
            <div className="border-t pt-4">
                <p className="text-lg font-semibold mb-3">Name</p>

                {name}
            </div>
            {state.keywords && state.keywords.length > 0 && (
                <div className="mt-4 border-t pt-4">
                    <p className="text-lg font-semibold mb-3">SEO friendly Keywords ( DataForSEO )</p>
                    <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                        {state.keywords.map((keyword, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
                                {editingKeywordIndex === index ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editedKeywordValue}
                                            onChange={e => setEditedKeywordValue(e.target.value)}
                                            className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => handleSaveKeyword(index)}
                                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors cursor-pointer"
                                            title="Save"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                                            title="Cancel"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-1">
                                            <p className="text-sm">{keyword.keyword}</p>
                                            <p className="text-xs text-gray-500">Source: {keyword.source}</p>
                                        </div>
                                        <button
                                            onClick={() => handleEditKeyword(index)}
                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                            title="Edit"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteKeyword(index)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <TextAreaComponent rows={10} value={input} onChange={e => setInput(e.target.value)} />
            <Button startIcon={loading ? <Spinner size={16} /> : null} disabled={input.trim() === '' || loading} onClick={sendPrompt}>
                {loading ? 'Updating...' : 'Send'}
            </Button>
            <Button disabled={!htmlContent} onClick={downloadHTML}>
                Download HTML
            </Button>
        </div>
    );
}
