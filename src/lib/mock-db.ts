
// This file contains mock data and functions for prototyping purposes.
// In a real application, this would be replaced by a proper database like Firestore.
export type User = {
    id: string;
    fullName: string;
    email: string;
    usn: string;
    year: number;
    semester: number;
    course: string;
    linkedin: string;
    leetcode: string;
    bio?: string;
    github?: string;
    profilePicture?: string;
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

// Our mock database, stored in the browser's localStorage for data persistence across refreshes.
const defaultUsers: Record<string, User> = {
    'user-faculty-1': {
        id: 'user-faculty-1',
        fullName: 'Suraj Rao',
        email: 'surajrao081005@gmail.com',
        usn: 'FAC001',
        year: 0,
        semester: 0,
        course: 'Faculty',
        linkedin: '',
        leetcode: '',
        bio: 'Faculty member in the Computer Science department.',
        github: '',
        profilePicture: 'https://picsum.photos/seed/faculty1/200/200'
    },
    'user-student-1': {
        id: 'user-student-1',
        fullName: 'Alex Doe',
        email: 'alex.doe@example.com',
        usn: '1CR21CS001',
        year: 3,
        semester: 6,
        course: 'btech',
        linkedin: 'https://www.linkedin.com/in/alex-doe',
        leetcode: 'https://leetcode.com/alexdoe',
        bio: 'Aspiring Software Engineer, passionate about open-source and web development.',
        github: 'https://github.com/alexdoe',
        profilePicture: 'https://picsum.photos/seed/student1/200/200'
    }
}

// Safely gets user profiles from localStorage, handling server-side rendering.
const getUsers = (): Record<string, User> => {
    if (typeof window === 'undefined') return defaultUsers;
    let usersJson = localStorage.getItem('users');
    if (!usersJson) {
        saveUsers(defaultUsers);
        usersJson = JSON.stringify(defaultUsers);
    }
    return JSON.parse(usersJson);
};

// Safely saves user profiles to localStorage.
const saveUsers = (users: Record<string, User>) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('users', JSON.stringify(users));
};

// Safely gets USN change requests from localStorage.
const getRequests = (): UsnChangeRequest[] => {
    if (typeof window === 'undefined') return [];
    const requests = localStorage.getItem('usnChangeRequests');
    return requests ? JSON.parse(requests) : [];
};

// Safely saves USN change requests to localStorage.
const saveRequests = (requests: UsnChangeRequest[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('usnChangeRequests', JSON.stringify(requests));
};

// Finds a user profile by their email address.
export const findUserByEmail = (email: string): User | null => {
    const users = getUsers();
    return Object.values(users).find(user => user.email === email) || null;
};

// Creates a new request for a USN change.
export const createUsnChangeRequest = (requestData: Omit<UsnChangeRequest, 'id' | 'status' | 'requestedAt'>) => {
    let requests = getRequests();
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
    saveRequests(requests);
    return newRequest;
};

// Retrieves all pending USN change requests.
export const getPendingUsnRequests = (): UsnChangeRequest[] => {
    const requests = getRequests();
    return requests.filter(req => req.status === 'pending').sort((a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime());
};

// Gets the pending USN request for a specific user.
export const getUsnRequestForUser = (userId: string): UsnChangeRequest | undefined => {
    const requests = getRequests();
    return requests.find(r => r.userId === userId && r.status === 'pending');
}

// Approves a USN change request and updates the user's profile.
export const approveUsnChange = (requestId: string) => {
    let requests = getRequests();
    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error("Request not found.");

    const request = requests[requestIndex];
    if (request.status !== 'pending') throw new Error("This request has already been processed.");
    
    const users = getUsers();
    if (!users[request.userId]) throw new Error("User associated with this request not found.");

    users[request.userId].usn = request.newUsn;
    saveUsers(users);

    requests[requestIndex].status = 'approved';
    saveRequests(requests);
};

// Denies a USN change request.
export const denyUsnChange = (requestId: string) => {
    let requests = getRequests();
    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error("Request not found.");

    const request = requests[requestIndex];
    if (request.status !== 'pending') throw new Error("This request has already been processed.");

    requests[requestIndex].status = 'denied';
    saveRequests(requests);
};
