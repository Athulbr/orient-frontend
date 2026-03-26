import { Order, Email, TemplateRequirement, FileItem } from './types';

export const sampleOrders: Order[] = [
    {
        order_id: 'ORD-2024-008825',
        customer_name: 'Priya Sharma',
        order_type: 'TRANSFER',
        status: 'PENDING',
        branch_id: 'BR-PUN-004',
        branch_name: 'Pune - Koregaon Park',
        created_at: '2024-03-20T14:20:00+05:30',
        updated_at: '2024-03-20T14:20:00+05:30',
        documents: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf']
    },
    {
        order_id: 'ORD-2024-008826',
        customer_name: 'Aditya Sharma',
        order_type: 'TRANSFER',
        status: 'PENDING',
        branch_id: 'BR-PUN-004',
        branch_name: 'Pune - Koregaon Park',
        created_at: '2024-03-20T14:20:00+05:30',
        updated_at: '2024-03-20T14:20:00+05:30',
        documents: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf']
    },
    {
        order_id: 'ORD-2024-008827',
        customer_name: 'Ganesh Sharma',
        order_type: 'TRANSFER',
        status: 'PENDING',
        branch_id: 'BR-PUN-004',
        branch_name: 'Pune - Koregaon Park',
        created_at: '2024-03-20T14:20:00+05:30',
        updated_at: '2024-03-20T14:20:00+05:30',
        documents: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf']
    }
];

export const sampleEmails: Email[] = [
    {
        id: 'EMAIL-001',
        subject: 'Order Documents - ORD-2024-008821',
        from: 'rahul.mehta@example.com',
        date: '2024-03-18T10:30:00+05:30',
        orderId: 'ORD-2024-008821',
        body: 'Please find attached the PAN Card and Address Proof for order ORD-2024-008821. Kindly process it as soon as possible.',
        attachments: [
            { name: 'PAN_Card.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', source: 'email' },
            { name: 'Address_Proof.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', source: 'email' }
        ]
    },
    {
        id: 'EMAIL-002',
        subject: 'KYC Documents Attached - Anita Desai',
        from: 'anita.desai@example.com',
        date: '2024-03-19T11:15:00+05:30',
        orderId: 'ORD-2024-008822',
        body: 'Attaching the required KYC documents including my passport scan, bank statement, and photo ID for your review.',
        attachments: [
            { name: 'Passport_Scan.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', source: 'email' },
            { name: 'Bank_Statement.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', source: 'email' },
            { name: 'Photo_ID.jpg', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'image', source: 'email' }
        ]
    }
];

export const availableEmails: Email[] = [
    {
        id: 'EMAIL-101',
        subject: 'RE: Pending KYC Documents',
        from: 'support@orientexchange.com',
        date: '2024-03-20T08:00:00+05:30',
        body: 'Please find attached the filled KYC form and Aadhaar copy as requested for my account verification. Let me know if you need any other details.',
        attachments: [
            { name: 'KYC_Form_Filled.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', source: 'email' },
            { name: 'Aadhaar_Copy.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', source: 'email' }
        ]
    },
    {
        id: 'EMAIL-102',
        subject: 'Document Submission - Urgent',
        from: 'vikram.singh@example.com',
        date: '2024-03-20T09:45:00+05:30',
        body: 'Attaching my income proof. Please process my transfer authorization at the earliest.',
        attachments: [{ name: 'Income_Proof.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', source: 'email' }]
    },
    {
        id: 'EMAIL-103',
        subject: 'FWD: Transfer Authorization Documents',
        from: 'priya.sharma@example.com',
        date: '2024-03-20T12:30:00+05:30',
        body: 'Forwarding the NOC letter and signature verification image for the upcoming transfer. Required documents are attached.',
        attachments: [
            { name: 'Transfer_Auth.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', source: 'email' },
            { name: 'NOC_Letter.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', source: 'email' },
            {
                name: 'Signature_Verification.jpg',
                url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                type: 'image',
                source: 'email'
            }
        ]
    }
];

export const templateRequirements: TemplateRequirement[] = [
    { name: 'PAN Card', fulfilled: false },
    { name: 'Address Proof', fulfilled: false },
    { name: 'Passport / ID Proof', fulfilled: false },
    { name: 'Bank Statement', fulfilled: false },
    { name: 'Signed Application Form', fulfilled: false }
];

export const getFileNameFromUrl = (url: string): string => {
    const parts = url.split('/');
    return parts[parts.length - 1] || 'document';
};

export const getFileType = (url: string): FileItem['type'] => {
    const lower = url.toLowerCase();
    if (lower.endsWith('.pdf')) return 'pdf';
    if (lower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)) return 'image';
    if (lower.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/)) return 'doc';
    return 'other';
};
