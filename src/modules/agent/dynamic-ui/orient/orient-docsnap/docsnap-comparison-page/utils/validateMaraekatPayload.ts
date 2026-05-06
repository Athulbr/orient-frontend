export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

const isEmpty = (value: string | undefined | null): boolean => {
    return !value || value.trim() === '';
};

export const validateMaraekatPayload = (payload: Record<string, string>): ValidationResult => {
    const errors: string[] = [];

    // if()

    // 1. DOB must be more than 12 years and less than 100 years
    if (!isEmpty(payload.DOB)) {
        const parsedDob = new Date(payload.DOB);
        if (!isNaN(parsedDob.getTime())) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // normalize to start of day

            const twelveYearsAgo = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());
            const hundredYearsAgo = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());

            if (parsedDob > today) {
                errors.push('Date of Birth cannot be a future date.');
            } else if (parsedDob > twelveYearsAgo) {
                errors.push('Date of Birth is invalid, must be more than 12 years old.');
            } else if (parsedDob < hundredYearsAgo) {
                errors.push('Date of Birth is invalid, must be less than 120 years old.');
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

    return {
        isValid: errors.length === 0,
        errors
    };
};
