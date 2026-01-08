
import { Utensils, Trophy, Tent, Palette, Martini, Users, Flame, Smile, Ticket, Landmark, School } from 'lucide-react';
import { City, Category, EventRecommendation } from './types';

export const CITIES: City[] = [
  {
    id: 'houston',
    name: 'Houston',
    state: 'TX',
    image: 'https://images.unsplash.com/photo-1530089711124-9ca31fb9e863?auto=format&fit=crop&w=2000&q=80',
    coordinates: [29.7604, -95.3698]
  },
  {
    id: 'dallas',
    name: 'Dallas',
    state: 'TX',
    image: 'https://images.unsplash.com/photo-1572979245136-2bf4b50c0c7d?auto=format&fit=crop&w=2000&q=80',
    coordinates: [32.7767, -96.7970]
  },
  {
    id: 'okc',
    name: 'Oklahoma City',
    state: 'OK',
    image: 'https://images.unsplash.com/photo-1623943632888-290940562dc6?auto=format&fit=crop&w=2000&q=80',
    coordinates: [35.4676, -97.5164]
  },
  {
    id: 'tulsa',
    name: 'Tulsa',
    state: 'OK',
    image: 'https://images.unsplash.com/photo-1575031676648-5c4e10787473?auto=format&fit=crop&w=2000&q=80',
    coordinates: [36.1540, -95.9928]
  }
];

export const CATEGORIES: Category[] = [
  { id: 'trending', name: 'Trending', icon: Flame, promptTerm: 'Google Trends breakout topics, viral events, high search volume activities' },
  { id: 'sports', name: 'Sports', icon: Trophy, promptTerm: 'professional sports, college sports, high school varsity sports, recreational leagues, stadium tours, football, basketball, baseball, soccer matches, school rivalries, athletic events, training camps' },
  { id: 'family', name: 'Family Activities', icon: Smile, promptTerm: 'family friendly events, kids activities, workshops for children, family fun' },
  { id: 'entertainment', name: 'Entertainment', icon: Ticket, promptTerm: 'live music concerts, comedy shows, magic shows, circus, performances, movies, entertainment events' },
  { id: 'attractions', name: 'Visitor Attractions', icon: Landmark, promptTerm: 'tourist attractions, landmarks, sightseeing, tours, must-see places, golf courses, amusement parks, water parks, museums, festivals and fairs, music halls, national parks, historical landmarks, religious sites, shopping districts, places of worship, culinary tours, heritage attractions, exhibitions, petting zoos, zoos, aquariums, casinos, haunted houses, theme parks, concert halls, theatres' },
  { id: 'food', name: 'Food & Drink', icon: Utensils, promptTerm: 'food festivals, dining events, culinary experiences' },
  { id: 'nightlife', name: 'Night Life', icon: Martini, promptTerm: 'night clubs, bars, evening entertainment' },
  { id: 'arts', name: 'Arts & Culture', icon: Palette, promptTerm: 'art exhibitions, museums, theater, cultural events, art shows' },
  { id: 'outdoors', name: 'Outdoors', icon: Tent, promptTerm: 'kayaking, mountain climbing, trails, trail runs, walking trails, running trails, rafting, white water rafting, <caves & lakes>, waterfalls, National parks, beaches, zip lining, rock climbing, cliffs, hills, forests, islands, wildlife attractions, landscapes, outdoor activities, parks, nature' },
  { id: 'community', name: 'Community', icon: Users, promptTerm: 'community gatherings, networking, local meetups, entrepreneurship, business mixers, startup events' },
];

export const PRICE_FILTERS = [
  { id: 'any', label: 'Any Price' },
  { id: 'free', label: 'Free' },
  { id: 'paid', label: 'Paid' }
];

export const CATEGORY_IMAGES: Record<string, string> = {
  'trending': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
  'family': 'https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=800&q=80',
  'entertainment': 'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?auto=format&fit=crop&w=800&q=80',
  'attractions': 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?auto=format&fit=crop&w=800&q=80',
  'food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  'nightlife': 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80',
  'arts': 'https://images.unsplash.com/photo-1518998053901-5348d3969105?auto=format&fit=crop&w=800&q=80',
  'sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
  'outdoors': 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80',
  'community': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
  'default': 'https://images.unsplash.com/photo-1459749411177-0473ef487ffa?auto=format&fit=crop&w=800&q=80'
};

export interface AdContent {
  title: string;
  advertiserName: string;
  description: string;
  imageUrl: string;
}

export const CITY_ADS: Record<string, { small: AdContent, medium: AdContent, large: AdContent }> = {
  'houston': {
    small: {
      title: "Houston's Finest Roasts",
      advertiserName: "Bayou Coffee Co.",
      description: "Start your morning with local small-batch coffee in the heart of Downtown Houston.",
      imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"
    },
    medium: {
      title: "H-Town Premium Rides",
      advertiserName: "Bayou Transit",
      description: "Arrive at your next event in comfort. 20% off for new Houston users.",
      imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80"
    },
    large: {
      title: "The Heart of Houston Art",
      advertiserName: "Museum District Partners",
      description: "Discover hidden galleries and world-class exhibitions throughout the Bayou City.",
      imageUrl: "https://images.unsplash.com/photo-1545989253-02cc26577f88?auto=format&fit=crop&w=1200&q=80"
    }
  },
  'dallas': {
    small: {
      title: "The Dallas Skyline View",
      advertiserName: "Reunion Lounge",
      description: "Experience the best views in DFW. Cocktails and skyline dining atop the tower.",
      imageUrl: "https://images.unsplash.com/photo-1572979245136-2bf4b50c0c7d?auto=format&fit=crop&w=800&q=80"
    },
    medium: {
      title: "Big D Luxury Valet",
      advertiserName: "Dallas Elite",
      description: "Premium valet services for events at the AT&T Discovery District and beyond.",
      imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
    },
    large: {
      title: "Dallas Music Heritage",
      advertiserName: "Deep Ellum Live",
      description: "From jazz to indie, explore the sound of the city's most historic entertainment district.",
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80"
    }
  },
  'okc': {
    small: {
      title: "Thunder City Steaks",
      advertiserName: "OKC Prime",
      description: "Voted #1 steakhouse in Oklahoma City. Experience authentic Western hospitality.",
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
    },
    medium: {
      title: "OKC Bricktown Shuttles",
      advertiserName: "Downtown Transit",
      description: "Easy navigation between Bricktown and the canal. Ride free this weekend.",
      imageUrl: "https://images.unsplash.com/photo-1623943632888-290940562dc6?auto=format&fit=crop&w=1200&q=80"
    },
    large: {
      title: "Discover OKC's Wild Side",
      advertiserName: "Oklahoma Zoo",
      description: "Family fun and exotic wildlife waiting for you in the heart of the capital.",
      imageUrl: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80"
    }
  },
  'tulsa': {
    small: {
      title: "Tulsa Sound Sessions",
      advertiserName: "Cain's Ballroom",
      description: "The historic home of the Tulsa sound. Check our calendar for upcoming live shows.",
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
    },
    medium: {
      title: "Tulsa Riverside Transit",
      advertiserName: "River Link",
      description: "The best way to get to Gathering Place. Reliable, fast, and local.",
      imageUrl: "https://images.unsplash.com/photo-1575031676648-5c4e10787473?auto=format&fit=crop&w=1200&q=80"
    },
    large: {
      title: "The Art of Tulsa",
      advertiserName: "Philbrook Museum",
      description: "Where art, architecture, and gardens meet in an Italian-style villa.",
      imageUrl: "https://images.unsplash.com/photo-1518998053901-5348d3969105?auto=format&fit=crop&w=1200&q=80"
    }
  }
};

export const SPONSORED_EVENTS: EventRecommendation[] = [
  {
    id: 'spon_1',
    cityId: 'houston',
    name: "Pour Behavior",
    description: "Large, vibrant venue for sports, dining & nightlife with a huge patio & video wall.",
    location: { address: "2211 Travis St, Houston, TX 77002", latitude: 29.7483, longitude: -95.3734 },
    priceLevel: "$$", 
    price: "Free Entry", 
    date: "Daily", 
    category: "Night Life", 
    tags: ["Sports Bar", "Patio", "Nightclub"],
    website: "https://pourbehavior.com",
    imageUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=800&q=80",
    isSponsored: true,
    organizer: { name: "Pour Behavior", website: "https://pourbehavior.com", logoUrl: "https://logo.clearbit.com/pourbehavior.com" }
  },
  {
    id: 'spon_2',
    cityId: 'houston',
    name: "Playground Houston",
    description: "A fun outdoor patio bar in Midtown featuring swings, colorful lights, oversized yard games, and a vibrant atmosphere.",
    location: { address: "2415 Main St, Houston, TX 77002", latitude: 29.7485, longitude: -95.3710 },
    priceLevel: "$", 
    price: "Free Entry", 
    date: "Wed-Sun", 
    category: "Night Life", 
    tags: ["Bar", "Outdoor", "Games", "Midtown"],
    website: "https://playgroundhtx.com",
    imageUrl: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&w=800&q=80",
    isSponsored: true,
    organizer: { name: "Playground", website: "https://playgroundhtx.com", logoUrl: "" }
  }
];

export const FAQ_DATA = [
  {
    category: "General",
    questions: [
      {
        q: "What is Inside The Metro?",
        a: "Inside The Metro is your AI-powered companion for discovering events, hidden gems, and local culture across major metropolitan hubs. Currently, we serve Houston, Dallas, Oklahoma City, and Tulsa."
      },
      {
        q: "How does the AI Planner work?",
        a: "Our planner uses Google Gemini 3.0 Pro to process real-time web and maps data. It understands your preferences—like 'kid-friendly Sunday morning' or 'romantic dinner with live music'—to build personalized itineraries."
      }
    ]
  },
  {
    category: "Event Submissions",
    questions: [
      {
        q: "How do I add my event to the app?",
        a: "To post an event, you must have an 'Organizer' or 'Business' account. Simply click the 'Post Event' button in the header, fill out the details, and submit it for admin approval."
      },
      {
        q: "Is there a fee to list an event?",
        a: "Standard event listings are free for all approved organizers. For premium placement or 'Sponsored' badges, check our 'Contact Us for Rates' section."
      }
    ]
  },
  {
    category: "Account & Security",
    questions: [
      {
        q: "Why do I need to change my password every 90 days?",
        a: "We prioritize security. Regular password rotations help protect your account data, especially for organizers managing public event listings."
      },
      {
        q: "Can I use the app without an account?",
        a: "Yes! You can browse and search events freely. However, an account is required to save events, create itineraries, and post new listings."
      }
    ]
  }
];
