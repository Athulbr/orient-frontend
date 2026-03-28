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
    orderId?: string | number;
    body?: string;
    attachments: FileItem[];
}

export interface UserDetails {
    user_name: string;
    user_email: string;
    user_phone: string;
    pan_number?: string;
}

export interface CurrencyDetail {
    currency: string;
    product: string;
    quantity: string | number;
    amount: string | number;
}

export interface DocumentDetail {
    documentName: string;
    documentUrl: string;
}

export interface OrderDetails {
    order_id: number;
    order_no: string;
    type: string;
    order_status: string;
    loc_id: string;
    branch_id: string;
    branch: string;
    payment_type?: string;
    delivery_mode?: string;
    delivery_charge?: string;
    handling_charges?: string;
    total_amount: string | number;
    actual_amount?: string | number;
    user_details: UserDetails;
    doc_Submit_Status: string;
    purpose?: string;
    doc_upload_time?: string;
    document_count?: number;
    document_details: DocumentDetail[];
    currency_details: CurrencyDetail[];
}

export interface Order {
    order_details: OrderDetails;
    linkedEmailIds?: string[];
    extractionDetails?: Record<string, unknown>;
}

export interface TemplateRequirement {
    name: string;
    fulfilled: boolean;
}
