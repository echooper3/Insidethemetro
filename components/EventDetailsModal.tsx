
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, MapPin, Calendar, DollarSign, Navigation, Globe, Share2, Heart, ChevronDown, ChevronUp, ArrowRight, User, CalendarPlus, Download, Mail, Phone, Play, Tag, AlertCircle, Star, Filter } from 'lucide-react';
import { EventRecommendation } from '../types';
import { useAuth } from '../contexts/AuthContext';
import AdSpace from './AdSpace';
import { CATEGORY_IMAGES, CATEGORIES, CITY_ADS, CITIES } from '../constants';
import { formatLocalTime } from '../utils';

interface EventDetailsModalProps {
  event: EventRecommendation | null;
  isOpen: boolean;
  onClose: () => void;
  allEvents?: EventRecommendation[];
  onEventSelect?: (event: EventRecommendation) => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ 
  event, 
  isOpen, 
  onClose,
  allEvents = [],
  onEventSelect
}) => {
  const { toggleSaveEvent, isEventSaved } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Rating State
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Related Events Filter State
  const [relatedCategoryFilter, setRelatedCategoryFilter] = useState<string>('All');
  const [relatedStartDate, setRelatedStartDate] = useState<string>('');
  const [relatedEndDate, setRelatedEndDate] = useState<string>('');

  const calendarRef = useRef<HTMLDivElement>(null);

  // Helper to find which city this event belongs to
  const eventCitySet = useMemo(() => {
    if (!event) return CITY_ADS['houston'];
    if (event.cityId) return CITY_ADS[event.cityId] || CITY_ADS['houston'];
    
    // Fallback: search for city in address
    const cityInAddress = CITIES.find(c => event.location?.address.toLowerCase().includes(c.name.toLowerCase()));
    return cityInAddress ? CITY_ADS[cityInAddress.id] : CITY_ADS['houston'];
  }, [event]);

  // Reset states when event changes or modal opens
  useEffect(() => {
    if (isOpen && event) {
      setIsExpanded(false);
      setIsCalendarOpen(false);
      setLogoError(false);
      setImageError(false);
      
      // Reset Related Filters
      setRelatedCategoryFilter('All');
      setRelatedStartDate('');
      setRelatedEndDate('');

      // Load Rating from LocalStorage
      try {
        const storedRatings = JSON.parse(localStorage.getItem('in_my_city_user_ratings') || '{}');
        const key = event.id || event.name;
        setUserRating(storedRatings[key] || 0);
      } catch (e) {
        setUserRating(0);
      }
    }
  }, [event, isOpen]);

  // Click outside listener for calendar dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  const handleRate = (rating: number) => {
    if (!event) return;
    setUserRating(rating);
    try {
      const storedRatings = JSON.parse(localStorage.getItem('in_my_city_user_ratings') || '{}');
      const key = event.id || event.name; 
      storedRatings[key] = rating;
      localStorage.setItem('in_my_city_user_ratings', JSON.stringify(storedRatings));
    } catch (e) {
      console.error("Failed to save rating");
    }
  };

  const relatedEvents = useMemo(() => {
    if (!event || !allEvents || allEvents.length === 0) return [];
    
    let others = allEvents.filter(e => {
        if (!e) return false;
        if (e.id && event.id) return e.id !== event.id;
        if (e.name === event.name) {
            if (!e.location && !event.location) return false;
            if (e.location && event.location && e.location.address === event.location.address) return false;
        }
        return true;
    });

    if (relatedCategoryFilter !== 'All') {
        others = others.filter(e => e.category === relatedCategoryFilter);
    }

    if (relatedStartDate) {
        others = others.filter(e => {
            if (!e.date) return false;
            const eDate = new Date(e.date);
            const start = new Date(relatedStartDate);
            return !isNaN(eDate.getTime()) && eDate >= start;
        });
    }

    if (relatedEndDate) {
        others = others.filter(e => {
            if (!e.date) return false;
            const eDate = new Date(e.date);
            const end = new Date(relatedEndDate);
            end.setHours(23, 59, 59);
            return !isNaN(eDate.getTime()) && eDate <= end;
        });
    }
    
    const scored = others.map(e => {
        let score = 0;
        if (e.category && event.category && e.category.toLowerCase() === event.category.toLowerCase()) score += 2;
        if (e.location && event.location && e.location.address === event.location.address) score += 1;
        if (e.isSponsored) score += 0.5;
        return { event: e, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3).map(item => item.event);
  }, [event, allEvents, relatedCategoryFilter, relatedStartDate, relatedEndDate]);

  const getLogoUrlFromWebsite = (urlStr?: string) => {
    if (!urlStr) return null;
    try {
        const url = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
        return `https://logo.clearbit.com/${url.hostname}`;
    } catch (e) {
        return null;
    }
  };

  const getHeaderImageUrl = () => {
      if (!event) return '';
      const organizerLogo = event.organizer?.logoUrl || getLogoUrlFromWebsite(event.organizer?.website);
      if (imageError || !event.imageUrl) {
          return organizerLogo || (event.category ? CATEGORY_IMAGES[event.category] : CATEGORY_IMAGES['default']) || CATEGORY_IMAGES['default'];
      }
      return event.imageUrl;
  };
  const headerImage = getHeaderImageUrl();

  if (!isOpen || !event) return null;

  const isSaved = isEventSaved(event);
  const handleSave = () => toggleSaveEvent(event);

  const handleShare = async () => {
    const shareData: any = {
      title: event.name,
      text: `Check out ${event.name} in ${event.location?.address || 'Houston'}! ${event.description || ''}`,
      url: event.website || window.location.href
    };

    try {
      if (navigator.share) {
        let shared = false;
        try {
          if (headerImage && navigator.canShare) {
            const response = await fetch(headerImage, { mode: 'cors' });
            if (response.ok) {
              const blob = await response.blob();
              const extension = blob.type.split('/')[1] || 'jpg';
              const file = new File([blob], `event_preview.${extension}`, { type: blob.type });
              const dataWithFile = { ...shareData, files: [file] };
              if (navigator.canShare(dataWithFile)) {
                await navigator.share(dataWithFile);
                shared = true;
              }
            }
          }
        } catch (imgError) {
          console.warn("Could not share image file, falling back to basic share");
        }
        if (!shared) await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        alert('Event details copied to clipboard');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') console.error("Error sharing:", err);
    }
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.name + ' ' + (event.location?.address || ''))}`;

  const MAX_LENGTH = 250;
  const description = event.description || '';
  const isLongDescription = description.length > MAX_LENGTH;
  const displayDescription = isExpanded || !isLongDescription ? description : description.slice(0, MAX_LENGTH) + '...';

  const priceDisplay = (event.price || event.priceLevel || 'See details').replace(/^\$?0$/, 'Free');
  const isFree = priceDisplay.toLowerCase() === 'free';
  const organizerLogoUrl = event.organizer?.logoUrl || getLogoUrlFromWebsite(event.organizer?.website);
  const displayVideoUrl = event.videoUrl || event.organizer?.videoUrl;
  const hasVideo = !!displayVideoUrl;

  const generateCalendarData = () => {
    let startDate: Date;
    const now = new Date();
    if (event.date) {
        const parsed = new Date(event.date);
        startDate = !isNaN(parsed.getTime()) ? parsed : new Date(now.setDate(now.getDate() + 1));
    } else {
        startDate = new Date(now.setDate(now.getDate() + 1));
    }
    const endDate = new Date(startDate.getTime() + 7200000); 
    const formatTime = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, "");
    return {
      google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${formatTime(startDate)}/${formatTime(endDate)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(event.location?.address || '')}&sf=true&output=xml`,
      outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.name)}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(event.location?.address || '')}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}`,
      startDate, endDate
    };
  };

  const downloadICS = () => {
    const { startDate, endDate } = generateCalendarData();
    const formatICSDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, "");
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${formatICSDate(startDate)}\nDTEND:${formatICSDate(endDate)}\nSUMMARY:${event.name}\nDESCRIPTION:${description.replace(/\n/g, '\\n')}\nLOCATION:${event.location?.address}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${event.name}.ics`);
    link.click();
    setIsCalendarOpen(false);
  };

  const calendarData = generateCalendarData();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
       <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-scale-up relative max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="h-48 sm:h-64 relative flex items-center justify-center overflow-hidden flex-shrink-0 bg-slate-900">
              {hasVideo ? (
                <video src={displayVideoUrl} className="w-full h-full object-cover" controls playsInline poster={headerImage} />
              ) : (
                <img src={headerImage} alt={event.name} className="w-full h-full object-cover opacity-90" onError={() => setImageError(true)} />
              )}
              <div className="absolute top-4 left-4 z-20">
                  <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">{event.category}</span>
              </div>
              <button onClick={onClose} className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors z-20 backdrop-blur-sm"><X size={24} /></button>
          </div>

          <div className="flex-1 overflow-y-auto">
             <div className="flex flex-col lg:flex-row">
                 <div className="p-6 sm:p-8 flex-1">
                     <div className="flex justify-between items-start mb-2">
                        <div className="w-full">
                           <div className="flex justify-between items-start">
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 leading-tight">{event.name}</h1>
                                <div className="flex gap-2 flex-shrink-0 ml-4 relative">
                                    <div className="relative" ref={calendarRef}>
                                        <button onClick={() => setIsCalendarOpen(!isCalendarOpen)} className="p-2.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors border border-slate-200"><CalendarPlus size={20} /></button>
                                        {isCalendarOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-fade-in-up">
                                            <a href={calendarData.google} target="_blank" rel="noopener noreferrer" className="block px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-medium">Google Calendar</a>
                                            <a href={calendarData.outlook} target="_blank" rel="noopener noreferrer" className="block px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-medium border-t border-slate-50">Outlook Web</a>
                                            <button onClick={downloadICS} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-medium border-t border-slate-50 flex items-center justify-between">Download .ics <Download size={14} /></button>
                                        </div>
                                        )}
                                    </div>
                                    <button onClick={handleShare} className="p-2.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors border border-slate-200"><Share2 size={20} /></button>
                                    <button onClick={handleSave} className={`p-2.5 rounded-full transition-all duration-200 border ${isSaved ? 'text-red-600 bg-red-100 border-red-300 scale-105' : 'text-slate-400 hover:text-red-600 hover:bg-red-50 border-slate-200'}`}><Heart size={20} fill={isSaved ? "currentColor" : "none"} /></button>
                                </div>
                           </div>
                           <div className="flex items-center gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (<Star key={star} onClick={() => handleRate(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} size={18} className={`${(hoverRating || userRating) >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />))}
                           </div>
                           <div className="flex flex-wrap gap-2 mb-4 text-sm font-medium">
                              <span className={`px-3 py-1 rounded-full ${isFree ? 'bg-green-100 text-green-800' : 'bg-orange-50 text-orange-700'}`}>{priceDisplay}</span>
                              {event.date && <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full">{formatLocalTime(event.date)}</span>}
                           </div>
                        </div>
                     </div>
                     <p className="text-lg text-slate-600 leading-relaxed mb-8">{displayDescription}{isLongDescription && <button onClick={() => setIsExpanded(!isExpanded)} className="ml-2 text-orange-600 font-bold hover:underline">{isExpanded ? 'Read Less' : 'Read More'}</button>}</p>
                     <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-8"><h3 className="font-semibold mb-2 flex items-center gap-2"><MapPin size={18} className="text-orange-600" /> Location</h3><p className="text-slate-600 mb-4">{event.location?.address}</p><div className="flex gap-3"><a href={mapsUrl} target="_blank" className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Get Directions</a>{event.website && <a href={event.website} target="_blank" className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium">Website</a>}</div></div>
                 </div>
                 <div className="lg:w-80 lg:border-l border-slate-100 p-6 bg-slate-50/50">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">Sponsored</h4>
                    <AdSpace size="small" {...eventCitySet.small} />
                 </div>
             </div>
             <div className="px-6 sm:px-8 pb-2"><AdSpace size="medium" {...eventCitySet.medium} className="mb-6" /></div>
             <div className="border-t border-slate-200 p-6 sm:p-8 bg-slate-50"><h3 className="text-lg font-bold mb-6">You Might Also Like</h3><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">{relatedEvents.map((related, idx) => (<div key={idx} onClick={() => onEventSelect?.(related)} className="group border border-slate-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer bg-white"><div className="flex justify-between mb-2"><span className="text-[10px] font-bold uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{related.category}</span><ArrowRight size={16} className="text-slate-400 group-hover:text-orange-500" /></div><h4 className="font-bold text-sm mb-1 line-clamp-1">{related.name}</h4><p className="text-xs text-slate-500 line-clamp-1">{related.location?.address}</p></div>))}</div></div>
          </div>
       </div>
    </div>
  );
};

export default EventDetailsModal;
