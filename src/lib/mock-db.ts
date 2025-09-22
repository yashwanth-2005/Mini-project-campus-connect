

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
