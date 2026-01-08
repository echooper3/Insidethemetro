
import { LucideIcon } from 'lucide-react';

export interface City {
  id: string;
  name: string;
  state: string;
  image: string;
  coordinates: [number, number]; // [lat, lng]
}

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  promptTerm: string;
}

export type AccountType = 'Member' | 'Organizer' | 'Business' | 'Admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  email: string;
  phone: string;
  birthday: string;
  ethnicity: string;
  address: string;
  bio?: string;
  website?: string;
  accountType: AccountType;
  logoUrl?: string;
  profileVideoUrl?: string;
  lastPasswordChange?: string; // ISO Date string
}

export interface SearchFilters {
  query: string;
  startDate: string;
  endDate: string;
  price: string;
  category: string | null;
}

export interface EventRecommendation {
  id?: string;
  cityId?: string; // Added for strict city-specific filtering
  name: string;
  description: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  priceLevel: string; // Free, $, $$, $$$
  price: string; // Specific amount or range e.g., "$15 - $25"
  date?: string;
  category: string;
  tags?: string[]; // New field for descriptive tags
  imageUrl?: string;
  videoUrl?: string; // URL for mp4 or webm video
  website?: string;
  isSponsored?: boolean;
  ageRestriction?: string;
  organizer?: {
    name: string;
    website?: string;
    contact?: string;
    logoUrl?: string;
    videoUrl?: string;
  };
  status?: 'pending' | 'approved' | 'rejected'; // Admin approval status
  eventStatus?: 'Scheduled' | 'Cancelled' | 'Postponed'; // Lifecycle status
  visibility?: 'Public' | 'Private'; // Visibility setting
  createdBy?: string;
}

export interface Feedback {
  id: string;
  userId?: string;
  userEmail?: string;
  type: string;
  message: string;
  timestamp: string;
}

// Deprecated: kept for Planner chat compatibility
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            content: string;
        }[]
    }
  };
}

export interface AIResponseState {
  loading: boolean;
  recommendations: EventRecommendation[];
  error?: string;
  searched: boolean;
}

// --- NEW TASK TYPES ---
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate: string; // ISO Date string
  completed: boolean;
  createdAt: string;
  reminderSent?: boolean;
}
