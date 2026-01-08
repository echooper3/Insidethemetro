
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, EventRecommendation, Feedback, Task, TaskPriority } from '../types';

interface LoginResult {
  success: boolean;
  status: 'success' | 'invalid_credentials' | 'password_expired';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => LoginResult;
  signup: (userData: Omit<User, 'id'>) => void;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;
  changePassword: (newPassword: string) => void;
  validatePassword: (password: string) => { isValid: boolean; errors: string[] };
  isAuthenticated: boolean;
  savedEvents: EventRecommendation[];
  toggleSaveEvent: (event: EventRecommendation) => void;
  isEventSaved: (event: EventRecommendation) => boolean;
  interestedEvents: EventRecommendation[];
  toggleInterestEvent: (event: EventRecommendation) => void;
  isEventInterested: (event: EventRecommendation) => boolean;
  recentlyViewed: EventRecommendation[];
  addToRecentlyViewed: (event: EventRecommendation) => void;
  submitFeedback: (data: { type: string, message: string }) => void;
  createEvent: (eventData: Partial<EventRecommendation>) => void;
  // CRM Data
  allUsers: User[];
  allFeedback: Feedback[];
  pendingEvents: EventRecommendation[];
  approvedEvents: EventRecommendation[];
  rejectedEvents: EventRecommendation[];
  approveEvent: (event: EventRecommendation) => void;
  rejectEvent: (event: EventRecommendation) => void;
  // Task Management
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'completed'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PASSWORD_EXPIRY_DAYS = 90;

// Helper for safe JSON parsing to prevent Script Errors
const safeParse = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error parsing ${key} from localStorage, using fallback.`, e);
    return fallback;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [savedEvents, setSavedEvents] = useState<EventRecommendation[]>([]);
  const [interestedEvents, setInterestedEvents] = useState<EventRecommendation[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<EventRecommendation[]>([]);
  
  // CRM State
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);
  const [pendingEvents, setPendingEvents] = useState<EventRecommendation[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<EventRecommendation[]>([]);
  const [rejectedEvents, setRejectedEvents] = useState<EventRecommendation[]>([]);

  // Task State
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load user on mount
  useEffect(() => {
    const storedUser = safeParse<User | null>('in_my_city_user', null);
    if (storedUser) {
      setUser(storedUser);
    }
    
    // Load CRM Data (Mock DB)
    refreshCRMData();

    // Request Notification Permission
    if ("Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  }, []);

  const refreshCRMData = () => {
    // 1. Users
    const storedUser = safeParse<User | null>('in_my_city_user', null);
    const mockUsers: User[] = [
        { 
          id: 'u1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '555-0101', birthday: '1990-01-01', ethnicity: 'Hispanic', address: 'Houston, TX', accountType: 'Member',
          lastPasswordChange: new Date().toISOString() // Fresh password
        },
        { 
          id: 'u2', 
          firstName: 'Sarah', 
          lastName: 'Smith', 
          businessName: 'Sarah Events LLC',
          email: 'sarah@events.com', 
          phone: '555-0102', 
          birthday: '1985-05-05', 
          ethnicity: 'Caucasian', 
          address: 'Katy, TX', 
          accountType: 'Organizer',
          logoUrl: 'https://ui-avatars.com/api/?name=Sarah+Events&background=ea580c&color=fff&size=200',
          profileVideoUrl: '',
          bio: 'Creating memorable experiences in Houston for over 10 years.',
          website: 'https://sarahevents.com',
          lastPasswordChange: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString() // Expired (100 days ago) for testing
        },
    ];
    if (storedUser) {
        if (!mockUsers.some(u => u.email === storedUser.email)) {
            mockUsers.push(storedUser);
        }
    }
    setAllUsers(mockUsers);

    // 2. Feedback
    const storedFeedback = safeParse<Feedback[]>('in_my_city_feedback', []);
    setAllFeedback(storedFeedback);

    // 3. Pending Events
    const storedPending = safeParse<EventRecommendation[]>('in_my_city_pending_events', []);
    setPendingEvents(storedPending);

    // 4. Approved Events
    const storedApproved = safeParse<EventRecommendation[]>('in_my_city_approved_events', []);
    setApprovedEvents(storedApproved);

    // 5. Rejected Events
    const storedRejected = safeParse<EventRecommendation[]>('in_my_city_rejected_events', []);
    setRejectedEvents(storedRejected);
  };

  // Load saved, interested events, and TASKS when user changes
  useEffect(() => {
    if (user) {
      // Saved Events with Expiration Logic
      const storedEvents = safeParse<EventRecommendation[]>(`in_my_city_saved_${user.id}`, []);
      const now = new Date();
      now.setHours(0,0,0,0); // Set to start of today
      
      const validSavedEvents = storedEvents.filter(event => {
          if (!event.date) return true;
          // Try to parse the date string
          const evtDate = new Date(event.date);
          
          // If date is valid, check if it is in the past
          // isNaN check handles strings like "Daily", "This Weekend" which we keep
          if (!isNaN(evtDate.getTime())) {
              // Only expire if the date is strictly before today
              return evtDate >= now;
          }
          return true; // Keep events with descriptive dates
      });
      
      // Update local storage if events were filtered out
      if (validSavedEvents.length !== storedEvents.length) {
          localStorage.setItem(`in_my_city_saved_${user.id}`, JSON.stringify(validSavedEvents));
      }
      setSavedEvents(validSavedEvents);

      const storedInterested = safeParse<EventRecommendation[]>(`in_my_city_interested_${user.id}`, []);
      setInterestedEvents(storedInterested);

      const storedTasks = safeParse<Task[]>(`in_my_city_tasks_${user.id}`, []);
      setTasks(storedTasks);
    } else {
      setSavedEvents([]);
      setInterestedEvents([]);
      setTasks([]);
    }
  }, [user]);

  // Load recently viewed events on mount
  useEffect(() => {
    const storedRecent = safeParse<EventRecommendation[]>('in_my_city_recent', []);
    setRecentlyViewed(storedRecent);
  }, []);

  // --- TASK REMINDER SYSTEM ---
  useEffect(() => {
    if (!user || tasks.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      
      const updatedTasks = tasks.map(task => {
        // Skip if completed or already reminded
        if (task.completed || task.reminderSent || !task.dueDate) return task;

        const due = new Date(task.dueDate);
        const timeDiff = due.getTime() - now.getTime();
        
        // Notify if due within 24 hours and hasn't passed more than 1 hour ago
        // (Also notify if due in past but not acknowledged)
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        
        if (timeDiff < ONE_DAY_MS && timeDiff > -3600000) {
           if (Notification.permission === "granted") {
             new Notification(`Upcoming Task: ${task.title}`, {
               body: `Due ${due.toLocaleDateString()} at ${due.toLocaleTimeString()}`,
               icon: '/favicon.ico'
             });
           }
           return { ...task, reminderSent: true };
        }
        return task;
      });

      // If changes, update state and localstorage
      if (JSON.stringify(updatedTasks) !== JSON.stringify(tasks)) {
         setTasks(updatedTasks);
         localStorage.setItem(`in_my_city_tasks_${user.id}`, JSON.stringify(updatedTasks));
      }
    };

    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    // Initial check
    checkReminders();

    return () => clearInterval(interval);
  }, [tasks, user]);


  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("One number");
    if (!/[\W_]/.test(password)) errors.push("One special character (!@#$%)");
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const login = (email: string, password?: string): LoginResult => {
    // Admin Login Check
    if (email === 'admin@inmycity.com') {
        if (password === 'admin123') {
            const adminUser: User = {
                id: 'admin_001',
                firstName: 'Super',
                lastName: 'Admin',
                email: 'admin@inmycity.com',
                phone: '000-000-0000',
                birthday: '2000-01-01',
                ethnicity: 'N/A',
                address: 'HQ',
                accountType: 'Admin',
                lastPasswordChange: new Date().toISOString()
            };
            setUser(adminUser);
            localStorage.setItem('in_my_city_user', JSON.stringify(adminUser));
            return { success: true, status: 'success' };
        } else {
            return { success: false, status: 'invalid_credentials' };
        }
    }

    const storedUser = safeParse<User | null>('in_my_city_user', null);
    const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || storedUser;

    if (foundUser && foundUser.email.toLowerCase() === email.toLowerCase()) {
        if (foundUser.lastPasswordChange) {
            const lastChange = new Date(foundUser.lastPasswordChange);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - lastChange.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > PASSWORD_EXPIRY_DAYS) {
                return { success: false, status: 'password_expired' };
            }
        } else {
            return { success: false, status: 'password_expired' };
        }

        setUser(foundUser);
        localStorage.setItem('in_my_city_user', JSON.stringify(foundUser));
        return { success: true, status: 'success' };
    }
    return { success: false, status: 'invalid_credentials' };
  };

  const signup = (userData: Omit<User, 'id'>) => {
    const newUser: User = { 
        ...userData, 
        id: userData.email.replace(/[^a-zA-Z0-9]/g, ''),
        lastPasswordChange: new Date().toISOString()
    };
    setUser(newUser);
    localStorage.setItem('in_my_city_user', JSON.stringify(newUser));
    setAllUsers(prev => [...prev, newUser]);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('in_my_city_user');
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('in_my_city_user', JSON.stringify(updatedUser));
    refreshCRMData();
  };

  const changePassword = (newPassword: string) => {
      if (!user) return;
      const validation = validatePassword(newPassword);
      if (!validation.isValid) throw new Error(validation.errors[0]);

      const updatedUser = { ...user, lastPasswordChange: new Date().toISOString() };
      setUser(updatedUser);
      localStorage.setItem('in_my_city_user', JSON.stringify(updatedUser));
      refreshCRMData();
  };

  const toggleSaveEvent = (event: EventRecommendation) => {
    if (!user) return;
    setSavedEvents(prev => {
      const exists = prev.some(e => e.name === event.name && e.location.address === event.location.address);
      const newEvents = exists 
        ? prev.filter(e => !(e.name === event.name && e.location.address === event.location.address))
        : [...prev, event];
      localStorage.setItem(`in_my_city_saved_${user.id}`, JSON.stringify(newEvents));
      return newEvents;
    });
  };

  const isEventSaved = (event: EventRecommendation) => {
    return savedEvents.some(e => e.name === event.name && e.location.address === event.location.address);
  };

  const toggleInterestEvent = (event: EventRecommendation) => {
    if (!user) return;
    setInterestedEvents(prev => {
      const exists = prev.some(e => e.name === event.name && e.location.address === event.location.address);
      const newEvents = exists 
        ? prev.filter(e => !(e.name === event.name && e.location.address === event.location.address))
        : [...prev, event];
      localStorage.setItem(`in_my_city_interested_${user.id}`, JSON.stringify(newEvents));
      return newEvents;
    });
  };

  const isEventInterested = (event: EventRecommendation) => {
    return interestedEvents.some(e => e.name === event.name && e.location.address === event.location.address);
  };

  const addToRecentlyViewed = (event: EventRecommendation) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(e => !(e.name === event.name && e.location.address === event.location.address));
      const updated = [event, ...filtered].slice(0, 10);
      localStorage.setItem('in_my_city_recent', JSON.stringify(updated));
      return updated;
    });
  };

  const submitFeedback = (data: { type: string, message: string }) => {
    const feedback: Feedback = {
      id: Date.now().toString(),
      userId: user?.id,
      userEmail: user?.email || 'Anonymous',
      type: data.type,
      message: data.message,
      timestamp: new Date().toISOString()
    };
    const existingFeedback = safeParse<Feedback[]>('in_my_city_feedback', []);
    const updatedFeedback = [feedback, ...existingFeedback];
    localStorage.setItem('in_my_city_feedback', JSON.stringify(updatedFeedback));
    setAllFeedback(updatedFeedback);
  };

  const createEvent = (eventData: Partial<EventRecommendation>) => {
    if (!user) return;
    let finalImageUrl = eventData.imageUrl;
    let finalVideoUrl = eventData.videoUrl;

    if (!finalImageUrl && user.logoUrl) finalImageUrl = user.logoUrl;
    if (!finalVideoUrl && user.profileVideoUrl) finalVideoUrl = user.profileVideoUrl;

    const organizerName = user.businessName || `${user.firstName} ${user.lastName}`;

    // Ensure status is strictly 'pending'
    const newEvent: EventRecommendation = {
        name: eventData.name || 'Untitled Event',
        description: eventData.description || '',
        category: eventData.category || 'Community',
        date: eventData.date || 'TBD',
        price: eventData.price || 'Free',
        priceLevel: eventData.priceLevel || 'Free',
        location: eventData.location || { address: 'TBD', latitude: 0, longitude: 0 },
        imageUrl: finalImageUrl,
        videoUrl: finalVideoUrl,
        website: eventData.website,
        id: Date.now().toString(),
        status: 'pending', // Explicitly pending
        eventStatus: eventData.eventStatus || 'Scheduled',
        visibility: eventData.visibility || 'Public',
        createdBy: user.id,
        isSponsored: false,
        organizer: {
            name: organizerName,
            contact: user.email,
            website: user.website,
            logoUrl: user.logoUrl,
            videoUrl: user.profileVideoUrl
        }
    };

    const storedPending = safeParse<EventRecommendation[]>('in_my_city_pending_events', []);
    const updatedPending = [...storedPending, newEvent];
    localStorage.setItem('in_my_city_pending_events', JSON.stringify(updatedPending));
    setPendingEvents(updatedPending);
    
    // Explicitly do NOT add to approved events here.
    alert("Event submitted successfully! It is pending approval from an admin.");
  };

  const approveEvent = (event: EventRecommendation) => {
    const newPending = pendingEvents.filter(e => e.id !== event.id);
    localStorage.setItem('in_my_city_pending_events', JSON.stringify(newPending));
    setPendingEvents(newPending);

    const approvedEvent = { ...event, status: 'approved' as const };
    const newApproved = [...approvedEvents, approvedEvent];
    localStorage.setItem('in_my_city_approved_events', JSON.stringify(newApproved));
    setApprovedEvents(newApproved);
  };

  const rejectEvent = (event: EventRecommendation) => {
    const newPending = pendingEvents.filter(e => e.id !== event.id);
    localStorage.setItem('in_my_city_pending_events', JSON.stringify(newPending));
    setPendingEvents(newPending);

    const rejectedEvent = { ...event, status: 'rejected' as const };
    const newRejected = [...rejectedEvents, rejectedEvent];
    localStorage.setItem('in_my_city_rejected_events', JSON.stringify(newRejected));
    setRejectedEvents(newRejected);
  };

  // --- TASK ACTIONS ---
  const addTask = (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'completed'>) => {
    if (!user) return;
    const newTask: Task = {
      id: Date.now().toString(),
      userId: user.id,
      completed: false,
      createdAt: new Date().toISOString(),
      ...taskData
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem(`in_my_city_tasks_${user.id}`, JSON.stringify(updatedTasks));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    if (!user) return;
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    setTasks(updatedTasks);
    localStorage.setItem(`in_my_city_tasks_${user.id}`, JSON.stringify(updatedTasks));
  };

  const deleteTask = (taskId: string) => {
    if (!user) return;
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    localStorage.setItem(`in_my_city_tasks_${user.id}`, JSON.stringify(updatedTasks));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup,
      logout, 
      updateUserProfile,
      changePassword,
      validatePassword,
      isAuthenticated: !!user,
      savedEvents,
      toggleSaveEvent,
      isEventSaved,
      interestedEvents,
      toggleInterestEvent,
      isEventInterested,
      recentlyViewed,
      addToRecentlyViewed,
      submitFeedback,
      createEvent,
      allUsers,
      allFeedback,
      pendingEvents,
      approvedEvents,
      rejectedEvents,
      approveEvent,
      rejectEvent,
      tasks,
      addTask,
      updateTask,
      deleteTask
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
