import React from 'react';
import { useDocumentCreationEditorState } from '../hooks/DocumentCreationEditorContext';
interface DataMap {
    [key: string]: string;
}

export const HighlightedText: React.FC<{ template: string; data: DataMap }> = ({ template, data }) => {
    const { state } = useDocumentCreationEditorState();
    console.log('template:===========', template);
    console.log('data:===========', data);
    // Split the text into literal and placeholder parts
    if (!template) return null;
    const parts = template.split(/({{.*?}})/g);

    return (
        <div>
            {parts.map((part, index) => {
                const match = part.match(/{{(.*?)}}/);
                if (match) {
                    const key = match[1].trim();
                    const value = data[key];
                    const isFilled = !!value;

                    return (
                        <span
                            key={index}
                            style={{
                                // backgroundColor: isFilled ? '#d1f7c4' : '#ffcccc',
                                border: key === state.activeId ? '2px solid #3b82f6' : '2px solid white',
                                padding: '2px 4px',
                                borderRadius: '3px'
                            }}
                            id={key}
                        >
                            {isFilled ? value : `_______________`}
                        </span>
                    );
                }

                // normal text part
                return <React.Fragment key={index}>{part}</React.Fragment>;
            })}
        </div>
    );
};
