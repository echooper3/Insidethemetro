
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Heart, Calendar, Search } from 'lucide-react';
import EventCard from '../components/EventCard';
import { EventRecommendation } from '../types';

const SavedEvents: React.FC = () => {
  const { user, savedEvents } = useAuth();
  const [filter, setFilter] = useState('');

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const filteredEvents = savedEvents.filter(event => 
    event.name.toLowerCase().includes(filter.toLowerCase()) || 
    (event.category && event.category.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Heart className="text-red-600 fill-current" /> My Saved Events
            </h1>
            <p className="text-slate-500 mt-2">
              Your personal collection of upcoming activities. Events are automatically removed after they expire.
            </p>
          </div>
          
          <div className="relative w-full md:w-auto min-w-[300px]">
             <Search className="absolute left-3 top-3 text-slate-400" size={18} />
             <input 
                type="text" 
                placeholder="Search saved events..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
             />
          </div>
        </div>

        {/* Content */}
        {savedEvents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Heart size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Saved Events Yet</h3>
                <p className="text-slate-500 mb-8">
                    Browse the explore page to find events you're interested in and tap the heart icon to save them here.
                </p>
                <Link 
                    to="/"
                    className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all hover:-translate-y-1"
                >
                    Explore Events
                </Link>
            </div>
        ) : (
            <>
                {filteredEvents.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        No events match your search "{filter}".
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {filteredEvents.map((event, idx) => (
                            <EventCard key={`saved-${idx}-${event.id}`} event={event} />
                        ))}
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default SavedEvents;
