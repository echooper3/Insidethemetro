import React, { useState, memo } from 'react';
import { MapPin, Calendar, DollarSign, Heart, Share2, Star, Zap, Eye, Link as LinkIcon, Check, User as UserIcon, Globe } from 'lucide-react';
import { EventRecommendation } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORY_IMAGES } from '../constants';
import { formatLocalTime } from '../utils';

interface EventCardProps {
  event: EventRecommendation;
  onClick?: () => void;
}

// Memoize to prevent unnecessary re-renders during parent updates
const EventCard: React.FC<EventCardProps> = memo(({ event, onClick }) => {
  const { 
    isAuthenticated, 
    toggleSaveEvent, 
    isEventSaved, 
    toggleInterestEvent, 
    isEventInterested,
    addToRecentlyViewed,
    recentlyViewed
  } = useAuth();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isStarAnimating, setIsStarAnimating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Guard against null event
  if (!event) return null;

  const isSaved = isEventSaved(event);
  const isInterested = isEventInterested(event);
  const isSponsored = !!event.isSponsored;

  // Check if event is in recently viewed list
  const isViewed = recentlyViewed.some(e => 
    (e.id && event.id && e.id === event.id) || 
    (!e.id && e.name === event.name && e.location && event.location && e.location.address === event.location.address)
  );

  const handleInteraction = () => {
    addToRecentlyViewed(event);
  };

  const handleCardClick = () => {
    handleInteraction();
    if (onClick) onClick();
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleInteraction();
    
    // Trigger animation
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 400);

    if (isAuthenticated) {
      toggleSaveEvent(event);
    } else {
      alert("Please sign in to save events to your profile.");
    }
  };

  const handleInterestClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleInteraction();

    // Trigger animation
    setIsStarAnimating(true);
    setTimeout(() => setIsStarAnimating(false), 400);

    if (isAuthenticated) {
      toggleInterestEvent(event);
    } else {
      alert("Please sign in to mark interest.");
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleInteraction();

    let url = event.website;
    if (!url && event.location && event.location.address) {
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.name + ' ' + event.location.address)}`;
    }
    
    try {
        await navigator.clipboard.writeText(url || window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
  };

  const handleViewedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToRecentlyViewed(event);
  };

  const getShareableMedia = () => {
      if (event.imageUrl) return { url: event.imageUrl, isVideo: false };
      if (event.videoUrl) return { url: event.videoUrl, isVideo: true };
      if (event.organizer?.logoUrl) return { url: event.organizer.logoUrl, isVideo: false };
      return { url: CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES['default'], isVideo: false };
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleInteraction();
    
    const address = event.location?.address || 'Unknown Location';
    const shareData: any = {
      title: event.name,
      text: `Check out ${event.name} in ${address}! ${event.description || ''}`,
      url: event.website || window.location.href
    };

    try {
      if (navigator.share) {
        let shared = false;
        const media = getShareableMedia();
        
        if (media.url && navigator.canShare) {
            try {
                const response = await fetch(media.url, { mode: 'cors' });
                if (response.ok) {
                    const blob = await response.blob();
                    let mimeType = blob.type || (media.isVideo ? 'video/mp4' : 'image/jpeg');
                    let ext = mimeType.split('/')[1] || (media.isVideo ? 'mp4' : 'jpg');
                    const file = new File([blob], `event_share.${ext}`, { type: mimeType });
                    const dataWithFile = { ...shareData, files: [file] };
                    if (navigator.canShare(dataWithFile)) {
                        await navigator.share(dataWithFile);
                        shared = true;
                    }
                }
            } catch (fetchErr) {
                console.warn("Media share failed, falling back to text.");
            }
        }

        if (!shared) {
            await navigator.share(shareData);
        }
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        alert("Event details copied to clipboard!");
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Error sharing:", err);
      }
    }
  };

  const toggleDescription = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const getPriceDisplay = () => {
    if (event.price) {
        const p = event.price.trim();
        const lower = p.toLowerCase();
        if (p && !['varies', 'unknown', 'n/a', 'tbd', ''].includes(lower)) {
            if (lower === '0' || lower === '$0' || lower === 'free') return 'Free';
            return p;
        }
    }
    if (event.priceLevel) {
        if (event.priceLevel === 'Free' || event.priceLevel === '0' || event.priceLevel === '$0') return 'Free';
        return event.priceLevel;
    }
    return 'See details';
  };

  const priceDisplay = getPriceDisplay();
  const isFree = priceDisplay.toLowerCase() === 'free';
  const TRUNCATE_LIMIT = 100;
  const description = event.description || '';
  const shouldTruncate = description.length > TRUNCATE_LIMIT;
  const displayDescription = isExpanded || !shouldTruncate ? description : description.slice(0, TRUNCATE_LIMIT) + '...';

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 overflow-hidden flex flex-col h-full relative group cursor-pointer ${isSponsored ? 'border-2 border-amber-200 ring-4 ring-amber-50/50' : 'border border-slate-200'}`}
      onClick={handleCardClick}
    >
      <div className="px-5 pt-5 pb-2 flex justify-between items-start">
         <div className="flex flex-col gap-2 items-start">
            {isSponsored && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold tracking-widest text-white bg-amber-500 px-2 py-1 rounded shadow-sm uppercase border border-amber-400">
                <Zap size={10} className="fill-current" /> Sponsored
              </span>
            )}
            <span className="text-xs font-extrabold tracking-widest uppercase px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
              {event.category || 'Event'}
            </span>
            {event.ageRestriction && (
              <span className="inline-flex items-center text-[10px] font-bold tracking-wider text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100">
                {event.ageRestriction}
              </span>
            )}
        </div>

        <div className="flex gap-1">
           <button
            onClick={handleViewedClick}
            className={`p-2 rounded-full transition-colors duration-200 ${isViewed ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-50'}`}
            title={isViewed ? "Recently Viewed" : "Mark as Viewed"}
          >
            <Eye size={18} />
          </button>
           <button
            onClick={handleCopyLink}
            className={`p-2 rounded-full transition-colors duration-200 ${isCopied ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:text-orange-600 hover:bg-slate-50'}`}
            title={isCopied ? "Link Copied!" : "Copy Link"}
          >
            {isCopied ? <Check size={18} /> : <LinkIcon size={18} />}
          </button>
           <button
            onClick={handleInterestClick}
            className={`p-2 rounded-full transition-all duration-300 ${isInterested ? 'text-amber-500 bg-amber-50 scale-105' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-50'} ${isStarAnimating ? 'scale-110' : ''}`}
            title={isInterested ? "Not Interested" : "Interested"}
          >
            <Star size={18} fill={isInterested ? "currentColor" : "none"} className={`transition-transform duration-300 ${isStarAnimating ? "star-pulse" : ""}`} />
          </button>
          <button onClick={handleShareClick} className="p-2 rounded-full text-slate-400 hover:text-orange-600 hover:bg-slate-50 transition-colors duration-200" title="Share via...">
            <Share2 size={18} />
          </button>
          <button
            onClick={handleSaveClick}
            className={`p-2 rounded-full transition-all duration-300 border ${isSaved ? 'text-red-600 bg-red-100 border-red-200 scale-105 shadow-sm' : 'text-slate-400 bg-transparent border-transparent hover:text-red-600 hover:bg-slate-50'} ${isLikeAnimating ? 'scale-125' : ''}`}
            title={isSaved ? "Remove from saved" : "Save event"}
          >
            <Heart size={18} fill={isSaved ? "currentColor" : "none"} className={`transition-transform duration-300 ${isLikeAnimating ? "heart-burst" : ""}`} />
          </button>
        </div>
     </div>

      <div className="px-5 py-4 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-orange-600 transition-colors">{event.name}</h3>
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {event.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}
        <p className="text-slate-600 text-sm mb-4">
          {displayDescription}
          {shouldTruncate && (
            <button onClick={toggleDescription} className="ml-1 text-orange-600 font-bold hover:text-orange-800 text-xs uppercase tracking-wide inline-flex items-center hover:underline focus:outline-none">
              {isExpanded ? 'Read Less' : 'Read More'}
            </button>
          )}
        </p>
        <div className="mt-auto space-y-2 text-sm text-slate-500 pt-3 border-t border-slate-50">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 flex-shrink-0 text-orange-500" />
            <span className="truncate">{event.location?.address || 'Location TBD'}</span>
          </div>
          {event.date && (
            <div className="flex items-center gap-2">
              <Calendar size={16} className="flex-shrink-0 text-orange-500" />
              <span>{formatLocalTime(event.date)}</span>
            </div>
          )}
          {event.organizer?.name && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
               <UserIcon size={12} className="flex-shrink-0" />
               <span>Hosted by {event.organizer.name}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className={`px-5 py-4 border-t flex justify-between items-center gap-2 transition-colors ${isSponsored ? 'border-amber-100 bg-amber-50/20' : 'border-slate-100 bg-slate-50/50'}`}>
        <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); handleCardClick(); }} className={`text-sm font-bold px-3 py-2 sm:px-4 rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95 ${isSponsored ? 'bg-amber-500 text-white hover:bg-amber-600 border border-amber-600' : 'bg-orange-600 text-white hover:bg-orange-700 border border-orange-700'}`}>
              <Eye size={16} /> <span className="hidden xs:inline">View Details</span> <span className="inline xs:hidden">View</span>
            </button>
            {event.website && (
                <a href={event.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className={`text-sm font-bold px-3 py-2 sm:px-4 rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95 border ${isSponsored ? 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50' : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50'}`}>
                    <Globe size={16} /> <span className="hidden sm:inline">Visit Website</span> <span className="inline sm:hidden">Web</span>
                </a>
            )}
        </div>
        <span className={`text-sm font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1 shadow-sm whitespace-nowrap ml-auto ${isFree ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-900 text-white border-slate-900'}`}>
           {!isFree && <DollarSign size={12} className={isFree ? "text-emerald-700" : "text-white"} />} 
           {priceDisplay}
        </span>
      </div>
    </div>
  );
});

export default EventCard;