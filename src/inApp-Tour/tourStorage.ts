// Helper functions for tour storage management

interface TourState {
    productTourShown?: boolean;
    templateCreationTourShown?: boolean;
    templateListTourShown?: boolean;
    recordListTourShown?: boolean;
    reviewButtonTourShown?: boolean;
    recordViewTourShown?: boolean;
}

interface AllUserTours {
    [userId: string]: TourState;
}

const STORAGE_KEY = 'userTour';

// Get user ID from sessionStorage
const getUserId = (): string => {
    const userStr = window.sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return user?._id || user?.id || user?.email || 'guest';
};

// Get all users' tour data
const getAllUserTours = (): AllUserTours => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
};

// Save all users' tour data
const saveAllUserTours = (data: AllUserTours): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Get all tour states for current user
export const getTourStates = (): TourState => {
    const userId = getUserId();
    const allTours = getAllUserTours();
    return allTours[userId] || {};
};

// Get specific tour state
export const getTourState = (tourName: keyof TourState): boolean => {
    const states = getTourStates();
    return states[tourName] === true;
};

// Set specific tour state
export const setTourState = (tourName: keyof TourState, value: boolean): void => {
    const userId = getUserId();
    const allTours = getAllUserTours();
    
    if (!allTours[userId]) {
        allTours[userId] = {};
    }
    
    allTours[userId][tourName] = value;
    saveAllUserTours(allTours);
};

// Reset specific tour
export const resetTourState = (tourName: keyof TourState): void => {
    const userId = getUserId();
    const allTours = getAllUserTours();
    
    if (allTours[userId]) {
        delete allTours[userId][tourName];
        saveAllUserTours(allTours);
    }
};

// Reset all tours for current user
export const resetAllTours = (): void => {
    const userId = getUserId();
    const allTours = getAllUserTours();
    
    delete allTours[userId];
    saveAllUserTours(allTours);
};

// Mark all tours as complete for current user
export const setAllToursComplete = (): void => {
    const userId = getUserId();
    const allTours = getAllUserTours();
    
    allTours[userId] = {
        productTourShown: true,
        templateCreationTourShown: true,
        templateListTourShown: true,
        recordListTourShown: true,
        reviewButtonTourShown: true,
        recordViewTourShown: true
    };
    
    saveAllUserTours(allTours);
};

// Check if user is logged in
export const isUserLoggedIn = (): boolean => {
    return getUserId() !== 'guest';
};
