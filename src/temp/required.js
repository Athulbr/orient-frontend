// New API Response Prefered
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
                document_details: [
                    { documentName: 'passport', documentUrl: 'http://www.orientexchange.in/uploads/passport.pdf' },
                    { documentName: 'passport_last_page', documentUrl: 'http://www.orientexchange.in/uploads/passport_last.pdf' },
                    { documentName: 'visa', documentUrl: 'http://www.orientexchange.in/uploads/visa.pdf' },
                    { documentName: 'ticket_copy', documentUrl: 'http://www.orientexchange.in/uploads/ticket.pdf' },
                    { documentName: 'pan_card', documentUrl: 'http://www.orientexchange.in/uploads/pan.pdf' },
                    { documentName: 'university_offer_letter', documentUrl: 'http://www.orientexchange.in/uploads/offer_letter.pdf' }
                ]
            }
        ]
    }
};
