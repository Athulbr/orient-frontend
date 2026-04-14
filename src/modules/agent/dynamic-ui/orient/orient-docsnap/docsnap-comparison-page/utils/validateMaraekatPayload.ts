export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

const isEmpty = (value: string | undefined | null): boolean => {
    return !value || value.trim() === '';
};

export const validateMaraekatPayload = (payload: Record<string, string>): ValidationResult => {
    const errors: string[] = [];

    // 1. DOB must be more than 12 years
    if (!isEmpty(payload.DOB)) {
        const parsedDob = new Date(payload.DOB);
        if (!isNaN(parsedDob.getTime())) {
            const today = new Date();
            const twelveYearsAgo = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());
            if (parsedDob > twelveYearsAgo) {
                errors.push('Date of Birth must be more than 12 years ago.');
            }
        } else {
            errors.push('Date of Birth is invalid.');
        }
    } else {
        errors.push('Date of Birth is required.');
    }

    // 2. Either BUILDING FLAT NO. or PAX ADDRESS is mandatory
    if (isEmpty(payload.BuildingFlatNO) && isEmpty(payload.PAXADDRESS)) {
        errors.push('Either Building/Flat No. or Pax Address is mandatory.');
    }

    // 3. Either LOCATION or CITY is mandatory
    if (isEmpty(payload.LOCATION) && isEmpty(payload.CITY)) {
        errors.push('Either Location or City is mandatory.');
    }

    // 4. If booking type is "SALE" then PNR NUMBER or TICKET NO. is mandatory
    if (payload.BOOKINGTYPE === 'SALE') {
        if (isEmpty(payload.PNRNO) && isEmpty(payload.TICKETNO)) {
            errors.push('For Sale booking, either PNR Number or Ticket No. is mandatory.');
        }
    }

    // 5. If booking type is "PURCHASE" then VOTERCARDNO or ADHAARCARDNO or DRIVINGLICNO is required
    if (payload.BOOKINGTYPE === 'PURCHASE') {
        if (isEmpty(payload.VOTERCARDNO) && isEmpty(payload.ADHAARCARDNO) && isEmpty(payload.DRIVINGLICNO)) {
            errors.push('For Purchase booking, either Voter Card No., Aadhaar Card No., or Driving Licence No. is required.');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};