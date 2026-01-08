import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import EventCard from './EventCard';
import AdSpace from './AdSpace';
import { Clock } from 'lucide-react';
import { EventRecommendation } from '../types';

interface RecentlyViewedProps {
  onEventClick: (event: EventRecommendation) => void;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ onEventClick }) => {
    const { recentlyViewed } = useAuth();

    if (recentlyViewed.length === 0) return null;

    return (
        <div className="mt-12 mb-8 animate-fade-in border-t border-slate-200 pt-10">
            <div className="flex items-center gap-2 mb-6 px-1">
                <Clock className="text-orange-600" size={20} />
                <h3 className="text-xl font-bold text-slate-800">Recently Viewed</h3>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-6 -mx-4 px-4 scroll-smooth no-scrollbar">
                {recentlyViewed.map((event, idx) => (
                    <React.Fragment key={`recent-${idx}`}>
                        <div className="min-w-[300px] sm:min-w-[350px] max-w-[350px]">
                            <EventCard event={event} onClick={() => onEventClick(event)} />
                        </div>
                        {/* Insert Ad after every 3rd item */}
                        {(idx + 1) % 3 === 0 && (
                            <div className="min-w-[300px] sm:min-w-[350px] max-w-[350px]">
                                <AdSpace 
                                    size="small" 
                                    title="Local Partner" 
                                    advertiserName="City Deals"
                                    description="Exclusive offers for our frequent explorers."
                                    imageUrl={`https://picsum.photos/400/300?random=${idx + 100}`}
                                />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};
export default RecentlyViewed;