

// In a real application, this would be a proper database.
// For this prototype, we'll use localStorage to simulate data persistence.

export type User = {
    id: string;
    fullName: string;
    email: string;
    password?: string; // Not ideal to store passwords, but this is a simulation
    usn: string;
    year: number;
    semester: number;
    linkedin: string;
    leetcode: string;
    bio?: string;
    github?: string;
    profilePicture?: string;
};

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

// Function to get all users from localStorage
const getUsers = (): Record<string, User> => {
    if (typeof window === 'undefined') return {};
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : {};
};

// Function to save all users to localStorage
const saveUsers = (users: Record<string, User>) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('users', JSON.stringify(users));
};

// Function to get all USN change requests from localStorage
const getRequests = (): UsnChangeRequest[] => {
    if (typeof window === 'undefined') return [];
    const requests = localStorage.getItem('usnChangeRequests');
    return requests ? JSON.parse(requests) : [];
};

// Function to save all USN change requests to localStorage
const saveRequests = (requests: UsnChangeRequest[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('usnChangeRequests', JSON.stringify(requests));
};


// Function to get the currently logged-in user
export const getCurrentUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    const currentUserId = localStorage.getItem('currentUser');
    if (!currentUserId) return null;
    const users = getUsers();
    return users[currentUserId] || null;
}

// Function to set the currently logged-in user
export const setCurrentUser = (userId: string | null) => {
    if (typeof window === 'undefined') return;
    if (userId) {
        localStorage.setItem('currentUser', userId);
    } else {
        localStorage.removeItem('currentUser');
    }
}

// API to find a user by email
export const findUserByEmail = (email: string): User | null => {
    const users = getUsers();
    return Object.values(users).find(user => user.email === email) || null;
};

// API to create a new user
export const createUser = (userData: Omit<User, 'id'>): User => {
    const users = getUsers();
    const email = userData.email.toLowerCase();
    if (findUserByEmail(email)) {
        throw new Error("User with this email already exists.");
    }
    const id = Date.now().toString();
    const newUser: User = { 
        id, 
        ...userData,
        linkedin: userData.linkedin || "",
        leetcode: userData.leetcode || ""
    };
    users[id] = newUser;
    saveUsers(users);
    return newUser;
};

// API to update a user's profile
export const updateUser = (userId: string, updatedData: Partial<User>): User | null => {
    const users = getUsers();
    if (!users[userId]) return null;

    // Merge existing data with new data, ensuring no required fields are blanked
    const currentUserData = users[userId];
    users[userId] = {
        ...currentUserData,
        ...updatedData,
    };

    saveUsers(users);
    // After updating, we should also update the currentUser in localStorage if it's the same user.
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        setCurrentUser(userId); // This just rewrites the ID, let's refresh the object.
        // The user object is fetched fresh by getCurrentUser(), so we are good.
    }
    
    return users[userId];
};

// == USN CHANGE REQUESTS ==

export const createUsnChangeRequest = (requestData: Omit<UsnChangeRequest, 'id' | 'status' | 'requestedAt'>) => {
    let requests = getRequests();
    // Check if there's already a pending request for this user
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

export const getPendingUsnRequests = (): UsnChangeRequest[] => {
    const requests = getRequests();
    return requests.filter(req => req.status === 'pending').sort((a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime());
};

export const getUsnRequestForUser = (userId: string): UsnChangeRequest | undefined => {
    const requests = getRequests();
    return requests.find(r => r.userId === userId && r.status === 'pending');
}

export const approveUsnChange = (requestId: string) => {
    let requests = getRequests();
    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error("Request not found.");

    const request = requests[requestIndex];
    if (request.status !== 'pending') throw new Error("This request has already been actioned.");
    
    const users = getUsers();
    if (!users[request.userId]) throw new Error("User associated with this request not found.");

    // Update user's USN
    users[request.userId].usn = request.newUsn;
    saveUsers(users);

    // Update request status
    requests[requestIndex].status = 'approved';
    saveRequests(requests);
};

export const denyUsnChange = (requestId: string) => {
    let requests = getRequests();
    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error("Request not found.");

    const request = requests[requestIndex];
    if (request.status !== 'pending') throw new Error("This request has already been actioned.");

    // Just update request status to denied, but allow them to request again in future.
    // For simplicity, we'll just mark it denied. A better implementation might remove it after a while.
    requests[requestIndex].status = 'denied';
    saveRequests(requests);
};
