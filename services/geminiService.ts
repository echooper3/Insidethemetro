
import { GoogleGenAI, Type } from "@google/genai";
import { GroundingChunk, EventRecommendation, SearchFilters } from "../types";
import { CATEGORIES, CITIES } from "../constants";

// Safely access process.env for browser compatibility
const getApiKey = () => {
    try {
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            return process.env.API_KEY;
        }
    } catch (e) {
        console.warn("Error accessing process.env");
    }
    return '';
};

// Lazy initialization singleton
let aiInstance: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
    if (!aiInstance) {
        const apiKey = getApiKey();
        aiInstance = new GoogleGenAI({ apiKey: apiKey || 'MISSING_KEY' });
    }
    return aiInstance;
};

// --- CACHE CONFIGURATION ---
const CACHE_KEY_PREFIX = 'imc_cache_v7_'; 
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 Hours

const getFromCache = (key: string) => {
  try {
    const item = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!item) return null;
    const parsed = JSON.parse(item);
    if (Date.now() - parsed.timestamp < CACHE_DURATION) {
      return parsed.data;
    }
    localStorage.removeItem(CACHE_KEY_PREFIX + key);
    return null;
  } catch (e) {
    return null;
  }
};

const saveToCache = (key: string, data: any) => {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
  } catch (e) {
    console.warn("LocalStorage unavailable or full");
  }
};

// --- RATE LIMITER ---
let lastCallTime = 0;
const MIN_REQUEST_INTERVAL = 1500;

const throttle = async () => {
    const now = Date.now();
    const timeSinceLast = now - lastCallTime;
    if (timeSinceLast < MIN_REQUEST_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLast));
    }
    lastCallTime = Date.now();
};

// --- ROBUST FALLBACK DATA ---
export const getFallbackEvents = (city: string, state: string, category?: string | null): EventRecommendation[] => {
    const cityData = CITIES.find(c => c.name === city);
    const lat = cityData ? cityData.coordinates[0] : 29.7604;
    const lng = cityData ? cityData.coordinates[1] : -95.3698;

    const baseLocation = { address: `Downtown, ${city}, ${state}`, latitude: lat, longitude: lng };
    
    const generalEvents: EventRecommendation[] = [
        {
            id: `fb-${city}-1`,
            name: `${city} Museum District Tour`,
            description: "Discover the cultural heart of the city. World-class art and historical exhibitions.",
            location: { ...baseLocation, address: `Museum District, ${city}, ${state}` },
            price: "$15 - $25",
            priceLevel: "$$",
            category: "Arts & Culture",
            date: "Daily",
            imageUrl: "https://images.unsplash.com/photo-1545989253-02cc26577f88?auto=format&fit=crop&w=800&q=80",
            tags: ["Art", "Culture"],
            organizer: { name: "City Arts Council" }
        },
        {
            id: `fb-${city}-2`,
            name: "Local Food Truck Festival",
            description: "The city's favorite street food gathering. Music, family activities, and gourmet bites.",
            location: { ...baseLocation, address: `Main Plaza, ${city}, ${state}` },
            price: "$10 - $20",
            priceLevel: "$",
            category: "Food & Drink",
            date: "Every Saturday",
            imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80",
            tags: ["Food", "Festival"],
            organizer: { name: "City Events" }
        }
    ];

    const sportsEvents: EventRecommendation[] = [
        {
            id: `fb-${city}-sp-1`,
            name: `${city} Stadium Behind-the-Scenes`,
            description: "Tour the city's legendary sports arena. Visit locker rooms and walk onto the field.",
            location: { ...baseLocation, address: `Sports Complex, ${city}, ${state}` },
            price: "$20",
            priceLevel: "$$",
            category: "Sports",
            date: "Tue-Sun",
            imageUrl: "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?auto=format&fit=crop&w=800&q=80",
            tags: ["Sports", "Behind the Scenes"],
            organizer: { name: "Stadium Authority" }
        },
        {
            id: `fb-${city}-sp-2`,
            name: "Community Park Fun Run",
            description: "Join hundreds of locals for a weekly 5k run through the city's most beautiful park.",
            location: { ...baseLocation, address: `City Park, ${city}, ${state}` },
            price: "Free",
            priceLevel: "Free",
            category: "Sports",
            date: "Saturday Mornings",
            imageUrl: "https://images.unsplash.com/photo-1552674605-469523f54050?auto=format&fit=crop&w=800&q=80",
            tags: ["Fitness", "Social"],
            organizer: { name: "Run Club" }
        }
    ];

    if (category === 'sports') return sportsEvents;
    return [...generalEvents, ...sportsEvents.slice(0, 1)];
};

// --- MAIN GENERATION FUNCTION ---
export const getCityRecommendationsJSON = async (
  city: string, 
  state: string, 
  filters: SearchFilters,
  excludeNames: string[] = []
): Promise<EventRecommendation[]> => {
  try {
    const cacheKey = `${city}_${state}_${JSON.stringify(filters)}_${excludeNames.length}`;
    
    const cachedData = getFromCache(cacheKey);
    if (cachedData && cachedData.length > 0) return cachedData;

    await throttle();

    const model = 'gemini-3-flash-preview';
    const isLoadMore = excludeNames.length > 0;
    
    const useSearchTool = filters.category === 'trending' || filters.category === 'sports' || !!filters.query;

    let prompt = `Find real events in ${city}, ${state}. Provide 6 items.`;

    if (filters.category) {
      const categoryObj = CATEGORIES.find(c => c.id === filters.category);
      let categoryTerm = categoryObj ? categoryObj.promptTerm : filters.category;
      
      if (filters.category === 'trending') {
        prompt += ` Use Google Search to find current breakout events for this exact week in ${city}.`;
      } else if (filters.category === 'sports') {
        prompt += ` Search for professional game schedules, college athletics (NCAA), High School varsity sports, recreational league nights, stadium tours, and community run clubs in ${city}.`;
      } else {
        prompt += ` Focus on category: ${categoryTerm}.`;
      }
    }
    
    if (filters.query) {
      prompt += ` Must relate to: "${filters.query}".`;
    }
    
    const now = new Date();
    if (isLoadMore) {
        prompt += ` Find events starting after ${now.toLocaleDateString()}.`;
    } else {
        prompt += ` Focus on this week specifically.`;
    }

    let jsonStructurePrompt = `
    Return JSON Array only.
    Format:
    [{
      "name": "string",
      "description": "string",
      "category": "string",
      "tags": ["string"], 
      "priceLevel": "Free, $, $$, $$$",
      "price": "string",
      "date": "string",
      "website": "string",
      "imageUrl": "string",
      "location": { "address": "string", "latitude": number, "longitude": number },
      "organizer": { "name": "string" }
    }]`;

    const ai = getAI();
    let response;
    
    try {
        response = await ai.models.generateContent({
            model,
            contents: prompt + jsonStructurePrompt,
            config: {
                tools: useSearchTool ? [{ googleSearch: {} }] : undefined, 
            },
        });
    } catch (error) {
        return getFallbackEvents(city, state, filters.category);
    }

    if (response && response.text) {
      try {
        let cleanText = response.text.trim();
        const startIndex = cleanText.indexOf('[');
        const endIndex = cleanText.lastIndexOf(']');
        if (startIndex !== -1 && endIndex !== -1) {
          cleanText = cleanText.substring(startIndex, endIndex + 1);
        }
        
        const result = JSON.parse(cleanText) as EventRecommendation[];
        
        if (result.length === 0) return getFallbackEvents(city, state, filters.category);
        
        // SANITIZATION
        const cityData = CITIES.find(c => c.name === city);
        const defaultLat = cityData ? cityData.coordinates[0] : 29.7604;
        const defaultLng = cityData ? cityData.coordinates[1] : -95.3698;

        const validatedResult = result.map((item, index) => {
            if (!item.id) item.id = `ai-${Date.now()}-${index}`;
            if (!item.location) item.location = { address: city, latitude: defaultLat, longitude: defaultLng };
            if (!item.location.latitude || !item.location.longitude || item.location.latitude === 0) {
                item.location.latitude = defaultLat + (Math.random() * 0.02 - 0.01);
                item.location.longitude = defaultLng + (Math.random() * 0.02 - 0.01);
            }
            return item;
        });

        saveToCache(cacheKey, validatedResult);
        return validatedResult;
      } catch (e) {
        return getFallbackEvents(city, state, filters.category);
      }
    }
    return getFallbackEvents(city, state, filters.category);
  } catch (error) {
    return getFallbackEvents(city, state, filters.category);
  }
};

export const geocodeAddress = async (address: string): Promise<{latitude: number, longitude: number} | null> => {
  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Return JSON { "latitude": number, "longitude": number } for address: "${address}".`;
    const ai = getAI();
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return null;
  }
};

export const chatWithCityPlanner = async (
  city: string,
  state: string,
  userMessage: string,
  history: any[]
): Promise<{ text: string; groundingChunks: GroundingChunk[]; newHistory: any[] }> => {
  try {
    await throttle();
    const model = 'gemini-3-pro-preview';
    const ai = getAI();
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: `You are a local expert for ${city}, ${state}. Recommend specific places and activities.`,
        tools: [{ googleMaps: {} }],
      },
      history: history
    });

    const response = await chat.sendMessage({ message: userMessage });
    const text = response.text || "I'm checking that for you...";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { 
      text, 
      groundingChunks: chunks as any,
      newHistory: [...history, { role: 'user', parts: [{ text: userMessage }] }, { role: 'model', parts: [{ text: text }] }]
    };
  } catch (error) {
    return { text: "I'm having a little trouble connecting. Try again in a moment!", groundingChunks: [], newHistory: history };
  }
};
