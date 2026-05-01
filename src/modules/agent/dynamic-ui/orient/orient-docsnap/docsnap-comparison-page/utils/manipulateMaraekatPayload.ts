import { Order } from '../../types';

export const manipulateMaraekatPayload = (payload: any, order: Order) => {
    const orderType = order.orderDetails?.orderType;
    if (orderType === 'buy') {
        return payload;
    }
    payload.ARRIVALDATE = '';

    return payload;
};
