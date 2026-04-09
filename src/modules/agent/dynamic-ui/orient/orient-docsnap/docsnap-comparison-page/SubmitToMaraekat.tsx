import React, { useState, useRef, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, GripHorizontal, Loader2 } from 'lucide-react';
import { config } from '../../../../../../config/default';
import { Order } from '../types';

type ResultMessage = {
    type: 'success' | 'error';
    messages: string[];
};

interface DraggableResultCardProps {
    result: ResultMessage;
    onClose: () => void;
}

const DraggableResultCard: React.FC<DraggableResultCardProps> = ({ result, onClose }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            setPosition({
                x: e.clientX - dragStartPos.current.x,
                y: e.clientY - dragStartPos.current.y
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const isSuccess = result.type === 'success';

    return (
        <div
            className={`absolute bottom-[calc(100%+1rem)] right-0 z-50 flex w-120 flex-col overflow-hidden rounded-xl border bg-white shadow-2xl transition-shadow ${
                isSuccess ? 'border-green-200' : 'border-red-200'
            } ${isDragging ? 'cursor-grabbing shadow-[0_20px_50px_rgba(0,0,0,0.2)]' : 'shadow-lg'}`}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`
            }}
        >
            {/* Header (Draggable handle) */}
            <div
                className={`flex cursor-grab items-center justify-between px-4 py-3 active:cursor-grabbing ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2 font-semibold">
                    <GripHorizontal size={18} className={isSuccess ? 'text-green-500/50' : 'text-red-500/50'} />
                    {isSuccess ? <CheckCircle size={18} className="text-green-600" /> : <AlertCircle size={18} className="text-red-600" />}
                    <span>{isSuccess ? 'Success' : 'Validation Failed'}</span>
                </div>
                <button
                    onClick={e => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className={`rounded-md p-1 transition-colors ${isSuccess ? 'hover:bg-green-200/50' : 'hover:bg-red-200/50'}`}
                >
                    <X size={18} />
                </button>
            </div>

            {/* Content */}
            <div className="max-h-100 overflow-y-auto bg-white p-4 text-sm text-gray-700">
                <ul className="flex flex-col gap-3">
                    {result.messages.map((msg, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                            <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="leading-snug">{msg}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const validatePayload = (payload: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const capitalizePayload = (payload: any) => {
        const capitalizedPayload: any = {};
        for (const key in payload) {
            if (typeof payload[key] === 'string') {
                capitalizedPayload[key] = payload[key].toUpperCase();
                if (capitalizedPayload[key] === 'BUY') {
                    capitalizedPayload[key] = 'PURCHASE';
                } else if (capitalizedPayload[key] === 'SELL') {
                    capitalizedPayload[key] = 'SALE';
                }
            }
        }
        return capitalizedPayload;
    };
    const capitalizedPayload = capitalizePayload(payload);
    console.log('capitalizedPayload:===========', capitalizedPayload);

    const {
        BRANCHCODE,
        BOOKINGTYPE,
        BOOKINGNO,
        BOOKINGDATE,
        SOURCEFROM,
        HANDLEDBY,
        BOOKEDBY,
        PAXNAME,
        PASSPORTNO,
        PASSPORT_ISSUEFROM,
        PASSPORT_ISSUEDATE,
        PASSPORT_EXPIRYDATE,
        DOB,
        GENDER,
        NATIONALITY,
        PANNO,
        PANCARDHOLDERNAME,
        FATHERNAME,
        TYPEOFPERSON,
        ADHAARCARDNO,
        PAXADDRESS,
        MOBILENO,
        EMAILID,
        PARENTNAME,
        VOTERCARDNO,
        FIRSTNAME,
        LASTNAME,
        DRIVINGLICNO,
        BuildingFlatNO,
        STREETNAME,
        LOCATION,
        CITY,
        PINCODE,
        STATENAME,
        COUNTRY,
        PNRNO,
        TICKETNO,
        AIRLINENAME,
        DEPARTUREFROM,
        DEPARTUREDATE,
        TRAVELINGCOUNTRY,
        ARRIVALDATE,
        ROUTE
    } = capitalizedPayload;

    // Enums (Dummy)
    const BRANCH_CODES = ['BANH', 'BOM', 'DEL', 'BLR'];
    const NATIONALITIES = ['INDIAN', 'US', 'UK', 'UAE'];
    const STATES = ['MAHARASHTRA', 'DELHI', 'KARNATAKA', 'GUJARAT', 'JHARKHAND'];
    const COUNTRIES = ['INDIA', 'USA', 'UNITED KINGDOM', 'UAE'];
    const AIRLINES = ['AIR INDIA', 'INDIGO', 'EMIRATES', 'VISTARA', 'AIR CANADA'];
    const TRAVEL_COUNTRIES = ['INDIA', 'UAE', 'USA', 'UK'];

    const isSale = String(BOOKINGTYPE).toUpperCase() === 'SALE';
    const isPurchase = String(BOOKINGTYPE).toUpperCase() === 'PURCHASE';

    // Helper functions
    const isPresent = (val: any) => typeof val === 'string' && val.trim() !== '';
    const isValidDateFormat = (val: string) => /^\d{2}-[A-Za-z]{3}-\d{4}$/.test(val);
    const parseDate = (val: string) => {
        if (!isPresent(val) || !isValidDateFormat(val)) return null;
        const months: any = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 };
        const parts = val.toUpperCase().split('-');
        return new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
    };
    const isToday = (d: Date | null) => {
        if (!d || isNaN(d.getTime())) return false;
        const today = new Date();
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    };
    const isPastOrToday = (d: Date | null) => {
        if (!d || isNaN(d.getTime())) return false;
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return d <= today;
    };
    const isFutureOrToday = (d: Date | null) => {
        if (!d || isNaN(d.getTime())) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d >= today;
    };
    const isFuture = (d: Date | null) => {
        if (!d || isNaN(d.getTime())) return false;
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return d > today;
    };

    if (!isPresent(BRANCHCODE) || !BRANCH_CODES.includes(BRANCHCODE?.toUpperCase())) errors.push('BRANCHCODE is invalid or missing from valid list.');
    if (!isSale && !isPurchase) errors.push('BOOKINGTYPE must be SALE or PURCHASE.');
    if (!isPresent(BOOKINGNO) || !/^[A-Za-z0-9]+$/.test(BOOKINGNO)) errors.push('BOOKINGNO must be alphanumeric/numeric and is mandatory.');

    if (!isPresent(BOOKINGDATE) || !isValidDateFormat(BOOKINGDATE) || !isToday(parseDate(BOOKINGDATE))) {
        errors.push("BOOKINGDATE must be today's date in DD-MMM-YYYY format.");
    }

    if (!isPresent(SOURCEFROM) || !['OEONLINE', 'OEOFFLINE'].includes(SOURCEFROM?.toUpperCase())) errors.push('SOURCEFROM must be OEONLINE or OEOFFLINE.');
    if (!isPresent(HANDLEDBY)) errors.push('HANDLEDBY is mandatory.');
    if (!isPresent(BOOKEDBY)) errors.push('BOOKEDBY is mandatory.');
    if (!isPresent(PAXNAME) && !isPresent(FIRSTNAME)) errors.push('Either PAXNAME or FIRSTNAME is mandatory.');

    if (isSale && !isPresent(PASSPORTNO)) errors.push('PASSPORTNO is mandatory for SALE.');
    if (isPresent(PASSPORTNO)) {
        if (!/^[A-Za-z0-9]+$/.test(PASSPORTNO)) errors.push('PASSPORTNO must be alphanumeric.');
        if (!isPresent(PASSPORT_ISSUEFROM)) errors.push('PASSPORT_ISSUEFROM is mandatory if PASSPORTNO is mentioned.');
        if (!isPresent(PASSPORT_ISSUEDATE) || !isPastOrToday(parseDate(PASSPORT_ISSUEDATE))) {
            errors.push('PASSPORT_ISSUEDATE must be past or current date if PASSPORTNO is mentioned.');
        }
        if (!isPresent(PASSPORT_EXPIRYDATE) || !isFuture(parseDate(PASSPORT_EXPIRYDATE))) {
            errors.push('PASSPORT_EXPIRYDATE must be future date if PASSPORTNO is mentioned.');
        }
    }

    if (!isPresent(DOB) || !isValidDateFormat(DOB) || !isPastOrToday(parseDate(DOB))) {
        errors.push('DOB is mandatory and must be a valid past date in DD-MMM-YYYY format.');
    } else {
        const dobDate = parseDate(DOB);
        if (dobDate) {
            const today = new Date();
            let age = today.getFullYear() - dobDate.getFullYear();
            const m = today.getMonth() - dobDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
                age--;
            }
            if (age < 12) {
                errors.push('User age must be at least 12 years.');
            }
        }
    }

    const validGenders = ['Male', 'Female', 'Other', 'M', 'F', 'O', 'MALE', 'FEMALE', 'OTHER'];
    if (!isPresent(GENDER) || !validGenders.includes(GENDER?.toUpperCase())) {
        errors.push('GENDER must be Male, Female, or Other.');
    }

    if (!isPresent(NATIONALITY) || !NATIONALITIES.includes(NATIONALITY?.toUpperCase())) {
        errors.push('NATIONALITY is invalid or missing from valid list.');
    }

    if (isSale && !isPresent(PANNO)) errors.push('PANNO is mandatory for SALE.');
    if (isPresent(PANNO)) {
        if (!/^[A-Za-z]{5}[0-9]{4}[A-Z]{1}$/i.test(PANNO)) errors.push('PANNO pattern is invalid.');
        if (!isPresent(PANCARDHOLDERNAME)) errors.push('PANCARDHOLDERNAME is mandatory if PANNO is mentioned.');
        if (isPresent(TYPEOFPERSON)) {
            const fourthChar = PANNO.charAt(3).toUpperCase();
            if (
                (fourthChar === 'P' && TYPEOFPERSON.toUpperCase() !== 'P' && TYPEOFPERSON.toUpperCase() !== 'PERSON') ||
                (fourthChar === 'C' && TYPEOFPERSON.toUpperCase() !== 'C' && TYPEOFPERSON.toUpperCase() !== 'CORPORATE')
            ) {
                errors.push('TYPEOFPERSON does not match PAN details (P for Person, C for Corporate).');
            }
        }
    }

    if (isPurchase && !isPresent(ADHAARCARDNO) && !isPresent(VOTERCARDNO) && !isPresent(DRIVINGLICNO)) {
        errors.push('For PURCHASE, any one ID (Aadhaar, Voter ID, Driving License) is mandatory.');
    }

    if (!isPresent(PAXADDRESS) && !isPresent(BuildingFlatNO)) {
        errors.push('Either BUILDING FLAT NO or PAX ADDRESS is mandatory.');
    }

    if (!isPresent(LOCATION) && !isPresent(CITY)) {
        errors.push('Either LOCATION or CITY is mandatory.');
    }

    if (!isPresent(PINCODE) || !/^\d+$/.test(PINCODE)) {
        errors.push('PINCODE is mandatory and must be numeric.');
    }

    if (!isPresent(STATENAME) || !STATES.includes(STATENAME?.toUpperCase())) {
        errors.push('STATENAME is invalid or missing from valid list.');
    }

    if (!isPresent(COUNTRY) || !COUNTRIES.includes(COUNTRY?.toUpperCase())) {
        errors.push('COUNTRY is invalid or missing from valid list.');
    }

    if (isSale && !isPresent(PNRNO) && !isPresent(TICKETNO)) {
        errors.push('For SALE, either PNR or TICKET NO is mandatory.');
    }

    if (isSale) {
        if (!isPresent(AIRLINENAME) || !AIRLINES.includes(AIRLINENAME?.toUpperCase())) {
            errors.push('AIRLINENAME is mandatory for SALE and must be from valid list.');
        }
        if (!isPresent(DEPARTUREFROM)) errors.push('DEPARTUREFROM is mandatory for SALE.');
        if (!isPresent(DEPARTUREDATE) || !isValidDateFormat(DEPARTUREDATE) || !isFutureOrToday(parseDate(DEPARTUREDATE))) {
            errors.push('DEPARTUREDATE must be today or future date in DD-MMM-YYYY format for SALE.');
        }
        if (!isPresent(TRAVELINGCOUNTRY) || !TRAVEL_COUNTRIES.includes(TRAVELINGCOUNTRY?.toUpperCase())) {
            errors.push('TRAVELINGCOUNTRY is mandatory for SALE and must be from valid list.');
        }
    }

    if (isPurchase) {
        if (!isPresent(ARRIVALDATE) || !isValidDateFormat(ARRIVALDATE) || !isPastOrToday(parseDate(ARRIVALDATE))) {
            errors.push("ARRIVALDATE must be past or today's date in DD-MMM-YYYY format for PURCHASE.");
        }
    }

    if (isPresent(MOBILENO) && !/^\d+$/.test(MOBILENO)) {
        errors.push('MOBILENO must be numeric.');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

interface SubmitToMaraekatIF {
    order: Order;
    extractedData: any;
}

const SubmitToMaraekat: React.FC<SubmitToMaraekatIF> = ({ order, extractedData }) => {
    const [token, setToken] = useState('');
    const [resultMessage, setResultMessage] = useState<ResultMessage | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const makeAuthentication = async () => {
        if (token) return token;
        try {
            // const workflowServiceUrl = import.meta.env.VITE_WORKFLOW_SERVICE_LOCAL || 'http://localhost:6007';
            const workflowServiceUrl = config.workflowService
            const response = await fetch(`${workflowServiceUrl}/api/orient/login`, {
                method: 'POST'
            });
            const data = await response.json();
            setToken(data.Result);
            return data.Result;
        } catch (error) {
            console.error('Authentication Error:', error);
            return '';
        }
    };

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
        AIRLINENAME: extractedData?.travel_itinerary?.airline_name?.value || '',
        DEPARTUREFROM: extractedData?.travel_itinerary?.departure_from?.value || '',
        DEPARTUREDATE: extractedData?.travel_itinerary?.departure_date?.value || '',
        TRAVELINGCOUNTRY: extractedData?.travel_itinerary?.traveling_country?.value || '',
        ARRIVALDATE: extractedData?.travel_itinerary?.arrival_date?.value || '',
        ROUTE: extractedData?.travel_itinerary?.route?.value || ''
    };

    const callExchangeApi = async (eonBookingNo: string, bookingNo: string) => {
        const payload = {
            BRANCHCODE: 'MUM',
            BOOKINGTYPE: 'SALE',
            BOOKINGNO: bookingNo,
            EONBOOKINGNO: eonBookingNo,
            CURRENCY: 'CAD',
            FCNAMOUNT: '1000',
            BOOKINGRATE: '65.6565'
        };
        const workflowServiceUrl = import.meta.env.VITE_WORKFLOW_SERVICE_LOCAL || 'http://localhost:6007';
        const response = await fetch(`${workflowServiceUrl}/api/orient/submit-exchange`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log('Submit Response:', data.Result);
    };

    const submitDataToMaraekat = async (token: string) => {
        try {
            const workflowServiceUrl = import.meta.env.VITE_WORKFLOW_SERVICE_LOCAL || 'http://localhost:6007';
            const response = await fetch(`${workflowServiceUrl}/api/orient/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            console.log('Submit Response:', data.Result);

            if (!data.Result) {
                setResultMessage({ type: 'error', messages: ['API response was null. Submission failed.'] });
                return;
            }

            if (Array.isArray(data.Result)) {
                // Check if it's a success format (has BOOKINGSTATUS) or error format (has APISTATUS === 'FAILED' or ERRORDESC)
                const isSuccess = data.Result.some((item: any) => item.BOOKINGSTATUS);
                if (isSuccess) {
                    const successItem = data.Result.find((item: any) => item.BOOKINGSTATUS);
                    setResultMessage({
                        type: 'success',
                        messages: [`Booking No: ${successItem.BOOKINGNO}`, successItem.BOOKINGSTATUS]
                    });
                    // await callExchangeApi(successItem.BOOKINGNO, payload.BOOKINGNO);
                } else {
                    // Formulate error messages
                    const errors = data.Result.map((item: any) => `${item.ERRORCODE ? `[${item.ERRORCODE}] ` : ''}${item.ERRORDESC || 'Unknown Error'}`);
                    setResultMessage({ type: 'error', messages: errors });
                }
            } else {
                setResultMessage({ type: 'error', messages: ['Unexpected response format.'] });
            }
        } catch (error) {
            console.error('Submit Error:', error);
            setResultMessage({ type: 'error', messages: ['Network or server error occurred while submitting.'] });
        }
    };

    const handleSubmit = async () => {
        setResultMessage(null);
        // const validationResult = validatePayload(payload);
        // if (!validationResult.isValid) {
        //     setResultMessage({
        //         type: 'error',
        //         messages: validationResult.errors
        //     });
        //     return;
        // }
        setIsSubmitting(true);
        try {
            const token = await makeAuthentication();
            if (!token) {
                setResultMessage({ type: 'error', messages: ['Authentication failed'] });
                return;
            }
            await submitDataToMaraekat(token);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="relative">
            {resultMessage && <DraggableResultCard result={resultMessage} onClose={() => setResultMessage(null)} />}
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 rounded-md border border-gray-400 bg-white px-3 py-1 text-base font-light text-gray-500 transition-all duration-200 ease-in-out hover:border-blue-500 hover:bg-blue-400 hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
            >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                Submit
            </button>
        </div>
    );
};

export default SubmitToMaraekat;
