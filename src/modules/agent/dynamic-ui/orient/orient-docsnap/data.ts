import { Order, Email, TemplateRequirement, FileItem } from './types';

export const sampleOrders: Order[] = [
    {
        order_details: {
            order_id: 1053184,
            order_no: '20260327860891',
            type: 'sell',
            order_status: 'completed',
            loc_id: '5',
            branch_id: '5',
            branch: 'Bangalore - Basavangudi',
            payment_type: 'UPI',
            delivery_mode: 'door',
            delivery_charge: '100',
            handling_charges: '50',
            total_amount: '9136',
            user_details: {
                user_name: 'harshithaaa',
                user_email: 'harshitha.poojary@orientexchange.in',
                user_phone: '8884303229',
                pan_number: 'AAAAA1234A'
            },
            doc_Submit_Status: 'online',
            purpose: 'Education',
            doc_upload_time: '2026-03-27 11:33:13',
            document_count: 4,
            document_details: [
                {
                    documentName: 'passport_first_page',
                    documentUrl: 'https://10.11.100.10/uploads/1774605684_logo_175X77.png'
                },
                {
                    documentName: 'passport_last_page',
                    documentUrl: 'https://10.11.100.10/uploads/1774605684_logo_AND_TAGLINE_WITH_REGD_IN_BLACK.png'
                },
                {
                    documentName: 'pan_card',
                    documentUrl: 'https://10.11.100.10/uploads/1774605684_logo_175X77.png'
                },
                {
                    documentName: 'university_offer_letter',
                    documentUrl: 'https://10.11.100.10/uploads/1774605684_logo_175X77.png'
                }
            ],
            currency_details: [
                {
                    currency: 'USD',
                    product: 'unipay',
                    quantity: '100',
                    amount: '8914'
                }
            ]
        },
        extractionDetails: {}
    }
];

// const temp={
//         order_details: {
//             order_id: 1289082, // generate 8 digit random number not 7 digit
//             order_no: '20250417117175', // generate random number year+month+day+timestamp
//             type: 'sell', // single select input buy/sell
//             location: 'Bangalore', // hardcode banglore
//             loc_id: 5, // hardcode 5
//             branch: 'Bangalore-Basavangudi', // hardcode banglore-basavangudi
//             branch_id: 5, // hardcode 5
//             total_amount: 85000, // text input
//             actual_amount: 84500, // text input
//             order_status: 'Completed', // hardcode pending
//             doc_submit_status: 'Online' // hardcode offline
//         },
//         user_details: { user_id: 501, name: 'Ritesh Singh', email: 'ritesh@example.com', phone: '9876543210' }, // hardcode { user_id: 501, name: 'Ritesh Singh', email: 'ritesh@example.com', phone: '9876543210' }
//         currency_details: [ // hardcode empty array
//             { sr_no: 1, currency: 'USD', product: 'Forex Card', quantity: 1000, rate: 83.5, amount: 83500 },
//             { sr_no: 2, currency: 'EUR', product: 'Cash', quantity: 200, rate: 90.0, amount: 18000 }
//         ],
//         document_details: [ // hardcode empty array
//             { documentName: 'passport', documentUrl: 'http://www.orientexchange.in/uploads/passport.pdf' },
//             { documentName: 'passport_last_page', documentUrl: 'http://www.orientexchange.in/uploads/passport_last.pdf' },
//             { documentName: 'visa', documentUrl: 'http://www.orientexchange.in/uploads/visa.pdf' },
//             { documentName: 'ticket_copy', documentUrl: 'http://www.orientexchange.in/uploads/ticket.pdf' },
//             { documentName: 'pan_card', documentUrl: 'http://www.orientexchange.in/uploads/pan.pdf' },
//             { documentName: 'university_offer_letter', documentUrl: 'http://www.orientexchange.in/uploads/offer_letter.pdf' }
//         ]
//     }

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
