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
    const [orderType, setOrderType] = useState(initialOrder?.orderDetails.orderType || 'sell');
    const [productType, setProductType] = useState(initialOrder?.orderDetails.productType || 'card');
    const [totalAmount, setTotalAmount] = useState(initialOrder ? String(initialOrder.orderDetails.totalAmount) : '');
    const [actualAmount, setActualAmount] = useState(initialOrder ? String(initialOrder.orderDetails.actualAmount) : '');
    const [userName, setUserName] = useState(initialOrder?.userDetails.name || '');
    const [userEmail, setUserEmail] = useState(initialOrder?.userDetails.email || '');
    const [userPhone, setUserPhone] = useState(initialOrder?.userDetails.phone || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && initialOrder && onUpdate) {
            const updatedOrder: Order = {
                ...initialOrder,
                orderDetails: {
                    ...initialOrder.orderDetails,
                    orderType,
                    totalAmount: Number(totalAmount) || 0,
                    actualAmount: Number(actualAmount) || 0
                },
                userDetails: {
                    ...initialOrder.userDetails,
                    name: userName,
                    email: userEmail,
                    phone: userPhone
                }
            };
            onUpdate(updatedOrder);
            return;
        }

        // generate random 8 digit ID
        const orderId = Math.floor(10000000 + Math.random() * 90000000);
        // generate random 6 digit user ID
        const userId = Math.floor(100000 + Math.random() * 900000);

        // generate orderNumber: year+month+day+timestamp
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const timestamp = now.getTime().toString().slice(-6);
        const orderNumber = Number(`${year}${month}${day}${timestamp}`);

        const newOrder: Order = {
            orderDetails: {
                orderId,
                orderNumber,
                orderType,
                productType,
                branch: 'Bangalore-Basavangudi',
                branchId: 5,
                totalAmount: Number(totalAmount) || 0,
                actualAmount: Number(actualAmount) || 0,
                orderStatus: 'pending',
                documentSubmitStatus: 'Offline'
            },
            userDetails: {
                userId,
                name: userName,
                email: userEmail,
                phone: userPhone
            },
            currencyDetails: [],
            documentDetails: [],
            extractionDetails: {}
        };

        onCreate(newOrder);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-2 gap-8 mb-6 mt-2">
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
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="orderType"
                                    value="sell"
                                    checked={orderType === 'sell'}
                                    onChange={e => setOrderType(e.target.value as 'sell' | 'buy')}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="text-sm text-gray-700">Sell</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="orderType"
                                    value="buy"
                                    checked={orderType === 'buy'}
                                    onChange={e => setOrderType(e.target.value as 'sell' | 'buy')}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="text-sm text-gray-700">Buy</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="productType"
                                    value="card"
                                    checked={productType === 'card'}
                                    onChange={e => setProductType(e.target.value as 'card' | 'currency' | 'tt')}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="text-sm text-gray-700">Card</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="productType"
                                    value="currency"
                                    checked={productType === 'currency'}
                                    onChange={e => setProductType(e.target.value as 'card' | 'currency' | 'tt')}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="text-sm text-gray-700">Currency</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="productType"
                                    value="tt"
                                    checked={productType === 'tt'}
                                    onChange={e => setProductType(e.target.value as 'card' | 'currency' | 'tt')}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="text-sm text-gray-700">TT</span>
                            </label>
                        </div>
                    </div>
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
