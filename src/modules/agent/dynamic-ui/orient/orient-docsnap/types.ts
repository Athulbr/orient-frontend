export interface FileItem {
    name: string;
    url: string;
    type: 'pdf' | 'image' | 'doc' | 'other';
    source: 'order' | 'email' | 'upload';
}

export interface Email {
    id: string;
    subject: string;
    from: string;
    date: string;
    orderId?: string;
    body?: string;
    attachments: FileItem[];
}

export interface Order {
    order_id: string;
    customer_name: string;
    order_type: string;
    status: string;
    branch_id: string;
    branch_name: string;
    created_at: string;
    updated_at: string;
    documents: string[];
    linkedEmailIds?: string[];
}

export interface TemplateRequirement {
    name: string;
    fulfilled: boolean;
}
