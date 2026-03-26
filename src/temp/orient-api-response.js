// ==================================================================================================================================================================
// REQUIRED RESPONSE
// ==================================================================================================================================================================

const orders = [
    {
        order_id: '20260323944278',
        order_type: 'BUY',
        payment_type: 'UPI - Using Gateway',
        status: 'completed',
        location_id: '24',
        branch_id: '42',
        branch_name: 'Coimbatore - R. S Puram',
        user_details: { user_id: 501, name: 'Ritesh Singh', email: 'ritesh@example.com', phone: '9876543210' }, // Please provide some more user details if available
        document_details: [
            { documentName: 'passport', documentUrl: 'http://www.orientexchange.in/uploads/passport.pdf' },
            { documentName: 'passport_last_page', documentUrl: 'http://www.orientexchange.in/uploads/passport_last.pdf' },
            { documentName: 'visa', documentUrl: 'http://www.orientexchange.in/uploads/visa.pdf' },
            { documentName: 'ticket_copy', documentUrl: 'http://www.orientexchange.in/uploads/ticket.pdf' },
            { documentName: 'pan_card', documentUrl: 'http://www.orientexchange.in/uploads/pan.pdf' },
            { documentName: 'university_offer_letter', documentUrl: 'http://www.orientexchange.in/uploads/offer_letter.pdf' }
        ]
    }
];

// ==================================================================================================================================================================
// GIVEN SAMPLE RESPONSE 1
// ==================================================================================================================================================================

// Orders API Response
// First API:{Orders}
const response1 = {
    status: 'success',
    message: 'Orders data fetched successfully',
    data: {
        orders: [
            {
                order_details: {
                    order_id: 1289082,
                    order_no: '20250417117175',
                    type: 'sell',
                    location: 'Bangalore',
                    Loc_id: 5,
                    Branch: 'Bangalore-Basavangudi',
                    branch_id: 5,
                    total_amount: 85000,
                    actual_amount: 84500,
                    order_status: 'Completed',
                    Doc_Submit_Status: 'Online'
                },
                user_details: { user_id: 501, name: 'Ritesh Singh', email: 'ritesh@example.com', phone: '9876543210' },
                currency_details: [
                    { sr_no: 1, currency: 'USD', product: 'Forex Card', quantity: 1000, rate: 83.5, amount: 83500 },
                    { sr_no: 2, currency: 'EUR', product: 'Cash', quantity: 200, rate: 90.0, amount: 18000 }
                ],
                document_details: {
                    passport: 'http://www.orientexchange.in/uploads/passport.pdf',
                    passport_last_page: 'http://www.orientexchange.in/uploads/passport_last.pdf',
                    visa: 'http://www.orientexchange.in/uploads/visa.pdf',
                    ticket_copy: 'http://www.orientexchange.in/uploads/ticket.pdf',
                    pan_card: 'http://www.orientexchange.in/uploads/pan.pdf',
                    university_offer_letter: 'http://www.orientexchange.in/uploads/offer_letter.pdf'
                }
            },
            {
                order_details: {
                    order_id: 1289083,
                    order_no: '20250417117176',
                    type: 'Cardreload',
                    location: 'Mumbai',
                    Loc_id: 2,
                    Branch: 'Mumbai-Andheri',
                    branch_id: 2,
                    total_amount: 45000,
                    actual_amount: 44800,
                    order_status: 'Pending',
                    Doc_Submit_Status: 'Offline'
                },
                user_details: { user_id: 502, name: 'Amit Sharma', email: 'amit@example.com', phone: '9123456780' },
                currency_details: [{ sr_no: 1, currency: 'GBP', product: 'Forex Card', quantity: 500, rate: 105.0, amount: 52500 }],
                document_details: {
                    passport: 'http://www.orientexchange.in/uploads/passport2.pdf',
                    passport_last_page: 'http://www.orientexchange.in/uploads/passport_last2.pdf',
                    pan_card: 'http://www.orientexchange.in/uploads/pan2.pdf',
                    visa: 'http://www.orientexchange.in/uploads/visa2.pdf',
                    ticket_copy: 'http://www.orientexchange.in/uploads/ticket2.pdf',
                    return_ticket: 'http://www.orientexchange.in/uploads/return_ticket2.pdf'
                }
            }
        ]
    }
};

// ==================================================================================================================================================================

const response2 = {
    orders: [
        {
            order_id: '20260323944278',
            order_type: 'BUY',
            payment_type: 'UPI - Using Gateway',
            status: 'completed',
            location_id: '24',
            branch_id: '42',
            branch_name: 'Coimbatore - R. S Puram',
            payment_firstpage: 'https://10.11.100.10/uploads/1774258339_'
        },
        {
            order_id: '20260323798532',
            order_type: 'BUY',
            payment_type: 'UPI - Using Gateway',
            status: 'completed',
            location_id: '5',
            branch_id: '5',
            branch_name: 'Bangalore - Basavangudi',
            payment_firstpage: 'https://10.11.100.10/uploads/177467899643258339'
        }
    ]
};

// ==================================================================================================================================================================
// GIVEN SAMPLE RESPONSE 2 (For Order Details)
// ==================================================================================================================================================================

// Second API:{order_id}

const response3 = {
    status: 'success',
    message: 'Order data fetched successfully',
    data: {
        order_details: {
            order_id: 1289082,
            order_no: '20250417117175',
            type: 'sell',
            location: 'Bangalore',
            Loc_id: 5,
            Branch: 'Bangalore-Basavangudi',
            branch_id: 5,
            total_amount: 85000,
            actual_amount: 84500,
            order_status: 'Completed',
            Doc_Submit_Status: 'Online'
        },
        user_details: {
            user_id: 501,

            name: 'Ritesh Singh',
            email: 'ritesh@example.com',
            phone: '9876543210'
        },
        currency_details: [
            { sr_no: 1, currency: 'USD', product: 'Forex Card', quantity: 1000, rate: 83.5, amount: 83500 },
            { sr_no: 2, currency: 'EUR', product: 'Cash', quantity: 200, rate: 90.0, amount: 18000 }
        ],
        document_details: {
            passport: 'http://www.orientexchange.in/uploads/passport.pdf',
            passport_last_page: 'http://www.orientexchange.in/uploads/passport_last.pdf',
            visa: 'http://www.orientexchange.in/uploads/visa.pdf',
            ticket_copy: 'http://www.orientexchange.in/uploads/ticket.pdf',
            pan_card: 'http://www.orientexchange.in/uploads/pan.pdf',
            university_offer_letter: 'http://www.orientexchange.in/uploads/offer_letter.pdf'
        }
    }
};

// ==================================================================================================================================================================

// Response 2:

const response4 = {
    orders: [
        {
            order_id: '20260323944278',
            order_type: 'BUY',
            payment_type: 'UPI - Using Gateway',
            status: 'completed',
            location_id: '24',
            branch_id: '42',
            branch_name: 'Coimbatore - R. S Puram',
            payment_firstpage: 'https://10.11.100.10/uploads/1774258339_',
            user_id: 501,
            name: 'Raj',
            email: 'raj@example.com',
            phone: '124567890',
            currency_details: [{ sr_no: 1, currency: 'USD', product: 'Forex Card', quantity: 1000, rate: 83.5, amount: 83500 }]
        },
        {
            order_id: '20260323944279',
            order_type: 'SELL',
            payment_type: 'Net Banking',
            status: 'pending',
            location_id: '12',
            branch_id: '30',
            branch_name: 'Chennai - T Nagar',
            payment_firstpage: 'https://10.11.100.10/uploads/1774258339_',
            user_id: 502,
            name: 'Arun',
            email: 'arun@example.com',
            phone: '1234567890',
            currency_details: [
                { sr_no: 1, currency: 'EUR', product: 'Cash', quantity: 500, rate: 89.75, amount: 44875 },
                { sr_no: 2, currency: 'GBP', product: 'Forex Card', quantity: 300, rate: 102.2, amount: 30660 }
            ]
        },
        {
            order_id: '20260323944280',
            order_type: 'BUY',
            payment_type: 'Cash',
            status: 'completed',
            location_id: '18',
            branch_id: '25',
            branch_name: 'Bangalore - Indiranagar',
            payment_firstpage: 'https://10.11.100.10/uploads/1774258339_',
            user_id: 503,

            name: 'Aakash',
            email: 'Aakash@example.com',
            phone: '1234567890',
            currency_details: [{ sr_no: 1, currency: 'AUD', product: 'Cash', quantity: 700, rate: 54.3, amount: 38010 }]
        }
    ]
};

// NOTE: Please find the response presented in two different formats. Kindly select your preferred format and inform us. We will ensure that all future responses follow the chosen format.
