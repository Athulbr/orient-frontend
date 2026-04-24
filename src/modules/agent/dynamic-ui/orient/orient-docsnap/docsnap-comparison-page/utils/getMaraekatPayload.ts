import { Order } from '../../types';
import { format, isValid, parse, parseISO } from 'date-fns';

const SUPPORTED_FORMATS = [
    'dd/MM/yyyy', // 22/07/2026
    'MM/dd/yyyy', // 07/22/2026
    'yyyy-MM-dd', // 2026-07-22
    'dd-MM-yyyy', // 22-07-2026
    'dd-MMM-yyyy', // 02-Apr-2026 (also handles 02-APR-2026 via normalization)
    'MM-dd-yyyy', // 07-22-2026
    'dd.MM.yyyy', // 22.07.2026
    'MM.dd.yyyy', // 07.22.2026
    'yyyy/MM/dd', // 2026/07/22
    'MMM dd, yyyy', // Jul 22, 2026
    'MMMM dd, yyyy', // July 22, 2026
    'dd MMM yyyy', // 22 Jul 2026
    'dd MMMM yyyy', // 22 July 2026
    'yyyyMMdd' // 20260722
];

interface DateResult {
    success: boolean;
    date: string;
}

/**
 * Normalize a date string so month names/abbreviations are title-cased.
 * e.g. "02-APR-2026" → "02-Apr-2026", "22 JULY 2026" → "22 July 2026"
 */
const normalizeDateString = (dateStr: string): string => {
    return dateStr.replace(/[A-Za-z]+/g, match => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase());
};

const formatDate = (date: string | Date | null | undefined): DateResult => {
    if (!date) return { success: false, date: '' };

    // Handle Date object directly
    if (date instanceof Date) {
        return isValid(date) ? { success: true, date: format(date, 'dd-MMM-yyyy') } : { success: false, date: '' };
    }

    // Handle ISO 8601 strings (e.g. "2026-07-22T10:30:00Z")
    const isoDate = parseISO(date);
    if (isValid(isoDate)) {
        return { success: true, date: format(isoDate, 'dd-MMM-yyyy') };
    }

    // Normalize to title-case so "APR" / "apr" → "Apr"
    const normalized = normalizeDateString(date);

    // Try each supported format
    for (const fmt of SUPPORTED_FORMATS) {
        const parsedDate = parse(normalized, fmt, new Date());
        if (isValid(parsedDate)) {
            return { success: true, date: format(parsedDate, 'dd-MMM-yyyy') };
        }
    }

    return { success: false, date: '' };
};

export interface MaraekatPayloadResult {
    payload: Record<string, string>;
    dateErrors: string[];
}

const DATE_FIELDS: { key: string; label: string; getValue: (extractedData: Record<string, any>) => string }[] = [
    { key: 'PASSPORT_ISSUEDATE', label: 'Passport Issue Date', getValue: d => d?.passport?.passport_issue_date?.value || '' },
    { key: 'PASSPORT_EXPIRYDATE', label: 'Passport Expiry Date', getValue: d => d?.passport?.passport_expiry_date?.value || '' },
    { key: 'DOB', label: 'Date of Birth', getValue: d => d?.passport?.date_of_birth?.value || '' },
    { key: 'DEPARTUREDATE', label: 'Departure Date', getValue: d => d?.travel_itinerary?.departure_date?.value || '' },
    { key: 'ARRIVALDATE', label: 'Arrival Date', getValue: d => d?.travel_itinerary?.arrival_date?.value || '' }
];

export const getMaraekatPayload = (order: Order, extractedData: Record<string, any>): MaraekatPayloadResult => {
    const dateErrors: string[] = [];
    const dateValues: Record<string, string> = {};

    // Process all date fields and collect errors for invalid formats
    for (const field of DATE_FIELDS) {
        const rawValue = field.getValue(extractedData);
        if (rawValue) {
            const result = formatDate(rawValue);
            if (!result.success) {
                dateErrors.push(`Invalid date format for ${field.label}: "${rawValue}"`);
            }
            dateValues[field.key] = result.date;
        } else {
            dateValues[field.key] = '';
        }
    }
    function generateRandomBookingNumber() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const unique = String(Math.floor(100000 + Math.random() * 900000));

        return `${year}${month}${day}${unique}`;
    }
    const orderType = order.orderDetails?.orderType;
    const purposeKeys = {
        Education: 'S',
        Medical: 'M',
        'Leisure/Holiday': 'B',
        'Business Trip': 'Y',
        Employment: 'J',
        Emigration: 'I',
        Immigration: 'I'
    };
    const getPurposeKey = (purpose: string) => {
        if (!purpose) {
            return '';
        }
        if (purposeKeys[purpose as keyof typeof purposeKeys]) {
            return purposeKeys[purpose as keyof typeof purposeKeys];
        }
        return 'Wrong Purpose Key';
    };
    const payload = {
        BRANCHCODE: 'BANH',
        BOOKINGTYPE: orderType === 'sell' ? 'SALE' : orderType === 'buy' ? 'PURCHASE' : orderType,
        BOOKINGNO: String(generateRandomBookingNumber()),
        // BOOKINGNO: String(order.orderDetails?.orderNumber),
        BOOKINGDATE: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-').toUpperCase(),
        SOURCEFROM: order.orderDetails?.documentSubmitStatus === 'online' ? 'OEONLINE' : 'OEOFFLINE',
        HANDLEDBY: 'SAJI',
        BOOKEDBY: 'SHAILESH',
        PAXNAME: extractedData?.pan_card?.pax_name?.value || '',
        PASSPORTNO: extractedData?.passport?.passport_number?.value || '',
        PASSPORT_ISSUEFROM: extractedData?.passport?.passport_issued_from?.value || '',
        PASSPORT_ISSUEDATE: dateValues.PASSPORT_ISSUEDATE,
        PASSPORT_EXPIRYDATE: dateValues.PASSPORT_EXPIRYDATE,
        DOB: dateValues.DOB,
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
        PARENTNAME: extractedData?.passport?.parent_name?.value || '',
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
        DEPARTUREDATE: dateValues.DEPARTUREDATE,
        TRAVELINGCOUNTRY: extractedData?.travel_itinerary?.traveling_country?.value || '',
        ARRIVALDATE: dateValues.ARRIVALDATE,
        ROUTE: extractedData?.travel_itinerary?.route?.value || '',
        PurposeofTransaction: getPurposeKey(order.orderDetails?.purpose || ''),
        ResidentStatus: order.orderDetails?.residentialStatus,
        LoanAmount: order.orderDetails?.totalAmount,
        StudentTravellerPAN: ''
    };
    // console.log('extractedData', extractedData);
    // console.log('payload', payload);

    const uppercasedPayload = Object.keys(payload).reduce(
        (acc, key) => {
            acc[key] = String(payload[key as keyof typeof payload] || '').toUpperCase();
            return acc;
        },
        {} as Record<string, string>
    );
    return { payload: uppercasedPayload, dateErrors };
};
