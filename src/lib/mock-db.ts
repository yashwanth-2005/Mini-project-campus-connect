
// This file contains mock data and functions for prototyping purposes.
// In a real application, this would be replaced by a proper database like Firestore.
export type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'student' | 'faculty';
    // Student specific
    usn?: string;
    year?: number;
    semester?: number;
    course?: string;
    branch?: string;
    // Faculty specific
    department?: string;
    facultyId?: string;
    uniqueCode?: string;
    // Optional social links
    linkedinUrl?: string;
    leetcodeUrl?: string;
    githubUrl?: string;
    profilePictureUrl?: string;
};

// Represents a request to change a University Seat Number (USN).
export type UsnChangeRequest = {
    id: string;
    userId: string;
    studentName: string;
    currentUsn: string;
    newUsn: string;
    reason: string;
    status: 'pending' | 'approved' | 'denied';
    requestedAt: string;
}

// Safely gets data from localStorage, handling server-side rendering.
const getFromStorage = <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    const item = localStorage.getItem(key);
    if (!item) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
    }
    try {
        return JSON.parse(item) as T;
    } catch (e) {
        console.error(`Failed to parse ${key} from localStorage`, e);
        return defaultValue;
    }
}

// Safely saves data to localStorage.
const saveToStorage = <T>(key: string, value: T) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
}

// --- USN Change Requests ---

export const createUsnChangeRequest = (requestData: Omit<UsnChangeRequest, 'id' | 'status' | 'requestedAt'>) => {
    let requests = getFromStorage<UsnChangeRequest[]>('usnChangeRequests', []);
    const existingRequest = requests.find(r => r.userId === requestData.userId && r.status === 'pending');
    if (existingRequest) {
        throw new Error("You already have a pending USN change request.");
    }

    const newRequest: UsnChangeRequest = {
        id: `req_${Date.now()}`,
        ...requestData,
        status: 'pending',
        requestedAt: new Date().toISOString(),
    };
    requests.push(newRequest);
    saveToStorage('usnChangeRequests', requests);
    return newRequest;
};

export const getPendingUsnRequests = (): UsnChangeRequest[] => {
    const requests = getFromStorage<UsnChangeRequest[]>('usnChangeRequests', []);
    return requests.filter(req => req.status === 'pending').sort((a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime());
};

export const approveUsnChange = (requestId: string) => {
    let requests = getFromStorage<UsnChangeRequest[]>('usnChangeRequests', []);
    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error("Request not found.");

    const request = requests[requestIndex];
    if (request.status !== 'pending') throw new Error("This request has already been processed.");
    
    // In a mock environment, we directly update the user's USN.
    // In a real app, this logic might be in a cloud function.
    let users = getFromStorage<Record<string, UserProfile>>('userProfiles', {});
    if (users[request.userId]) {
        users[request.userId].usn = request.newUsn;
        saveToStorage('userProfiles', users);
    } else {
        throw new Error("User associated with this request not found.");
    }

    requests[requestIndex].status = 'approved';
    saveToStorage('usnChangeRequests', requests);
};

export const denyUsnChange = (requestId: string) => {
    let requests = getFromStorage<UsnChangeRequest[]>('usnChangeRequests', []);
    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error("Request not found.");

    const request = requests[requestIndex];
    if (request.status !== 'pending') throw new Error("This request has already been processed.");

    requests[requestIndex].status = 'denied';
    saveToStorage('usnChangeRequests', requests);
};

    