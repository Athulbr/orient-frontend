export interface FileItem {
    name: string;
    url: string;
    type: 'pdf' | 'image' | 'doc' | 'other';
    source: 'order' | 'email' | 'upload';
    pages?: string[];
}

export interface Email {
    emailId: string;
    subject: string;
    from: string;
    date: string;
    bodyInnerText?: string;
    body?: string;
    attachments: FileItem[];
    orderNumber?: number;
}

export interface OrderDetails {
    orderId: number;
    orderNumber: number;
    orderType: 'buy' | 'sell';
    productType: 'currency' | 'card' | 'tt';
    location?: string;
    locationId?: number;
    branch: string;
    branchId: number;
    totalAmount: number;
    actualAmount: number;
    orderStatus: 'pending' | 'extracted' | 'submitted' | 'failed';
    documentSubmitStatus: string;
    paymentType?: string;
    deliveryMode?: string;
    deliveryCharge?: number;
    handlingCharges?: number;
    purpose?: string;
    documentUploadTime?: string;
}

export interface UserDetails {
    userId: number;
    name: string;
    email: string;
    phone: string;
    panNumber?: string;
}

export interface CurrencyDetail {
    serialNumber?: number;
    currency: string;
    product: string;
    quantity: number;
    rate: number;
    amount: number;
}

export interface DocumentDetail {
    documentName: string;
    // documentUrl: string;  // -- old
    documentPages: string[]; // -- new
}

export interface Order {
    orderDetails: OrderDetails;
    userDetails: UserDetails;
    currencyDetails: CurrencyDetail[];
    webDocuments: DocumentDetail[];
    manualDocuments?: DocumentDetail[];
    emailDocuments?: DocumentDetail[];
    linkedEmailIds?: string[];
    extractionDetails: {
        recordId?: string;
        extractedData?: Record<string, unknown>;
    };
}
