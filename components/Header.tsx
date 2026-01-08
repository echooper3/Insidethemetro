import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Map, Menu, X, User as UserIcon, LogOut, MapPin, PlusCircle, LayoutDashboard, Settings, ClipboardList, Heart } from 'lucide-react';
import { City } from '../types';
import { CITIES, CATEGORIES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import WeatherWidget from './WeatherWidget';

const AuthModal = React.lazy(() => import('./AuthModal'));

interface HeaderProps {
  currentCity: City;
  onCityChange: (cityId: string) => void;
  onCreateEventClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentCity, onCityChange, onCreateEventClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [showCategories, setShowCategories] = useState(true);
  const lastScrollY = useRef(0);

  const cityMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');

  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);
      if (currentScrollY < 50 || currentScrollY < lastScrollY.current) {
         setShowCategories(true);
      } else {
         setShowCategories(false);
      }
      lastScrollY.current = currentScrollY;
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (cityMenuRef.current && !cityMenuRef.current.contains(event.target as Node)) {
            setIsCityMenuOpen(false);
        }
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
            setIsProfileMenuOpen(false);
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const prefetchRoute = (page: 'planner' | 'itinerary' | 'admin' | 'saved' | 'profile') => {
    try {
        if (page === 'planner') import('../pages/Planner');
        if (page === 'itinerary') import('../pages/Itinerary');
        if (page === 'admin') import('../AdminCRM'); // Fixed path: was ../pages/AdminCRM
        if (page === 'saved') import('../pages/SavedEvents');
        if (page === 'profile') import('../pages/OrganizerProfile');
    } catch (e) {
        // Ignore prefetch errors
    }
  };

  const prefetchModal = (modal: 'auth') => {
    try {
        if (modal === 'auth') import('./AuthModal');
    } catch (e) {
        // Ignore prefetch errors
    }
  };

  const canCreateEvent = user && (user.accountType === 'Organizer' || user.accountType === 'Business');
  const isAdmin = user && user.accountType === 'Admin';

  return (
    <>
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-md border-slate-200/80' 
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-orange-600 p-2 rounded-lg text-white shadow-sm">
                  <Map size={24} />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:inline">
                  Inside The Metro <span className="text-orange-600">{currentCity.id === 'okc' ? 'OKC' : currentCity.name}</span>
                </span>
                <span className="font-bold text-xl tracking-tight text-slate-900 sm:hidden">
                  InsideTheMetro
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <WeatherWidget city={currentCity} />
              <div className="h-6 w-px bg-slate-200 mx-2"></div>
              <Link 
                to="/" 
                className={`${isActive('/') ? 'text-orange-600 font-bold' : 'text-slate-600 hover:text-orange-600 font-medium'} transition-colors`}
              >
                Explore
              </Link>

              {isAuthenticated && (
                <Link 
                  to="/itinerary" 
                  onMouseEnter={() => prefetchRoute('itinerary')}
                  className={`flex items-center gap-1.5 ${isActive('/itinerary') ? 'text-orange-600 font-bold' : 'text-slate-600 hover:text-orange-600 font-medium'} transition-colors`}
                >
                  Itinerary
                </Link>
              )}
              
              {CITIES.length > 1 ? (
                <div className="relative" ref={cityMenuRef}>
                  <button 
                    onClick={() => setIsCityMenuOpen(!isCityMenuOpen)}
                    className="flex items-center space-x-1 text-sm font-medium text-slate-700 hover:text-orange-600 border border-slate-300 rounded-full px-4 py-1.5 transition-all hover:shadow-sm"
                  >
                    <span>{currentCity.name}</span>
                    <svg className={`w-4 h-4 transition-transform ${isCityMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  {isCityMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-1 border border-slate-100 z-50 animate-fade-in-down">
                      {CITIES.map(city => (
                        <button
                          key={city.id}
                          onClick={() => {
                            onCityChange(city.id);
                            setIsCityMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 first:rounded-t-xl last:rounded-b-xl"
                        >
                          {city.name}, {city.state}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-sm font-medium text-slate-700 border border-slate-200 bg-slate-50 rounded-full px-4 py-1.5 cursor-default">
                   <MapPin size={14} className="text-orange-500 mr-1" />
                   <span>{currentCity.name}, {currentCity.state}</span>
                </div>
              )}

              {isAdmin && (
                <Link 
                  to="/admin" 
                  onMouseEnter={() => prefetchRoute('admin')}
                  className="flex items-center gap-1.5 text-sm font-bold text-white bg-orange-900 hover:bg-orange-800 border border-orange-900 px-3 py-1.5 rounded-full transition-colors shadow-sm"
                >
                  <LayoutDashboard size={16} /> Admin CRM
                </Link>
              )}

              {canCreateEvent && !isAdmin && (
                <button 
                    onClick={onCreateEventClick}
                    className="flex items-center gap-1.5 text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-full transition-colors"
                >
                    <PlusCircle size={16} /> Post Event
                </button>
              )}

              {isAuthenticated && user ? (
                 <div className="relative" ref={profileMenuRef}>
                   <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    onMouseEnter={() => prefetchRoute('profile')}
                    className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-orange-600"
                   >
                     <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold overflow-hidden border border-orange-200 hover:ring-2 hover:ring-orange-100 transition-all">
                        {user.logoUrl ? (
                          <img src={user.logoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          user.firstName.charAt(0).toUpperCase()
                        )}
                     </div>
                   </button>
                   {isProfileMenuOpen && (
                     <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl py-1 border border-slate-100 z-50 animate-fade-in-down">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-bold text-slate-800 truncate">{user.businessName || `${user.firstName} ${user.lastName}`}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          <span className={`inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${user.accountType === 'Admin' ? 'text-orange-600 bg-orange-50 border-orange-100' : 'text-orange-600 bg-orange-50 border-orange-100'}`}>
                              {user.accountType}
                          </span>
                        </div>
                        <Link to="/itinerary" onMouseEnter={() => prefetchRoute('itinerary')} onClick={() => setIsProfileMenuOpen(false)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2">
                            <ClipboardList size={14} /> My Itinerary
                        </Link>
                        <Link to="/saved" onMouseEnter={() => prefetchRoute('saved')} onClick={() => setIsProfileMenuOpen(false)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2">
                            <Heart size={14} /> Saved Events
                        </Link>
                        <Link to="/profile" onMouseEnter={() => prefetchRoute('profile')} onClick={() => setIsProfileMenuOpen(false)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2">
                            <Settings size={14} /> My Profile
                        </Link>
                        <button onClick={() => { logout(); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100 rounded-b-xl">
                          <LogOut size={14} /> Sign Out
                        </button>
                     </div>
                   )}
                 </div>
              ) : (
                <button onClick={() => setIsAuthModalOpen(true)} onMouseEnter={() => prefetchModal('auth')} className="text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2 rounded-full transition-all shadow-sm hover:shadow-md">
                  Sign In
                </button>
              )}
            </div>

            <div className="md:hidden flex items-center gap-4">
               <WeatherWidget city={currentCity} />
               {isAuthenticated && user ? (
                  <Link to="/profile" className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm overflow-hidden border border-orange-200">
                    {user.logoUrl ? (
                      <img src={user.logoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user.firstName.charAt(0).toUpperCase()
                    )}
                  </Link>
               ) : (
                 <button onClick={() => setIsAuthModalOpen(true)} className="text-orange-600 font-bold text-sm">Sign In</button>
               )}
               <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-500 hover:text-orange-600 focus:outline-none">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showCategories ? 'max-h-20 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'}`}>
             <div className="flex items-center space-x-3 overflow-x-auto py-3 px-4 no-scrollbar bg-slate-50 border-t border-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] -mx-4 sm:-mx-6 lg:-mx-8 sm:px-6 lg:px-8">
                {CATEGORIES.map((cat) => {
                    const isActiveCat = activeCategory === cat.id;
                    return (
                        <Link 
                        key={cat.id} 
                        to={`/?category=${cat.id}`} 
                        className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200 border flex items-center gap-1.5 ${
                            isActiveCat 
                            ? 'bg-orange-600 text-white border-orange-600 shadow-sm scale-105' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-white hover:text-orange-600 hover:border-orange-200 hover:shadow-sm'
                        }`}
                        >
                        {cat.name}
                        </Link>
                    );
                })}
             </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 shadow-lg animate-fade-in-down absolute w-full left-0 top-full h-screen overflow-y-auto pb-20">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className={`block px-3 py-2 rounded-lg text-base font-medium ${isActive('/') ? 'text-orange-600 bg-orange-50' : 'text-slate-700 hover:bg-slate-50'}`}>Explore</Link>
              {isAuthenticated && (
                <>
                <Link to="/itinerary" onClick={() => setIsMenuOpen(false)} onMouseEnter={() => prefetchRoute('itinerary')} className={`block px-3 py-2 rounded-lg text-base font-medium ${isActive('/itinerary') ? 'text-orange-600 bg-orange-50' : 'text-slate-700 hover:bg-slate-50'}`}>My Itinerary</Link>
                <Link to="/saved" onClick={() => setIsMenuOpen(false)} onMouseEnter={() => prefetchRoute('saved')} className={`block px-3 py-2 rounded-lg text-base font-medium ${isActive('/saved') ? 'text-orange-600 bg-orange-50' : 'text-slate-700 hover:bg-slate-50'}`}>Saved Events</Link>
                </>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsMenuOpen(false)} onMouseEnter={() => prefetchRoute('admin')} className="block px-3 py-2 rounded-lg text-base font-medium text-orange-700 bg-orange-50">Admin CRM</Link>
              )}
              {canCreateEvent && (
                  <button onClick={() => { if (onCreateEventClick) onCreateEventClick(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-orange-600 bg-orange-50 rounded-lg">+ Post New Event</button>
              )}
              {CITIES.length > 1 && (
                <div className="border-t border-slate-100 mt-2 pt-2">
                  <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Switch City</p>
                  {CITIES.map(city => (
                    <button key={city.id} onClick={() => { onCityChange(city.id); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-600 hover:text-orange-600 rounded-lg hover:bg-slate-50">{city.name}</button>
                  ))}
                </div>
              )}
              {isAuthenticated && (
                <div className="border-t border-slate-100 mt-2 pt-2">
                   <Link to="/profile" onClick={() => setIsMenuOpen(false)} onMouseEnter={() => prefetchRoute('profile')} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg">My Profile</Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg">Sign Out</button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      <Suspense fallback={null}>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </Suspense>
    </>
  );
};

export default Header;