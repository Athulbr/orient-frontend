import { Order, Email, FileItem } from './types';

export const sampleOrders: Order[] = [
    {
        order_details: {
            order_id: 1289082,
            order_no: '20250417117175',
            type: 'sell',
            order_status: 'pending',
            branch: 'Bangalore-Basavangudi',
            branch_id: 5,
            total_amount: 85000,
            actual_amount: 84500,
            payment_type: 'UPI',
            delivery_mode: 'door',
            delivery_charge: 100,
            handling_charges: 50,
            doc_submit_status: 'Online',
            purpose: 'Education',
            doc_upload_time: '2026-03-27 11:33:13'
        },
        user_details: { user_id: 501, name: 'Ritesh Singh', email: 'ritesh@example.com', phone: '9876543210', pan_number: 'ABCDE1234F' },
        currency_details: [
            { currency: 'USD', product: 'Forex Card', quantity: 1000, rate: 83.5, amount: 83500 },
            { currency: 'EUR', product: 'Cash', quantity: 200, rate: 90.0, amount: 18000 }
        ],
        document_details: [
            { documentName: 'passport', documentUrl: 'http://www.orientexchange.in/uploads/passport.pdf' },
            { documentName: 'passport_last_page', documentUrl: 'http://www.orientexchange.in/uploads/passport_last.pdf' },
            { documentName: 'visa', documentUrl: 'http://www.orientexchange.in/uploads/visa.pdf' },
            { documentName: 'ticket_copy', documentUrl: 'http://www.orientexchange.in/uploads/ticket.pdf' }
        ],
        extractionDetails: {},
        linkedEmailIds: ['EMAIL-001', 'EMAIL-002']
    }
];

export const oldSampleOrders: Order[] = [
    {
        order_details: {
            order_id: 1289082,
            order_no: '20250417117175',
            type: 'sell',
            location: 'Bangalore',
            loc_id: 5,
            order_status: 'Pending',
            branch: 'Bangalore-Basavangudi',
            branch_id: 5,
            total_amount: 85000,
            actual_amount: 84500,
            doc_submit_status: 'Online'
        },
        user_details: { user_id: 501, name: 'Ritesh Singh', email: 'ritesh@example.com', phone: '9876543210' },
        currency_details: [
            { sr_no: 1, currency: 'USD', product: 'Forex Card', quantity: 1000, rate: 83.5, amount: 83500 },
            { sr_no: 2, currency: 'EUR', product: 'Cash', quantity: 200, rate: 90.0, amount: 18000 }
        ],
        document_details: [
            { documentName: 'passport', documentUrl: 'http://www.orientexchange.in/uploads/passport.pdf' },
            { documentName: 'passport_last_page', documentUrl: 'http://www.orientexchange.in/uploads/passport_last.pdf' },
            { documentName: 'visa', documentUrl: 'http://www.orientexchange.in/uploads/visa.pdf' },
            { documentName: 'ticket_copy', documentUrl: 'http://www.orientexchange.in/uploads/ticket.pdf' }
        ],
        extractionDetails: {}
    }
];

export const sampleEmails: Email[] = [
    {
        emailId: 'EMAIL-001',
        subject: 'Order Documents - ORD-2024-008821',
        from: 'rahul.mehta@example.com',
        date: '2024-03-18T10:30:00+05:30',
        orderId: 'ORD-2024-008821',
        bodyInnerText: 'Please find attached the PAN Card and Address Proof for order ORD-2024-008821. Kindly process it as soon as possible.',
        body: 'Please find attached the PAN Card and Address Proof for order ORD-2024-008821. Kindly process it as soon as possible.',
        attachments: [
            { name: 'PAN_Card.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', source: 'email' },
            { name: 'Address_Proof.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', source: 'email' }
        ]
    },
    {
        emailId: 'EMAIL-002',
        subject: 'KYC Documents Attached - Anita Desai',
        from: 'anita.desai@example.com',
        date: '2024-03-19T11:15:00+05:30',
        orderId: 'ORD-2024-008822',
        bodyInnerText: 'Attaching the required KYC documents including my passport scan, bank statement, and photo ID for your review.',
        body: 'Attaching the required KYC documents including my passport scan, bank statement, and photo ID for your review.',
        attachments: [
            { name: 'Passport_Scan.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', source: 'email' },
            { name: 'Bank_Statement.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', source: 'email' }
        ]
    }
];

export const availableEmails: Email[] = [
    {
        emailId: 'EMAIL-101',
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
        emailId: 'EMAIL-102',
        subject: 'Document Submission - Urgent',
        from: 'vikram.singh@example.com',
        date: '2024-03-20T09:45:00+05:30',
        body: 'Attaching my income proof. Please process my transfer authorization at the earliest.',
        attachments: [{ name: 'Income_Proof.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', source: 'email' }]
    },
    {
        emailId: 'EMAIL-103',
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
