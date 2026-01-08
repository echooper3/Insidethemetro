
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { CATEGORIES, SPONSORED_EVENTS, CITY_ADS } from '../constants';
import { City, AIResponseState, SearchFilters as SearchFiltersType, EventRecommendation } from '../types';
import { getCityRecommendationsJSON, getFallbackEvents } from '../services/geminiService';
import SearchFilters from '../components/SearchFilters';
import EventCard from '../components/EventCard';
import RecentlyViewed from '../components/RecentlyViewed';
import AdSpace from '../components/AdSpace';
import { Map as MapIcon, List, Loader2, CalendarRange, SortAsc, Navigation } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';

// Lazy loaded heavy components
const EventMap = React.lazy(() => import('../components/EventMap'));
const EventDetailsModal = React.lazy(() => import('../components/EventDetailsModal'));

interface HomeProps {
  currentCity: City;
}

const Home: React.FC<HomeProps> = ({ currentCity }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<SearchFiltersType>({
    query: '',
    startDate: '',
    endDate: '',
    price: 'any',
    category: null
  });

  const [data, setData] = useState<AIResponseState>({ 
    loading: false, 
    recommendations: [], 
    searched: false 
  });
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedEvent, setSelectedEvent] = useState<EventRecommendation | null>(null);
  
  // Infinite Scroll State
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [initialAiCount, setInitialAiCount] = useState<number | null>(null);
  
  // Sorting State
  const [sortBy, setSortBy] = useState<'recommended' | 'distance'>('recommended');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const { approvedEvents } = useAuth();
  const observer = useRef<IntersectionObserver | null>(null);

  // Helper to get active city's ad set
  const activeCityAdSet = CITY_ADS[currentCity.id] || CITY_ADS['houston'];

  // Reusable fetch function
  const fetchEvents = async (newFilters: SearchFiltersType) => {
    // 1. Instant Feedback for Categories (Preload)
    let initialData: EventRecommendation[] = [];
    if (newFilters.category && currentCity) {
        initialData = getFallbackEvents(currentCity.name, currentCity.state, newFilters.category);
    }

    setData(prev => ({ 
        ...prev, 
        loading: true, 
        searched: true,
        recommendations: initialData 
    }));
    
    setHasMore(true);
    setInitialAiCount(null);
    
    // Safety check for city data
    if (!currentCity || !currentCity.name) {
        console.error("Current city is missing");
        setData({ loading: false, recommendations: [], searched: true });
        return;
    }
    
    const results = await getCityRecommendationsJSON(currentCity.name, currentCity.state, newFilters);
    
    setData({
      loading: false,
      recommendations: results,
      searched: true
    });
    setInitialAiCount(results.length);
    if (results.length < 4) setHasMore(false);
  };

  // Handle URL Params for Category switching
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
        if (filters.category !== categoryParam) {
            const newFilters = { ...filters, category: categoryParam };
            setFilters(newFilters);
            fetchEvents(newFilters);
        }
    } else {
        // If no category param and we are not doing a text search, reset to grid
        if (searchParams.size === 0 && data.searched && !filters.query) {
             setFilters({ ...filters, category: null });
             setData({ loading: false, recommendations: [], searched: false });
        }
    }
  }, [searchParams, currentCity]);

  // Haversine Distance Calculation
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d * 0.621371; // Convert to miles
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
  }

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setSortBy('distance');
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location", error);
        alert("Unable to retrieve your location. Please check your permissions.");
        setIsLoadingLocation(false);
      }
    );
  };

  const handleSearch = async () => {
    // Manual search triggers fetch immediately
    fetchEvents(filters);
  };

  const handleLoadMore = async () => {
    if (isFetchingMore || !hasMore) return;
    
    setIsFetchingMore(true);
    
    // Collect existing names to exclude
    const existingNames = data.recommendations.map(r => r.name);
    
    const moreResults = await getCityRecommendationsJSON(
        currentCity.name, 
        currentCity.state, 
        filters, 
        existingNames
    );
    
    if (moreResults.length === 0) {
        setHasMore(false);
    } else {
        setData(prev => ({
            ...prev,
            recommendations: [...prev.recommendations, ...moreResults]
        }));
    }
    
    setIsFetchingMore(false);
  };

  // Intersection Observer callback
  const lastEventElementRef = useCallback((node: HTMLDivElement) => {
    if (data.loading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        handleLoadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [data.loading, isFetchingMore, hasMore, data.recommendations]); // Dependencies

  const handleCategorySelect = (categoryId: string) => {
    // Update URL, which triggers the effect to fetch data
    setSearchParams({ category: categoryId });
  };

  // Reset when city changes, but DO NOT AUTO FETCH unless params exist
  useEffect(() => {
    setSearchParams({}); // Clear URL params
    setFilters({ query: '', startDate: '', endDate: '', price: 'any', category: null });
    // Reset data to unsearched state to show categories
    setData({ loading: false, recommendations: [], searched: false });
    setSelectedEvent(null);
    setHasMore(true);
    setInitialAiCount(null);
    setSortBy('recommended');
    setUserLocation(null);
  }, [currentCity]);

  // Get relevant sponsored events based on current filters
  const getRelevantSponsoredEvents = () => {
    const safeSponsored = Array.isArray(SPONSORED_EVENTS) ? SPONSORED_EVENTS : [];
    
    const sponsored = safeSponsored.filter(event => {
      if (!event || !currentCity || !currentCity.id) return false;

      // STRICT CITY FILTERING
      if (event.cityId && event.cityId !== currentCity.id) {
          return false;
      }

      // Fallback location check if cityId is missing
      if (!event.cityId && event.location?.address && !event.location.address.toLowerCase().includes(currentCity.name.toLowerCase())) {
          return false;
      }

      // Category Filter
      if (filters.category) {
        const selectedCatName = CATEGORIES.find(c => c.id === filters.category)?.name;
        if (event.category !== selectedCatName) return false;
      }

      // Query Filter
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const matches = 
            (event.name && event.name.toLowerCase().includes(q)) || 
            (event.description && event.description.toLowerCase().includes(q)) ||
            (event.category && event.category.toLowerCase().includes(q));
        if (!matches) return false;
      }
      
      return true;
    });

    return sponsored; 
  };

  const getRelevantApprovedEvents = () => {
    if (!approvedEvents || !Array.isArray(approvedEvents)) return [];
    
    return approvedEvents.filter(event => {
        if (!event || !event.location || !event.location.address || !currentCity || !currentCity.name) {
            return false;
        }
        
        if (!event.location.address.toLowerCase().includes(currentCity.name.toLowerCase())) {
           return false;
        }

        if (filters.category) {
            const selectedCatName = CATEGORIES.find(c => c.id === filters.category)?.name;
            if (event.category !== selectedCatName) return false;
        }
        if (filters.query) {
            const q = filters.query.toLowerCase();
            return (event.name && event.name.toLowerCase().includes(q)) || 
                   (event.description && event.description.toLowerCase().includes(q));
        }
        return true;
    });
  };

  // Helper to inject ads into list view
  const renderEventListWithAds = () => {
    const items: React.ReactNode[] = [];
    const allSponsored = getRelevantSponsoredEvents();
    const localApproved = getRelevantApprovedEvents();
    const isShowingUpcoming = initialAiCount !== null && data.recommendations.length > initialAiCount;
    const upcomingStartEvent = isShowingUpcoming ? data.recommendations[initialAiCount] : null;

    let allDisplayEvents = [...allSponsored, ...localApproved, ...data.recommendations].filter((event, index, self) => 
      event && event.name && event.location && index === self.findIndex((t) => (
        t.name === event.name && t.location?.address === event.location.address
      ))
    );

    // SORTING LOGIC
    if (sortBy === 'distance' && userLocation) {
        allDisplayEvents.sort((a, b) => {
            if (!a.location || !b.location) return 0;
            const aSponsored = !!a.isSponsored;
            const bSponsored = !!b.isSponsored;
            if (aSponsored && !bSponsored) return -1;
            if (!aSponsored && bSponsored) return 1;

            const distA = getDistance(userLocation.lat, userLocation.lng, a.location.latitude, a.location.longitude);
            const distB = getDistance(userLocation.lat, userLocation.lng, b.location.latitude, b.location.longitude);
            return distA - distB;
        });
    } else {
        allDisplayEvents.sort((a, b) => {
            const aSponsored = !!a.isSponsored;
            const bSponsored = !!b.isSponsored;
            if (aSponsored && !bSponsored) return -1;
            if (!aSponsored && bSponsored) return 1;
            return 0;
        });
    }
    
    const shouldShowUpcomingHeader = isShowingUpcoming && !filters.startDate && !filters.endDate && sortBy === 'recommended';

    if (allDisplayEvents.length > 0) {
      allDisplayEvents.forEach((event, index) => {
        const isLastElement = index === allDisplayEvents.length - 1;
        
        if (shouldShowUpcomingHeader && event === upcomingStartEvent) {
            items.push(
                <div key="upcoming-header" className="col-span-full pt-8 pb-4 animate-fade-in">
                    <div className="flex items-center gap-3 border-b border-orange-200 pb-2">
                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                            <CalendarRange size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">Upcoming Events</h3>
                            <p className="text-sm text-slate-500">Discover what's happening later this month</p>
                        </div>
                    </div>
                </div>
            );
        }

        let distanceLabel = '';
        if (userLocation && event.location) {
            const dist = getDistance(userLocation.lat, userLocation.lng, event.location.latitude, event.location.longitude);
            distanceLabel = `${dist.toFixed(1)} mi`;
        }

        items.push(
          <div key={`event-${index}`} ref={isLastElement ? lastEventElementRef : null} className="relative">
            {sortBy === 'distance' && distanceLabel && (
                <div className="absolute top-2 right-2 z-10 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                    {distanceLabel}
                </div>
            )}
            <EventCard 
                event={event} 
                onClick={() => setSelectedEvent(event)} 
            />
          </div>
        );

        // Inject City-Specific Small Ad after 4th item (index 3)
        if (index === 3) {
          items.push(
            <AdSpace 
              key={`native-ad-${currentCity.id}`} 
              size="small" 
              {...activeCityAdSet.small}
            />
          );
        }
      });
    }
    return items;
  };

  const getAllMapEvents = () => {
    const sponsoredEvents = getRelevantSponsoredEvents();
    const localApproved = getRelevantApprovedEvents();
    
    let allEvents = [...sponsoredEvents, ...localApproved, ...data.recommendations].filter((event, index, self) => 
      event && event.name && event.location && index === self.findIndex((t) => (
        t.name === event.name && t.location?.address === event.location.address
      ))
    );

    if (sortBy === 'distance' && userLocation) {
        allEvents.sort((a, b) => {
            if (!a.location || !b.location) return 0;
            const aSponsored = !!a.isSponsored;
            const bSponsored = !!b.isSponsored;
            if (aSponsored && !bSponsored) return -1;
            if (!aSponsored && bSponsored) return 1;
            const distA = getDistance(userLocation.lat, userLocation.lng, a.location.latitude, a.location.longitude);
            const distB = getDistance(userLocation.lat, userLocation.lng, b.location.latitude, b.location.longitude);
            return distA - distB;
        });
    } else {
        allEvents.sort((a, b) => {
            const aSponsored = !!a.isSponsored;
            const bSponsored = !!b.isSponsored;
            if (aSponsored && !bSponsored) return -1;
            if (!aSponsored && bSponsored) return 1;
            return 0;
        });
    }

    return allEvents;
  };

  const getResultsTitle = () => {
    if (data.loading && !hasMore) return 'Finding best spots...';
    if (filters.startDate || filters.endDate) {
        if (filters.startDate && filters.endDate) {
            return `Activities from ${filters.startDate} to ${filters.endDate}`;
        }
        if (filters.startDate) return `Activities starting ${filters.startDate}`;
        if (filters.endDate) return `Activities before ${filters.endDate}`;
    }
    return 'This Week Activities';
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="relative bg-slate-900 h-80 sm:h-96 flex items-center justify-center overflow-hidden">
        <img 
          src={currentCity.image} 
          alt={currentCity.name} 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-10 text-center px-4 -mt-10">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4 drop-shadow-xl">
            {currentCity.name}
          </h1>
          <p className="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto font-light mb-8">
            Discover events, food, and culture.
          </p>
        </div>
      </div>

      <SearchFilters 
        filters={filters} 
        onChange={setFilters} 
        onSearch={handleSearch} 
        loading={data.loading} 
      />

      <AdSpace 
        size="medium" 
        {...activeCityAdSet.medium}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!data.searched && (
          <div className="mb-12 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:shadow-md hover:scale-105 transition-all duration-200 group"
                  >
                    <Icon size={32} className="mb-3 text-orange-500 group-hover:text-orange-600" />
                    <span className="font-semibold">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {data.searched && (
          <div className="animate-fade-in">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-6 gap-4">
               <h3 className="text-2xl font-bold text-slate-800">
                 {getResultsTitle()}
               </h3>
               
               <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                        <button
                            onClick={() => {
                                if (sortBy === 'recommended') getUserLocation();
                                else setSortBy('recommended');
                            }}
                            disabled={isLoadingLocation}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                sortBy === 'distance' 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {isLoadingLocation ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                            {sortBy === 'distance' ? 'Near Me' : 'Sort Distance'}
                        </button>
                    </div>

                   <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                        <List size={16} className="mr-2" /> List
                        </button>
                        <button
                        onClick={() => setViewMode('map')}
                        className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'map' ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                        <MapIcon size={16} className="mr-2" /> Map
                        </button>
                   </div>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {viewMode === 'list' && renderEventListWithAds()}
                {data.loading && (
                    <>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={`skeleton-${i}`} className="animate-pulse bg-white rounded-xl h-[420px] border border-slate-200 overflow-hidden flex flex-col">
                            <div className="h-48 bg-slate-200 w-full relative">
                                <div className="absolute top-4 left-4 h-6 w-20 bg-slate-300 rounded-full"></div>
                            </div>
                            <div className="p-5 flex-1 space-y-4">
                                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                    </>
                )}
            </div>

            {!data.loading && data.recommendations.length === 0 && getRelevantSponsoredEvents().length === 0 && getRelevantApprovedEvents().length === 0 && (
                 <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 mt-6">
                    <p className="text-slate-500 text-lg">No events found matching your criteria. Try adjusting your filters.</p>
                </div>
            )}
            
            {viewMode === 'map' && (
                <Suspense fallback={
                    <div className="h-[600px] w-full bg-slate-200 animate-pulse rounded-xl border border-slate-300 mt-6 flex items-center justify-center">
                        <Loader2 className="animate-spin text-slate-400" size={32} />
                    </div>
                }>
                    <div className="h-[600px] w-full bg-slate-200 rounded-xl overflow-hidden border border-slate-300 shadow-inner relative mt-6">
                        <EventMap events={getAllMapEvents()} city={currentCity} />
                    </div>
                </Suspense>
            )}
            
            {hasMore && viewMode === 'list' && !data.loading && (
                <div className="w-full flex justify-center py-8">
                    <div className="flex items-center gap-2 text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                        <Loader2 className="animate-spin text-orange-600" size={20} />
                        <span className="text-sm font-medium">Discovering upcoming events...</span>
                    </div>
                </div>
            )}
          </div>
        )}
        
        <AdSpace 
          size="large" 
          {...activeCityAdSet.large}
          className="max-w-5xl mx-auto my-12 px-4"
        />

        <RecentlyViewed onEventClick={setSelectedEvent} />
      </div>

      <Suspense fallback={null}>
        <EventDetailsModal 
            isOpen={!!selectedEvent}
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onEventSelect={setSelectedEvent}
            allEvents={[...getRelevantSponsoredEvents(), ...getRelevantApprovedEvents(), ...data.recommendations]}
        />
      </Suspense>
    </div>
  );
};

export default Home;
