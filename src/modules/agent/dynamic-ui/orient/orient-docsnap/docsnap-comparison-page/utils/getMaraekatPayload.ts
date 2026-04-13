import { Order } from "../../types";

export const getMaraekatPayload = (order: Order, extractedData: Record<string, any>) => {
    const payload = {
        BRANCHCODE: 'BANH',
        BOOKINGTYPE: order.orderDetails?.orderType,
        BOOKINGNO: String(order.orderDetails?.orderNumber),
        BOOKINGDATE: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-').toUpperCase(),
        SOURCEFROM: order.orderDetails?.documentSubmitStatus === 'online' ? 'OEONLINE' : 'OEOFFLINE',
        HANDLEDBY: 'SAJI',
        BOOKEDBY: 'SHAILESH',
        PAXNAME: extractedData?.passport?.pax_name?.value || '',
        PASSPORTNO: extractedData?.passport?.passport_number?.value || '',
        PASSPORT_ISSUEFROM: extractedData?.passport?.passport_issued_from?.value || '',
        PASSPORT_ISSUEDATE: extractedData?.passport?.passport_issue_date?.value || '',
        PASSPORT_EXPIRYDATE: extractedData?.passport?.passport_expiry_date?.value || '',
        DOB: extractedData?.passport?.date_of_birth?.value || '',
        GENDER: extractedData?.passport?.gender?.value || '',
        NATIONALITY: extractedData?.passport?.nationality?.value || '',
        PANNO: extractedData?.pan_card?.pan_number?.value || '',
        PANCARDHOLDERNAME: extractedData?.pan_card?.pan_card_holder_name?.value || '',
        FATHERNAME: extractedData?.pan_card?.father_name?.value || '',
        TYPEOFPERSON: extractedData?.pan_card?.type_of_person?.value || '',
        ADHAARCARDNO: extractedData?.user_identity_details?.aadhaar_card_number?.value || '',
        PAXADDRESS: extractedData?.user_identity_details?.passenger_address?.value || '',
        MOBILENO: order.userDetails?.phone,
        EMAILID: order.userDetails?.email,
        PARENTNAME: extractedData?.customer_declaration?.parent_name?.value || '',
        VOTERCARDNO: extractedData?.voter_id_card?.voter_card_number?.value || '',
        FIRSTNAME: extractedData?.passport?.first_name?.value || '',
        LASTNAME: extractedData?.passport?.last_name?.value || '',
        DRIVINGLICNO: extractedData?.driving_licence?.driving_licence_number?.value || '',
        BuildingFlatNO: extractedData?.user_identity_details?.building_or_flat_number?.value || '',
        STREETNAME: extractedData?.user_identity_details?.street_name?.value || '',
        LOCATION: extractedData?.user_identity_details?.location?.value || '',
        CITY: extractedData?.user_identity_details?.city?.value || '',
        PINCODE: extractedData?.user_identity_details?.pin_code?.value || '',
        STATENAME: extractedData?.user_identity_details?.state_name?.value || '',
        COUNTRY: extractedData?.user_identity_details?.country?.value || '',
        PNRNO: extractedData?.travel_itinerary?.pnr_number?.value || '',
        TICKETNO: extractedData?.travel_itinerary?.ticket_number?.value || '',
        // AIRLINENAME: extractedData?.travel_itinerary?.airline_name?.value || '',
        AIRLINENAME: 'AIR CANADA',
        DEPARTUREFROM: extractedData?.travel_itinerary?.departure_from?.value || '',
        DEPARTUREDATE: extractedData?.travel_itinerary?.departure_date?.value || '',
        TRAVELINGCOUNTRY: extractedData?.travel_itinerary?.traveling_country?.value || '',
        ARRIVALDATE: extractedData?.travel_itinerary?.arrival_date?.value || '',
        ROUTE: extractedData?.travel_itinerary?.route?.value || ''
    };
    const uppercasedPayload = Object.keys(payload).reduce((acc, key) => {
        acc[key] = payload[key as keyof typeof payload]?.toUpperCase();
        return acc;
    }, {} as Record<string, string>);
    return uppercasedPayload;
}