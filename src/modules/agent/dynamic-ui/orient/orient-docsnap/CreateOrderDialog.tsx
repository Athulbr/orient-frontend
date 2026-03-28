import React, { useState } from 'react';
import { Button } from '../../../../../components/Button';
import { Order } from './types';

interface CreateOrderDialogProps {
    initialOrder?: Order;
    onClose: () => void;
    onCreate: (order: Order) => void;
    onUpdate?: (order: Order) => void;
}

const CreateOrderDialog: React.FC<CreateOrderDialogProps> = ({ initialOrder, onClose, onCreate, onUpdate }) => {
    const isEdit = !!initialOrder;
    const [type, setType] = useState(initialOrder?.order_details.type || 'sell');
    const [totalAmount, setTotalAmount] = useState(initialOrder ? String(initialOrder.order_details.total_amount) : '');
    const [actualAmount, setActualAmount] = useState(initialOrder && initialOrder.order_details.actual_amount ? String(initialOrder.order_details.actual_amount) : '');
    const [userName, setUserName] = useState(initialOrder?.order_details.user_details.user_name || '');
    const [userEmail, setUserEmail] = useState(initialOrder?.order_details.user_details.user_email || '');
    const [userPhone, setUserPhone] = useState(initialOrder?.order_details.user_details.user_phone || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && initialOrder && onUpdate) {
            const updatedOrder: Order = {
                ...initialOrder,
                order_details: {
                    ...initialOrder.order_details,
                    type,
                    total_amount: totalAmount,
                    actual_amount: actualAmount,
                    user_details: {
                        ...initialOrder.order_details.user_details,
                        user_name: userName,
                        user_email: userEmail,
                        user_phone: userPhone
                    }
                }
            };
            onUpdate(updatedOrder);
            return;
        }

        // generate random 8 digit ID
        const order_id = Math.floor(10000000 + Math.random() * 90000000);
        // generate random 6 digit user ID
        const user_id = Math.floor(100000 + Math.random() * 900000);

        // generate order_no: year+month+day+timestamp
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const timestamp = now.getTime().toString().slice(-6);
        const order_no = `${year}${month}${day}${timestamp}`;

        const newOrder: Order = {
            order_details: {
                order_id,
                order_no,
                type,
                loc_id: '5',
                branch: 'Bangalore - Basavangudi',
                branch_id: '5',
                total_amount: totalAmount || '0',
                actual_amount: actualAmount || undefined,
                order_status: 'Pending',
                doc_Submit_Status: 'Offline',
                document_count: 0,
                user_details: {
                    user_name: userName,
                    user_email: userEmail,
                    user_phone: userPhone
                },
                document_details: [],
                currency_details: []
            },
            extractionDetails: {}
        };

        onCreate(newOrder);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-2 gap-5 mb-6 mt-2">
                <div className="flex flex-col gap-5">
                    <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">User Details</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={userName}
                            onChange={e => setUserName(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g. Ritesh Singh"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={userEmail}
                            onChange={e => setUserEmail(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g. ritesh@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="number"
                            value={userPhone}
                            onChange={e => setUserPhone(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g. 9876543210"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-5">
                    <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">Order Details</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                        <select
                            value={type}
                            onChange={e => setType(e.target.value)}
                            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="sell">Sell</option>
                            <option value="buy">Buy</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                        <input
                            type="number"
                            value={totalAmount}
                            onChange={e => setTotalAmount(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g. 85000"
                        />
                    </div>
                    {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Actual Amount</label>
                        <input
                            type="number"
                            value={actualAmount}
                            onChange={e => setActualAmount(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g. 84500"
                        />
                    </div> */}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button outlined onClick={onClose} type="button">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} type="submit">
                    {isEdit ? 'Update Order' : 'Create Order'}
                </Button>
            </div>
        </form>
    );
};

export default CreateOrderDialog;
