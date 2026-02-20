export interface Message {
    text: string;
    source?: string[];
    userMessage: boolean;
}

export interface Keyword {
    keyword: string;
    source: string;
    selected?: boolean;
}

export interface ExtractedDataIF {
    name?: string;
    author?: string;
    primaryImageUrl?: string;
    rowData?: Record<string, any>;
    [key: string]: any;
}

export interface ContentCreationEditorStateIF {
    keywords?: Keyword[];
    extractedData?: ExtractedDataIF;
    content?: string;
    record?: Record<string, any> | null;
    extractionPrompt?: string; 
}
