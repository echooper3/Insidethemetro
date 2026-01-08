
import React from 'react';
import { ExternalLink, Info, Mail } from 'lucide-react';

/**
 * AD PLACEMENT GUIDE FOR ADMIN:
 * 1. Small: Used in Grids (Home feed, Related events). Best for 400x300 images.
 * 2. Medium: Wide banners (Home header, Modal footer). Best for 1200x200 images.
 * 3. Large: High impact (Bottom of Home). Best for 1200x400 images.
 */

export type AdSize = 'small' | 'medium' | 'large';

interface AdSpaceProps {
  size: AdSize;
  title?: string; // Leaving this blank triggers the "Place Your Ad Here" state
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  advertiserName?: string;
  className?: string;
}

const AdSpace: React.FC<AdSpaceProps> = ({ 
  size, 
  title, 
  description, 
  imageUrl, 
  linkUrl = "#", 
  advertiserName,
  className = ""
}) => {
  const isPlaceholder = !title;
  
  const displayTitle = title || "Your Business Here";
  const displayDesc = description || "Reach locals and visitors in Houston's fastest growing event guide. Contact us for rates.";
  const displayAdvertiser = advertiserName || "Inside The Metro Partner";
  const displayImage = imageUrl || (
    size === 'medium' 
      ? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80" 
      : size === 'large' 
        ? "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
        : "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=800&q=80"
  );

  // Email inquiry generator for placeholders
  let activeLinkUrl = linkUrl;
  if (isPlaceholder) {
      const subject = encodeURIComponent(`Ad Placement Inquiry: ${size.toUpperCase()} Slot`);
      const body = encodeURIComponent(`Hello Inside The Metro Sales Team,\n\nI'm interested in the ${size} ad space I saw on your site.\n\nBusiness Name:\nWebsite:\nPhone:`);
      activeLinkUrl = `mailto:advertise@insidethemetro.com?subject=${subject}&body=${body}`;
  }

  const handleAdClick = () => {
    console.log(`[Ad Analytics] Click on ${displayAdvertiser} (${size})`);
  };

  if (size === 'small') {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group flex flex-col h-full ${className}`}>
        <div className="absolute top-3 left-3 z-10 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          Sponsored
        </div>
        <div className="h-48 overflow-hidden bg-slate-100">
          <img 
            src={displayImage} 
            alt={displayTitle} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
        <div className="p-5 flex flex-col flex-1">
          <p className="text-[10px] font-bold text-orange-600 mb-1 uppercase tracking-widest">{displayAdvertiser}</p>
          <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{displayTitle}</h3>
          <p className="text-slate-500 text-sm mb-4 line-clamp-3 flex-grow">{displayDesc}</p>
          <a 
            href={activeLinkUrl} 
            onClick={handleAdClick}
            className="mt-auto w-full py-2 bg-slate-900 text-white text-sm font-bold rounded-lg text-center hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
          >
            {isPlaceholder ? <><Mail size={14}/> Contact Sales</> : <><ExternalLink size={14}/> Visit Site</>}
          </a>
        </div>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className={`w-full ${className}`}>
        <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg relative group border border-slate-800">
           <div className="absolute top-2 right-2 text-[10px] text-white/40 uppercase border border-white/10 px-1.5 rounded">Partner Spot</div>
           <div className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/4 h-32 md:h-24 overflow-hidden relative">
                 <img src={displayImage} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt="Ad" />
                 {isPlaceholder && <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-[10px] font-bold uppercase tracking-widest">Available</div>}
              </div>
              <div className="flex-1 p-4 md:p-6 text-center md:text-left text-white">
                 <h4 className="font-bold text-lg leading-tight mb-1">{displayTitle}</h4>
                 <p className="text-slate-400 text-sm">{displayDesc}</p>
              </div>
              <div className="p-4 md:pr-6 flex-shrink-0">
                <a 
                  href={activeLinkUrl} 
                  className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-8 rounded-full text-sm transition-all shadow-lg hover:shadow-orange-900/20"
                >
                  {isPlaceholder ? "Advertise" : "Check It Out"}
                </a>
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (size === 'large') {
    return (
      <div className={`w-full ${className}`}>
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 bg-slate-50 text-slate-400 text-[10px] font-bold px-4 py-2 rounded-bl-2xl">Official Partner Content</div>
           <div className="relative z-10 flex flex-col items-center">
             <p className="text-orange-600 font-bold tracking-widest uppercase text-xs mb-4">{displayAdvertiser}</p>
             <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 max-w-2xl">{displayTitle}</h3>
             <p className="text-slate-500 max-w-xl mx-auto mb-10 text-lg leading-relaxed">{displayDesc}</p>
             <a 
               href={activeLinkUrl} 
               className="bg-slate-900 hover:bg-orange-600 text-white text-lg font-extrabold py-4 px-12 rounded-2xl shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95"
             >
               {isPlaceholder ? "Partner with Us" : "Learn More"}
             </a>
           </div>
           {/* Abstract background shapes */}
           <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-50 rounded-full opacity-50 blur-3xl"></div>
           <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-50 rounded-full opacity-50 blur-3xl"></div>
        </div>
      </div>
    );
  }

  return null;
};

export default AdSpace;
