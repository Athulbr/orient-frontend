import { useState } from 'react';
import { Button } from '../../../components/Button';
import { Pencil, SkipForward, Plus, Check, X, Sparkles, Palette } from 'lucide-react';
import { useContentCreationEditorState } from '../hooks/DocumentCreationEditorContext';
import EditableField from '../components/EditableField';
import SummaryImageField from '../components/SummaryImageField';
import KeywordsSection from '../components/KeywordsSection';
import EditPromptDialog from '../components/EditPromptDialog';
import GenerateTitlesDialog from '../components/GenerateTitlesDialog';
import StyleEditor from '../components/StyleEditor';
import { useBlogTheme } from '../hooks/useBlogTheme';
import { useContentCreationApi } from '../hooks/useContentCreationApi';
import type { Keyword } from '../types';
import Spinner from '../../../components/Spinner';
import AudioPlayButton from '../components/AudioPlayButton';
import httpRequest from '../../../global-utils/httpRequest';
import { useNavigate, useParams } from 'react-router-dom';
import { useToastStore } from '../../../components/toast/ToastStore';
import { config } from '../../../config/default';
import Tooltip from '../../../components/Tooltip';
import ImagesTab from '../components/ImagesTab';

type RightTab = 'content' | 'styles' | 'images';

export default function RightContainer() {
    const { state, setState } = useContentCreationEditorState();
    const { regenerateBlog, updateRecordApi, htmlToAudio } = useContentCreationApi();
    const [promptDialogOpen, setPromptDialogOpen] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerateTitlesOpen, setIsGenerateTitlesOpen] = useState(false);
    const [originalCustomTitle, setOriginalCustomTitle] = useState('');
    const [activeTab, setActiveTab] = useState<RightTab>('content');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const toast = useToastStore();
    const { id } = useParams();

    // Always mounted — keeps the injected <style> tag alive across tab switches
    const { merged: mergedTheme, overrides: themeOverrides, updateStyle, resetTheme } = useBlogTheme(
        id,
        state.record?.theme,
        state.record?.themeOverrides
    );

    const handleGenerateMoreTitles = async (data: any) => {
        setIsGenerateTitlesOpen(false);
        try {
            toast.info(`Generating ${data.count} titles in a ${data.tone} tone...`);
            setState(prev => ({ ...prev, loadingData: true }));
            
            const payload = {
                content: {
                    name: state.extractedData?.title || state.record?.name || 'Original Product Title',
                    description: state.record?.extractedData?.description || state.extractedData?.blogSummary || state.content || ''
                },
                count: data.count,
                tone: data.tone,
                instructions: data.instructions,
                previousTitles: state.extractedData?.rowData?.titleList || []
            };

            const res: any = await httpRequest('POST', `${config.mlServiceNodejs}/content-creation/generate-titles`, payload);
            
            if (res?.data) {
                const newTitles = Array.isArray(res.data) ? res.data : (res.data.titles || res.data.data || []);
                if (newTitles && Array.isArray(newTitles) && newTitles.length > 0) {
                   setState(prev => {
                       const extractedData = { ...(prev.extractedData || {}) } as any;
                       const rowData = { ...(extractedData.rowData || {}) };
                       const titleList = [...(rowData.titleList || [])];
                       
                       newTitles.forEach((t: string) => {
                           if (!titleList.includes(t)) titleList.push(t);
                       });
                       
                       rowData.titleList = titleList;
                       extractedData.rowData = rowData;
                       return { ...prev, extractedData };
                   });
                   toast.success('Successfully generated new titles!');
                } else {
                   toast.info('No new titles were generated.');
                }
            }
        } catch (e: any) {
             console.error('Error generating titles:', e);
             toast.error(e?.response?.data?.message || e?.message || 'Failed to generate titles');
        } finally {
             setState(prev => ({ ...prev, loadingData: false }));
        }
    };

    const navigate = useNavigate();

    const handleFieldSave = (field: string, value: string) => {
        setState(prev => {
            const extractedData = { ...(prev.extractedData || {}) } as any;
            extractedData[field] = value;
            
            let newContent = prev.content;
            if (field === 'title' && newContent) {
                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(newContent, 'text/html');
                    const h1Tags = doc.getElementsByTagName('h1');
                    if (h1Tags.length > 0) {
                        h1Tags[0].innerText = value;
                        newContent = doc.body.innerHTML;
                    }
                } catch (e) {
                    console.error('Failed to update title in content', e);
                }
            }
            
            return {
                ...prev,
                extractedData,
                content: newContent
            };
        });
    };

    const handleToggleKeyword = (index: number) => {
        if (!state.keywords) return;
        const updatedKeywords = [...state.keywords];
        updatedKeywords[index] = {
            ...updatedKeywords[index],
            selected: updatedKeywords[index].selected === false
        };
        setState(prev => ({ ...prev, keywords: updatedKeywords }));
    };

    const handleAddKeyword = (keyword: Keyword) => {
        setState(prev => ({ ...prev, keywords: [...(prev.keywords || []), keyword] }));
    };

    const handleSelectAll = (selected: boolean) => {
        if (!state.keywords) return;
        const updatedKeywords = state.keywords.map(k => ({ ...k, selected }));
        setState(prev => ({ ...prev, keywords: updatedKeywords }));
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
${state.content}
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

    const generateAudio = async () => {
        setState(prev => ({ ...prev, loadingData: true }));
        try {
            const fullHTML = `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"description\" content=\"Generated content\">\n    <title>Document</title>\n</head>\n<body>\n${state.content}\n</body>\n</html>`;

            const url = await htmlToAudio(fullHTML);
            if (url) setAudioUrl(url);
        } catch (err) {
            console.error(err);
            toast.error('Audio generation failed');
        } finally {
            setState(prev => ({ ...prev, loadingData: false }));
        }
    };

    // const downloadAudio = async () => {
    //     setState(prev => ({ ...prev, loadingData: true }));
    //     try {
    //         const fullHTML = `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"description\" content=\"Generated content\">\n    <title>Document</title>\n</head>\n<body>\n${state.content}\n</body>\n</html>`;

    //         const audioBlob = await htmlToAudio(fullHTML as string);
    //         if (audioBlob) {
    //             if (audioBlob.type && !audioBlob.type.startsWith('audio/')) {
    //                 const errorText = await audioBlob.text();
    //                 console.error('Unexpected audio response:', audioBlob.type, errorText);
    //                 toast.error('Audio response is not a supported audio file');
    //                 return;
    //             }

    //             const normalizedBlob = audioBlob.type ? audioBlob : audioBlob.slice(0, audioBlob.size, 'audio/mpeg');
    //             const url = URL.createObjectURL(normalizedBlob);

    //             // Automatically trigger download
    //             const link = document.createElement('a');
    //             link.href = url;
    //             link.download = `audio-${Date.now()}.mp3`;
    //             document.body.appendChild(link);
    //             link.click();
    //             document.body.removeChild(link);

    //             setAudioUrl(prev => {
    //                 if (prev) URL.revokeObjectURL(prev);
    //                 return url;
    //             });

    //         }
    //     } catch (err) {
    //         console.error(err);
    //         toast.error('Audio generation failed');
    //     } finally {
    //         setState(prev => ({ ...prev, loadingData: false }));
    //     }
    // };

    

    const handleOnSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                title: state.extractedData?.title,
                extractedData: {
                    ...state.extractedData,
                    htmlContent: state.content
                }
            };
            await updateRecordApi(payload);
        } finally {
            setIsSaving(false);
        }
    };

    const handleOnSubmit = async () => {
        const fullHTML = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="description" content="Generated content">
            <title>Document</title>
        </head>
        <body>
        ${state.content}
        </body>
        </html>`;

        const selectedTenantName = window?.sessionStorage?.getItem('selectedTenantName') || '';
        const selectedModule = window?.sessionStorage?.getItem('module') || '';
        const userData = JSON.parse(window?.sessionStorage?.getItem('user') || '{}');
        const tenantName = userData?.tenant?.name || ''; 

        const imageList: { url: string }[] = state.extractedData?.rowData?.imageList || [];
        const content = {
            title: state.extractedData?.title || '',
            category: '',
            summaryHTML: '',
            summaryImagePath: state.extractedData?.primaryImageUrl || '',
            product_category: '',
            html: fullHTML,
            supportImages: imageList.map(img => img.url).filter(Boolean),
            ...(audioUrl && { audioUrl }),
        };
        const payload = {
            tenant_name: selectedTenantName === '' ? tenantName : selectedTenantName,
            module: selectedModule,
            blog: content,
            extractedData: {
                ...state.extractedData,
                htmlContent: state.content
            },
            recordId: id
        };
        try {
            setIsSubmitting(true);
            const res: any = await httpRequest('POST', `${config.nodeApiUrl}/idp/history/rehab/create`, payload);
            toast.success('Record submitted successfully');
            if (selectedModule === 'content-creation') navigate('/content-creation/record/list');
        } catch (error: any) {
            console.error('Error submitting content:', error);
            toast.error(error?.message || 'Failed to submit blog content');
        } finally {
            setIsSubmitting(false);
        }
    };

    const reGenerateContent = async () => {
        if (!state.content) return;
        setIsRegenerating(true);
        try {
            const filteredKeywords = state.keywords?.filter((keyword: any) => keyword.selected);
            const res = await regenerateBlog({
                keywords: filteredKeywords,
                extractedData: state.extractedData,
                extractionPrompt: state.extractionPrompt
            });
            if (res.data?.htmlContent) {
                setState(prev => ({ ...prev, content: res.data.htmlContent }));
                console.log('Regenerated content:', res.data.htmlContent);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsRegenerating(false);
        }
    };

    const skipToNextDocumentHandler = () => {
        const recordIdList = window?.sessionStorage?.getItem('recordIdList') as string;
        if (!recordIdList) return;
        const recordIdListArray = JSON.parse(recordIdList);
        const index = recordIdListArray.indexOf(id);
        if (index === -1) return;
        setState(prev => ({ ...prev, loadingData: true, content: '', extractedData: undefined }));
        navigate(`/content-creation/view/${recordIdListArray[index + 1]}`);
    };

    return (
        <div className="flex flex-col h-full min-h-0 gap-2 overflow-y-auto px-4">
            <div className="sticky top-0 z-10 border-b bg-white">
                <div className="flex items-center justify-between p-2">
                    <p className="text-xl font-semibold">
                        {activeTab === 'content' ? 'Content Details' : activeTab === 'images' ? 'Images' : 'Style Editor'}
                    </p>
                </div>
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'content'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Content Details
                    </button>
                    <button
                        onClick={() => setActiveTab('images')}
                        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'images'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Images
                    </button>
                    {/* <button
                        onClick={() => setActiveTab('styles')}
                        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'styles'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Palette size={14} />
                        Styles
                    </button> */}
                </div>
            </div>

            {activeTab === 'styles' && (
                <StyleEditor
                    merged={mergedTheme}
                    overrides={themeOverrides}
                    updateStyle={updateStyle}
                    resetTheme={resetTheme}
                />
            )}

            {activeTab === 'images' && <ImagesTab />}

            {activeTab === 'content' && <div className="flex flex-col gap-3 border-b pb-4 mb-2">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Title</label>
                    <textarea
                        className="w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none mb-4"
                        value={state.extractedData?.title || ''}
                        onChange={e => handleFieldSave('title', e.target.value)}
                        placeholder="Enter title"
                        rows={3}
                    />

                    <div className="flex flex-col mb-2 border-t pt-4">
                        <label className="text-[17px] font-bold text-gray-800">Choose a generated title</label>
                        <p className="text-[13px] text-gray-500">{state.extractedData?.rowData?.titleList?.length || 0} AI-generated titles. Select one or generate more.</p>
                    </div>

                    <div className="flex flex-col gap-2 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-2">
                            {state.extractedData?.rowData?.titleList?.map((t: string, idx: number) => {
                            const isSelected = state.extractedData?.title === t;
                            return (
                                <div 
                                    key={idx} 
                                    className={`flex items-start gap-4 p-3.5 border rounded-md cursor-pointer transition-all bg-white ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}
                                    onClick={() => {
                                        if (isSelected) {
                                            handleFieldSave('title', originalCustomTitle);
                                        } else {
                                            if (!state.extractedData?.rowData?.titleList?.includes(state.extractedData?.title)) {
                                                setOriginalCustomTitle(state.extractedData?.title || '');
                                            }
                                            handleFieldSave('title', t);
                                        }
                                    }}
                                >
                                    <div className="pt-0.5 pointer-events-none">
                                        <input 
                                            type="radio" 
                                            name="titleSelection" 
                                            checked={isSelected}
                                            readOnly
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex flex-col flex-1 pointer-events-none">
                                        <span className={`text-[15px] leading-snug ${isSelected ? 'text-blue-700 font-semibold' : 'text-gray-800 font-medium'}`}>
                                            {t}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {(!state.extractedData?.rowData?.titleList || state.extractedData.rowData.titleList.length === 0) && (
                            <p className="text-sm text-gray-500 italic py-2">No AI-generated titles available.</p>
                        )}
                        </div>

                        <div className="mt-2 flex flex-col gap-2 pt-2">
                            <button
                                onClick={() => setIsGenerateTitlesOpen(true)}
                                className="flex items-center gap-2 w-fit px-3 py-2 text-sm font-semibold text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                                <Sparkles size={16} className="text-blue-500" /> Generate more titles
                            </button>
                        </div>
                    </div>
                </div>
                {/* <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Author</label>
                    <input
                        className="w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={state.extractedData?.author || ''}
                        onChange={e => handleFieldSave('author', e.target.value)}
                        placeholder="Enter Author"
                    />
                </div> */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Primary Image URL</label>
                    <input
                        className="w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={state.extractedData?.primaryImageUrl || ''}
                        onChange={e => handleFieldSave('primaryImageUrl', e.target.value)}
                        placeholder="Enter Image URL"
                    />
                    {state.extractedData?.primaryImageUrl && (
                        <img
                            src={state.extractedData.primaryImageUrl}
                            alt="Primary Image Preview"
                            className="max-h-1w0 w-full object-contain rounded-md mt-2"
                        />
                    )}
                </div>
            </div>}

            {activeTab === 'content' && state.keywords && state.keywords.length > 0 && (
                <KeywordsSection keywords={state.keywords} onToggle={handleToggleKeyword} onAdd={handleAddKeyword} onSelectAll={handleSelectAll} />
            )}

            <div className="sticky bottom-0 z-10 mt-auto flex justify-between gap-2 border-t bg-white px-2 py-4">
                <div className="flex flex-col gap-2">
                    <AudioPlayButton audioUrl={audioUrl} isLoading={Boolean(state.loadingData)} onGenerate={generateAudio} isGenerateDisabled={!state.content} />
                </div>
                <div className="flex gap-2">
                    {/* <Tooltip text="Skip to Next Document">
                        <Button data-tour-id="skip-next-document-button" disabled={isRegenerating || isSaving} onClick={skipToNextDocumentHandler} startIcon={<SkipForward size={16} />}>
                            Next
                        </Button>
                    </Tooltip> */}
                    <Button permission='blog:regenerate' disabled={!state.content || isRegenerating} onClick={reGenerateContent} startIcon={isRegenerating ? <Spinner size={16} /> : null}>
                        {isRegenerating ? 'Blog Regenerating...' : 'Blog Regenerate'}
                    </Button>
                    {/* <Button disabled={!state.content} onClick={downloadHTML}>
                        Download HTML
                    </Button> */}
                    <Button disabled={!state.content || isSaving} onClick={handleOnSave} startIcon={isSaving ? <Spinner size={16} /> : null}>
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button disabled={!state.content || isSubmitting} onClick={handleOnSubmit} startIcon={isSubmitting ? <Spinner size={16} /> : null}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                </div>
            </div>

            <EditPromptDialog isOpen={promptDialogOpen} onClose={() => setPromptDialogOpen(false)} record={state.record || null} />
            <GenerateTitlesDialog isOpen={isGenerateTitlesOpen} onClose={() => setIsGenerateTitlesOpen(false)} onGenerate={handleGenerateMoreTitles} />
        </div>
    );
}
