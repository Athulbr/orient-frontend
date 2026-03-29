export interface FileItem {
    name: string;
    url: string;
    type: 'pdf' | 'image' | 'doc' | 'other';
    source: 'order' | 'email' | 'upload';
}

export interface Email {
    emailId: string;
    subject: string;
    from: string;
    date: string;
    orderId?: string | number;
    bodyInnerText?: string;
    body?: string;
    attachments: FileItem[];
}

export interface OrderDetails {
    order_id: number;
    order_no: string;
    type: string;
    location?: string;
    loc_id?: number;
    branch: string;
    branch_id: number;
    total_amount: number;
    actual_amount: number;
    order_status: string;
    doc_submit_status: string;
    payment_type?: string;
    delivery_mode?: string;
    delivery_charge?: number;
    handling_charges?: number;
    purpose?: string;
    doc_upload_time?: string;
}

export interface UserDetails {
    user_id: number;
    name: string;
    email: string;
    phone: string;
    pan_number?: string;
}

export interface CurrencyDetail {
    sr_no?: number;
    currency: string;
    product: string;
    quantity: number;
    rate: number;
    amount: number;
}

export interface DocumentDetail {
    documentName: string;
    documentUrl: string;
}

export interface Order {
    order_details: OrderDetails;
    user_details: UserDetails;
    currency_details: CurrencyDetail[];
    document_details: DocumentDetail[];
    linkedEmailIds?: string[];
    extractionDetails: Record<string, unknown>;
}
