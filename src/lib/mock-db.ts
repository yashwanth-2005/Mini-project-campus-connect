
export type User = {
    id: string;
    fullName: string;
    email: string;
    password?: string;
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

const defaultUsers: Record<string, User> = {
    'user-faculty-1': {
        id: 'user-faculty-1',
        fullName: 'Suraj Rao',
        email: 'surajrao081005@gmail.com',
        password: 'q1w2e3r4t5',
        usn: 'FAC001',
        year: 0,
        semester: 0,
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
        password: 'password123',
        usn: '1CR21CS001',
        year: 3,
        semester: 6,
        linkedin: 'https://www.linkedin.com/in/alex-doe',
        leetcode: 'https://leetcode.com/alexdoe',
        bio: 'Aspiring Software Engineer, passionate about open-source and web development.',
        github: 'https://github.com/alexdoe',
        profilePicture: 'https://picsum.photos/seed/student1/200/200'
    }
}

// Safely gets users from localStorage.
const getUsers = (): Record<string, User> => {
    if (typeof window === 'undefined') return defaultUsers;
    let usersJson = localStorage.getItem('users');
    if (!usersJson) {
        saveUsers(defaultUsers);
        usersJson = JSON.stringify(defaultUsers);
    }
    return JSON.parse(usersJson);
};

// Safely saves users to localStorage.
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

// Retrieves the currently logged-in user's data.
export const getCurrentUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    const currentUserId = localStorage.getItem('currentUser');
    if (!currentUserId) return null;
    const users = getUsers();
    return users[currentUserId] || null;
}

// Sets the currently logged-in user.
export const setCurrentUser = (userId: string | null) => {
    if (typeof window === 'undefined') return;
    if (userId) {
        localStorage.setItem('currentUser', userId);
    } else {
        localStorage.removeItem('currentUser');
    }
}

// Finds a user by their email address.
export const findUserByEmail = (email: string): User | null => {
    const users = getUsers();
    return Object.values(users).find(user => user.email === email) || null;
};

// A helper function to get the default faculty user for prototype login.
export const getFacultyUser = (): User | null => {
    const users = getUsers();
    return users['user-faculty-1'] || null;
}


// Creates a new user.
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

// Updates an existing user's data.
export const updateUser = (userId: string, updatedData: Partial<User>): User | null => {
    const users = getUsers();
    if (!users[userId]) return null;

    users[userId] = {
        ...users[userId],
        ...updatedData,
    };

    saveUsers(users);
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        setCurrentUser(userId); 
    }
    
    return users[userId];
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

// Approves a USN change request.
export const approveUsnChange = (requestId: string) => {
    let requests = getRequests();
    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error("Request not found.");

    const request = requests[requestIndex];
    if (request.status !== 'pending') throw new Error("This request has already been actioned.");
    
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
    if (request.status !== 'pending') throw new Error("This request has already been actioned.");

    requests[requestIndex].status = 'denied';
    saveRequests(requests);
};
