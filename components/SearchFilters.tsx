
import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, DollarSign, Tag, Zap, LayoutGrid, Check, ChevronDown } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../types';
import { PRICE_FILTERS, CATEGORIES, SPONSORED_EVENTS } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onChange: (newFilters: SearchFiltersType) => void;
  onSearch: () => void;
  loading: boolean;
}

type Suggestion = {
  type: 'Event' | 'Category';
  label: string;
  value: string;
  subLabel?: string;
  isSponsored?: boolean;
};

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onChange, onSearch, loading }) => {
  // Local state for immediate input response
  const [localQuery, setLocalQuery] = useState(filters.query);
  
  // Suggestion & UI State
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const categoryContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);
  
  const { approvedEvents } = useAuth();

  // Sync local state if parent state changes externally (e.g. clear filters)
  useEffect(() => {
    setLocalQuery(filters.query);
  }, [filters.query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (categoryContainerRef.current && !categoryContainerRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced Search & Prediction Logic
  useEffect(() => {
    // Clear previous timer
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Set new timer
    debounceRef.current = window.setTimeout(() => {
        // 1. Update Parent State if changed
        if (localQuery !== filters.query) {
            onChange({ ...filters, query: localQuery });
        }

        // 2. Generate Predictions
        if (localQuery && localQuery.length >= 2) {
            const lower = localQuery.toLowerCase();
            
            const safeCategories = Array.isArray(CATEGORIES) ? CATEGORIES : [];
            const catMatches: Suggestion[] = safeCategories.filter(c => 
                c.name && c.name.toLowerCase().includes(lower)
            ).map(c => ({ type: 'Category', label: c.name, value: c.id, subLabel: 'Browse Category' }));
            
            const safeSponsored = Array.isArray(SPONSORED_EVENTS) ? SPONSORED_EVENTS : [];
            const safeApproved = Array.isArray(approvedEvents) ? approvedEvents : [];

            const allEvents = [...safeSponsored, ...safeApproved].filter(e => e && e.name);
            const uniqueEvents = Array.from(new Map(allEvents.map(item => [item.name, item])).values());
            
            const eventMatches: Suggestion[] = uniqueEvents
                .filter(e => {
                    const nameMatch = e.name && e.name.toLowerCase().includes(lower);
                    const catMatch = e.category && e.category.toLowerCase().includes(lower);
                    return nameMatch || catMatch;
                })
                .slice(0, 5)
                .map(e => ({ 
                    type: 'Event', 
                    label: e.name, 
                    value: e.name, 
                    subLabel: e.category || 'Event',
                    isSponsored: !!e.isSponsored 
                }));
                
            setSuggestions([...catMatches, ...eventMatches]);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, 300); // 300ms Debounce

    return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localQuery, approvedEvents]); // Intentionally omitting filters to avoid loops, sync handled above

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      // Immediate update and search
      if (localQuery !== filters.query) {
        onChange({ ...filters, query: localQuery });
      }
      setTimeout(onSearch, 50);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
      if (suggestion.type === 'Category') {
          setLocalQuery('');
          onChange({ ...filters, query: '', category: suggestion.value });
      } else {
          setLocalQuery(suggestion.label);
          onChange({ ...filters, query: suggestion.label });
      }
      setShowSuggestions(false);
      setTimeout(onSearch, 50);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    onChange({ ...filters, category: categoryId });
    setShowCategoryDropdown(false);
  };

  const safePriceFilters = Array.isArray(PRICE_FILTERS) ? PRICE_FILTERS : [];
  const safeCategories = Array.isArray(CATEGORIES) ? CATEGORIES : [];
  
  const selectedCategory = safeCategories.find(c => c.id === filters.category);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 -mt-8 relative z-20 mx-4 lg:mx-auto max-w-6xl animate-fade-in-up">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input Container */}
        <div className="flex-1 relative min-w-[200px]" ref={searchContainerRef}>
          <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
                if (localQuery && localQuery.length >= 2 && suggestions.length > 0) setShowSuggestions(true);
            }}
            placeholder="Search events, tacos, jazz..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
            autoComplete="off"
          />
          
          {/* Predictive Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in-down">
                  <div className="max-h-60 overflow-y-auto">
                      {suggestions.map((item, idx) => (
                          <button
                            key={`${item.type}-${item.value}-${idx}`}
                            onClick={() => handleSuggestionClick(item)}
                            className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors flex items-center justify-between group border-b border-slate-50 last:border-0"
                          >
                              <div className="flex items-center gap-3 overflow-hidden">
                                  <div className={`p-1.5 rounded-full flex-shrink-0 ${item.type === 'Category' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                      {item.type === 'Category' ? <LayoutGrid size={14} /> : <Search size={14} />}
                                  </div>
                                  <div className="min-w-0">
                                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-orange-700">
                                          {item.label}
                                      </p>
                                      <p className="text-xs text-slate-400 truncate">
                                          {item.subLabel}
                                      </p>
                                  </div>
                              </div>
                              {item.isSponsored && (
                                  <span className="flex-shrink-0 text-[10px] font-bold uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
                                      <Zap size={10} className="fill-current" /> Ad
                                  </span>
                              )}
                          </button>
                      ))}
                  </div>
              </div>
          )}
        </div>

        {/* Filters Wrapper */}
        <div className="flex flex-wrap lg:flex-nowrap gap-4">
          
          {/* Custom Category Dropdown */}
          <div className="relative w-full sm:w-auto min-w-[200px]" ref={categoryContainerRef}>
             <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className={`w-full text-left pl-3 pr-10 py-3 rounded-xl border flex items-center gap-2 outline-none transition-all ${filters.category ? 'bg-orange-50 border-orange-200 text-orange-800 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'}`}
             >
                {selectedCategory ? (
                   <>
                     <selectedCategory.icon size={18} className="text-orange-600" />
                     <span className="truncate">{selectedCategory.name}</span>
                   </>
                ) : (
                   <>
                     <Tag size={18} className="text-slate-400" />
                     <span>All Categories</span>
                   </>
                )}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ChevronDown size={16} />
                </div>
             </button>

             {showCategoryDropdown && (
                <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 overflow-y-auto animate-fade-in-down w-[250px]">
                    <button
                        onClick={() => handleCategorySelect(null)}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${!filters.category ? 'bg-orange-50 text-orange-900' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                         <div className="p-1.5 rounded-md bg-slate-100 text-slate-500 flex-shrink-0">
                            <Tag size={16} />
                         </div>
                         <span className="font-medium">All Categories</span>
                         {!filters.category && <Check size={16} className="ml-auto text-orange-600" />}
                    </button>
                    {safeCategories.map(category => {
                        const Icon = category.icon;
                        const isSelected = filters.category === category.id;
                        return (
                            <button
                                key={category.id}
                                onClick={() => handleCategorySelect(category.id)}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${isSelected ? 'bg-orange-50 text-orange-900' : 'hover:bg-slate-50 text-slate-700'}`}
                            >
                                <div className={`p-1.5 rounded-md flex-shrink-0 ${isSelected ? 'bg-white text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                                    <Icon size={16} />
                                </div>
                                <span className="font-medium">{category.name}</span>
                                {isSelected && <Check size={16} className="ml-auto text-orange-600" />}
                            </button>
                        )
                    })}
                </div>
             )}
          </div>

          {/* Start Date */}
          <div className="relative w-full sm:w-auto min-w-[140px]">
            <Calendar className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 outline-none text-slate-700 text-sm"
              placeholder="Start Date"
            />
          </div>

          {/* End Date */}
          <div className="relative w-full sm:w-auto min-w-[140px]">
            <Calendar className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input
              type="date"
              value={filters.endDate}
              min={filters.startDate} // Ensure end date is after start date
              onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 outline-none text-slate-700 text-sm"
              placeholder="End Date"
            />
          </div>

          {/* Price Filter */}
          <div className="relative w-full sm:w-auto min-w-[140px]">
            <DollarSign className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <select
              value={filters.price}
              onChange={(e) => onChange({ ...filters, price: e.target.value })}
              className="w-full appearance-none pl-10 pr-8 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 outline-none cursor-pointer text-slate-700"
            >
              {safePriceFilters.map(f => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={() => {
             setShowSuggestions(false);
             if (debounceRef.current) clearTimeout(debounceRef.current);
             if (localQuery !== filters.query) {
                 onChange({ ...filters, query: localQuery });
             }
             setTimeout(onSearch, 50);
          }}
          disabled={loading}
          className="w-full lg:w-auto bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? 'Searching...' : 'Find Events'}
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;
