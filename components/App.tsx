import React, { useState, Suspense, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import Header from './components/Header';
import { CITIES } from './constants';
import { City } from './types';
import { AuthProvider } from './contexts/AuthContext';
import { MessageSquarePlus, Bot, Loader2, HelpCircle, Mail } from 'lucide-react';

// Lazy load pages
const Home = React.lazy(() => import('./pages/Home'));
const Planner = React.lazy(() => import('./pages/Planner'));
const AdminCRM = React.lazy(() => import('./AdminCRM')); // Fixed path from ./pages/AdminCRM
const Itinerary = React.lazy(() => import('./pages/Itinerary'));
const SavedEvents = React.lazy(() => import('./pages/SavedEvents'));
const OrganizerProfile = React.lazy(() => import('./pages/OrganizerProfile'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const Contact = React.lazy(() => import('./pages/Contact'));

// Lazy load modals
const FeedbackModal = React.lazy(() => import('./components/FeedbackModal'));
const CreateEventModal = React.lazy(() => import('./components/CreateEventModal'));

const PlannerFAB = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/planner' || location.pathname === '/admin' || location.pathname === '/itinerary') return null;

  return (
    <button
      onClick={() => navigate('/planner')}
      onMouseEnter={() => import('./pages/Planner')}
      className="fixed bottom-6 right-6 z-40 bg-orange-600 hover:bg-orange-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 group flex items-center gap-2"
      title="Open AI Planner"
    >
      <Bot size={24} />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-medium">
        AI Planner
      </span>
    </button>
  );
};

const App: React.FC = () => {
  const [currentCity, setCurrentCity] = useState<City>(
      (CITIES && CITIES.length > 0) ? CITIES[0] : { id: 'default', name: 'Loading', state: '', image: '', coordinates: [0,0] }
  );
  
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  useEffect(() => {
    const prefetchRoutes = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        const routePromises = [
          import('./pages/Home'),
          import('./pages/Planner'),
          import('./AdminCRM'), // Fixed path
          import('./pages/Itinerary'),
          import('./pages/SavedEvents'),
          import('./pages/OrganizerProfile'),
          import('./pages/FAQ'),
          import('./pages/Contact')
        ];
        await Promise.all(routePromises);
      } catch (e) {
        console.warn("Error prefetching routes", e);
      }
    };
    
    prefetchRoutes();
  }, []);

  const handleCityChange = (cityId: string) => {
    const city = CITIES.find(c => c.id === cityId);
    if (city) {
      setCurrentCity(city);
    }
  };

  const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={48} className="text-orange-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );

  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 relative">
          <Header 
            currentCity={currentCity} 
            onCityChange={handleCityChange} 
            onCreateEventClick={() => setIsCreateEventOpen(true)}
          />
          
          <main className="flex-grow">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home currentCity={currentCity} />} />
                <Route path="/planner" element={<Planner currentCity={currentCity} />} />
                <Route path="/itinerary" element={<Itinerary />} />
                <Route path="/admin" element={<AdminCRM />} />
                <Route path="/saved" element={<SavedEvents />} />
                <Route path="/profile" element={<OrganizerProfile />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </Suspense>
          </main>
          
          <PlannerFAB />

          <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                 <div className="col-span-1 md:col-span-1">
                    <h3 className="font-bold text-slate-800 text-lg mb-4">Inside The Metro</h3>
                    <p className="text-slate-500 text-sm mb-4">
                      Your AI-powered guide to discovering local events, food, and culture across Texas and Oklahoma.
                    </p>
                    <button 
                      onClick={() => setIsFeedbackOpen(true)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 hover:text-orange-800 bg-orange-50 px-4 py-2 rounded-full transition-colors"
                    >
                      <MessageSquarePlus size={14} /> Report Issue
                    </button>
                 </div>

                 <div>
                    <h4 className="font-bold text-slate-900 text-sm uppercase tracking-widest mb-4">Explore</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                       <li><Link to="/" className="hover:text-orange-600 transition-colors">Find Events</Link></li>
                       <li><Link to="/planner" className="hover:text-orange-600 transition-colors">AI Planner</Link></li>
                       <li><Link to="/itinerary" className="hover:text-orange-600 transition-colors">My Itinerary</Link></li>
                    </ul>
                 </div>

                 <div>
                    <h4 className="font-bold text-slate-900 text-sm uppercase tracking-widest mb-4">Support</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                       <li><Link to="/faq" className="hover:text-orange-600 transition-colors flex items-center gap-2"><HelpCircle size={14} /> FAQ</Link></li>
                       <li><Link to="/contact" className="hover:text-orange-600 transition-colors flex items-center gap-2"><Mail size={14} /> Contact Us</Link></li>
                       <li><Link to="/contact" className="hover:text-orange-600 transition-colors flex items-center gap-2">Ad Rates</Link></li>
                    </ul>
                 </div>

                 <div>
                    <h4 className="font-bold text-slate-900 text-sm uppercase tracking-widest mb-4">Organizers</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                       <li><button onClick={() => setIsCreateEventOpen(true)} className="hover:text-orange-600 transition-colors">Post an Event</button></li>
                       <li><Link to="/profile" className="hover:text-orange-600 transition-colors">Manage Listings</Link></li>
                       <li><Link to="/contact" className="hover:text-orange-600 transition-colors">Business Solutions</Link></li>
                    </ul>
                 </div>
              </div>

              <div className="border-t border-slate-100 pt-8 text-center sm:flex sm:items-center sm:justify-between">
                <p className="text-slate-500 text-xs">
                  © {new Date().getFullYear()} Inside The Metro. All rights reserved.
                </p>
                <div className="mt-4 sm:mt-0 flex justify-center gap-6">
                    <span className="text-slate-400 text-[10px] uppercase tracking-tighter">Information provided by Google Gemini. Verify details with venues.</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
        
        <Suspense fallback={null}>
            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
            <CreateEventModal isOpen={isCreateEventOpen} onClose={() => setIsCreateEventOpen(false)} />
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;