
import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar, MapPin, DollarSign, Image as ImageIcon, Send, FileText, Tag, Video, Upload, Link as LinkIcon, AlertCircle, Trash2, Info, Eye, Clock, Loader2, ChevronDown, Check, Locate } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES } from '../constants';
import { geocodeAddress } from '../services/geminiService';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose }) => {
  const { createEvent, user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Community',
    address: '',
    date: '',
    price: '',
    website: '',
    imageUrl: '',
    videoUrl: '',
    eventStatus: 'Scheduled',
    visibility: 'Public'
  });
  
  // UI State for Upload vs Link tabs
  const [imageInputMode, setImageInputMode] = useState<'link' | 'upload'>('upload');
  const [videoInputMode, setVideoInputMode] = useState<'link' | 'upload'>('link');
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Dropdown States
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  // Address Autocomplete State
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{lat: number, lng: number} | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const addressTimeoutRef = useRef<number | null>(null);
  const addressContainerRef = useRef<HTMLDivElement>(null);
  const categoryContainerRef = useRef<HTMLDivElement>(null);

  // Close suggestions/dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (addressContainerRef.current && !addressContainerRef.current.contains(event.target as Node)) {
        setShowAddressSuggestions(false);
      }
      if (categoryContainerRef.current && !categoryContainerRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, address: value }));
    setSelectedCoords(null); // Reset coords if user edits manually

    if (addressTimeoutRef.current) clearTimeout(addressTimeoutRef.current);

    if (value.length < 3) {
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
        setIsSearchingAddress(false);
        return;
    }

    setIsSearchingAddress(true);
    // Explicitly cast setTimeout return to any or number if needed, though usually window.setTimeout returns number in DOM lib
    addressTimeoutRef.current = window.setTimeout(async () => {
        try {
            // Use OpenStreetMap Nominatim for autocomplete
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&addressdetails=1`);
            if (response.ok) {
                const data = await response.json();
                setAddressSuggestions(data);
                setShowAddressSuggestions(true);
            }
        } catch (error) {
            console.error("Address lookup failed", error);
        } finally {
            setIsSearchingAddress(false);
        }
    }, 500); // 500ms debounce
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsSearchingAddress(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setSelectedCoords({ lat: latitude, lng: longitude });
        
        try {
          // Reverse geocoding using Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          
          if (response.ok) {
            const data = await response.json();
            setFormData(prev => ({ ...prev, address: data.display_name }));
          } else {
             // Fallback
             setFormData(prev => ({ ...prev, address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
          }
        } catch (error) {
          console.error("Reverse geocoding error", error);
          // Still set coordinates even if reverse lookup fails, just show raw coords
          setFormData(prev => ({ ...prev, address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
        } finally {
          setIsSearchingAddress(false);
        }
      },
      (error) => {
        console.error("Geolocation error", error);
        setIsSearchingAddress(false);
      }
    );
  };

  const selectAddress = (item: any) => {
      setFormData(prev => ({ ...prev, address: item.display_name }));
      setSelectedCoords({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
      setShowAddressSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadError('');

    try {
        let location = {
            address: formData.address,
            latitude: 29.7604, // Default fallback (Houston)
            longitude: -95.3698
        };

        // Geocoding Logic:
        // 1. Use coordinates from autocomplete if available
        // 2. If not, use Gemini Geocoding Service to convert address text to lat/lng
        if (selectedCoords) {
            location.latitude = selectedCoords.lat;
            location.longitude = selectedCoords.lng;
        } else {
            try {
                const coords = await geocodeAddress(formData.address);
                if (coords) {
                    location.latitude = coords.latitude;
                    location.longitude = coords.longitude;
                } else {
                    console.warn("Geocoding returned null, using fallback.");
                }
            } catch (geoError) {
                console.error("Geocoding failed", geoError);
            }
        }

        createEvent({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            location: location,
            date: formData.date || 'Upcoming',
            price: formData.price || 'Free',
            priceLevel: formData.price === 'Free' || formData.price === '0' ? 'Free' : '$',
            imageUrl: formData.imageUrl,
            videoUrl: formData.videoUrl,
            website: formData.website,
            eventStatus: formData.eventStatus as 'Scheduled' | 'Cancelled' | 'Postponed',
            visibility: formData.visibility as 'Public' | 'Private'
        });

        // Reset form
        setFormData({
            name: '',
            description: '',
            category: 'Community',
            address: '',
            date: '',
            price: '',
            website: '',
            imageUrl: '',
            videoUrl: '',
            eventStatus: 'Scheduled',
            visibility: 'Public'
        });
        setImageInputMode('upload');
        setVideoInputMode('link');
        setUploadError('');
        setSelectedCoords(null);
        setAddressSuggestions([]);
        onClose();
        
    } catch (err) {
        console.error("Failed to create event:", err);
        setUploadError("An error occurred while creating the event. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size Limit: 5MB (Browser LocalStorage is limited)
    const MAX_SIZE = 5 * 1024 * 1024; 
    if (file.size > MAX_SIZE) {
      setUploadError(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max limit is 5MB.`);
      // Reset input
      if (e.target) e.target.value = '';
      return;
    }
    
    setUploadError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === 'image') {
        setFormData(prev => ({ ...prev, imageUrl: result }));
      } else {
        setFormData(prev => ({ ...prev, videoUrl: result }));
      }
    };
    reader.onerror = () => {
        setUploadError("Failed to read file.");
    };
    reader.readAsDataURL(file);
  };

  const clearMedia = (type: 'image' | 'video') => {
      if (type === 'image') {
          setFormData(prev => ({ ...prev, imageUrl: '' }));
          if (imageInputRef.current) imageInputRef.current.value = '';
      } else {
          setFormData(prev => ({ ...prev, videoUrl: '' }));
          if (videoInputRef.current) videoInputRef.current.value = '';
      }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-orange-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar size={20} /> Post New Event
            </h2>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
            <div className="text-sm text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-200 mb-6 flex items-start gap-3">
                <Clock size={20} className="mt-0.5 flex-shrink-0 text-amber-600" />
                <div>
                    <span className="font-bold block text-amber-800">Review Process</span>
                    <span>Your event will be set to <strong>Pending</strong> status upon submission. An admin must approve it before it appears on the public feed.</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Basic Info */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">Event Title *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                        placeholder="e.g. Summer Jazz Festival"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1" ref={categoryContainerRef}>
                        <label className="text-xs font-bold text-slate-600 uppercase">Category</label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none bg-white text-left flex items-center gap-2 h-[42px]"
                            >
                                {(() => {
                                    const selected = CATEGORIES.find(c => c.name === formData.category) || CATEGORIES.find(c => c.name === 'Community') || CATEGORIES[0];
                                    const Icon = selected.icon;
                                    return (
                                        <>
                                            <Icon size={18} className="text-orange-500" />
                                            <span className="text-slate-900 truncate">{selected.name}</span>
                                        </>
                                    );
                                })()}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                     <ChevronDown size={16} />
                                </div>
                            </button>
                            
                            {isCategoryOpen && (
                                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto animate-fade-in-down">
                                    {CATEGORIES.map(category => {
                                        const Icon = category.icon;
                                        const isSelected = formData.category === category.name;
                                        return (
                                            <button
                                                key={category.id}
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, category: category.name }));
                                                    setIsCategoryOpen(false);
                                                }}
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
                    </div>
                    
                    {/* Event Status Dropdown */}
                    <div className="space-y-1">
                         <label className="text-xs font-bold text-slate-600 uppercase">Status</label>
                         <div className="relative">
                            <Info className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <select
                                name="eventStatus"
                                value={formData.eventStatus}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none appearance-none bg-white"
                            >
                                <option value="Scheduled">Scheduled</option>
                                <option value="Postponed">Postponed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <ChevronDown size={14} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">Visibility</label>
                    <div className="relative">
                        <Eye className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <select
                            name="visibility"
                            value={formData.visibility}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none appearance-none bg-white"
                        >
                            <option value="Public">Public (Visible to everyone)</option>
                            <option value="Private">Private (Invite only)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <ChevronDown size={14} />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                            type="text"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            placeholder="e.g. This Weekend"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                        />
                    </div>
                </div>

                {/* --- IMAGE UPLOAD SECTION --- */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-600 uppercase">Event Image</label>
                        <div className="flex bg-slate-100 rounded-lg p-0.5">
                            <button
                                type="button"
                                onClick={() => setImageInputMode('upload')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${imageInputMode === 'upload' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Upload
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageInputMode('link')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${imageInputMode === 'link' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                URL
                            </button>
                        </div>
                    </div>

                    <div className="border border-slate-300 border-dashed rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors relative">
                        {formData.imageUrl ? (
                            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-200 group">
                                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                <button 
                                    type="button" 
                                    onClick={() => clearMedia('image')}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    title="Remove Image"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ) : (
                            // Empty state - show upload/link
                            imageInputMode === 'upload' ? (
                                <div className="text-center py-4 cursor-pointer" onClick={() => imageInputRef.current?.click()}>
                                    <input 
                                        type="file" 
                                        ref={imageInputRef}
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'image')}
                                    />
                                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Upload size={20} />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">Click to upload image</p>
                                    <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 5MB</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            )
                        )}
                    </div>
                    {/* Fallback Preview Logic */}
                    {!formData.imageUrl && user?.logoUrl && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <img src={user.logoUrl} alt="Your Logo" className="w-8 h-8 rounded-full object-cover border border-white shadow-sm" />
                            <p className="text-xs text-blue-700">
                                <span className="font-bold">Note:</span> Since no image is selected, your profile logo will be used as the default event image.
                            </p>
                        </div>
                    )}
                </div>

                {/* --- VIDEO UPLOAD SECTION --- */}
                <div className="space-y-2">
                     <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-600 uppercase">Event Video (Optional)</label>
                        <div className="flex bg-slate-100 rounded-lg p-0.5">
                            <button
                                type="button"
                                onClick={() => setVideoInputMode('upload')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${videoInputMode === 'upload' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Upload
                            </button>
                            <button
                                type="button"
                                onClick={() => setVideoInputMode('link')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${videoInputMode === 'link' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                URL
                            </button>
                        </div>
                    </div>

                    <div className="border border-slate-300 border-dashed rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors relative">
                        {formData.videoUrl ? (
                            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-900 group">
                                <video src={formData.videoUrl} className="w-full h-full object-cover opacity-60" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Video size={24} className="text-white" />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => clearMedia('video')}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                                    title="Remove Video"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ) : (
                            videoInputMode === 'upload' ? (
                                <div className="text-center py-4 cursor-pointer" onClick={() => videoInputRef.current?.click()}>
                                    <input 
                                        type="file" 
                                        ref={videoInputRef}
                                        className="hidden" 
                                        accept="video/*"
                                        onChange={(e) => handleFileChange(e, 'video')}
                                    />
                                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Video size={20} />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">Click to upload video</p>
                                    <p className="text-xs text-slate-400 mt-1">MP4, WebM up to 5MB</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                    <input
                                        type="url"
                                        name="videoUrl"
                                        value={formData.videoUrl}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                                        placeholder="https://example.com/video.mp4"
                                    />
                                </div>
                            )
                        )}
                    </div>
                     {/* Fallback Preview Logic for Video */}
                    {!formData.videoUrl && user?.profileVideoUrl && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white">
                                <Video size={14} />
                            </div>
                            <p className="text-xs text-blue-700">
                                <span className="font-bold">Note:</span> Your profile video will be attached as the default since no event video is provided.
                            </p>
                        </div>
                    )}
                </div>
                
                {/* Error Message */}
                {uploadError && (
                    <div className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded border border-red-100">
                        {uploadError}
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">Location Address *</label>
                    <div className="relative" ref={addressContainerRef}>
                        <MapPin className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleAddressChange}
                            required
                            autoComplete="off"
                            className="w-full pl-10 pr-10 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                            placeholder="Type address or use location..."
                        />
                        
                        <div className="absolute right-3 top-2 text-slate-400">
                             {isSearchingAddress ? (
                                <Loader2 size={16} className="animate-spin text-orange-500" />
                             ) : (
                                <button 
                                    type="button"
                                    onClick={handleUseCurrentLocation}
                                    className="hover:text-orange-600 transition-colors"
                                    title="Use Current Location"
                                >
                                    <Locate size={18} />
                                </button>
                             )}
                        </div>

                        {showAddressSuggestions && addressSuggestions.length > 0 && (
                            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-fade-in-down">
                                {addressSuggestions.map((item: any, idx) => {
                                    // Basic formatting
                                    const parts = item.display_name.split(',');
                                    const mainText = parts[0];
                                    const secondaryText = parts.slice(1).join(',').trim();
                                    
                                    return (
                                        <button
                                            type="button"
                                            key={idx}
                                            onClick={() => selectAddress(item)}
                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 text-slate-700 hover:text-orange-700 border-b border-slate-50 last:border-0 transition-colors flex items-start gap-2"
                                        >   
                                            <MapPin size={14} className="mt-1 flex-shrink-0 text-slate-400" />
                                            <div>
                                                <div className="font-semibold text-slate-800">{mainText}</div>
                                                <div className="text-xs text-slate-500 truncate line-clamp-1">{secondaryText}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">Description *</label>
                    <div className="relative">
                         <FileText className="absolute left-3 top-3 text-slate-400" size={16} />
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none"
                            placeholder="Describe the event..."
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">Price</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                            type="text"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                            placeholder="Free or $20"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading || !!uploadError}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : 'Submit for Approval'} <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;
