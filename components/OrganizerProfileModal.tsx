
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, User as UserIcon, Save, Briefcase, Mail, Phone, MapPin, Globe, Upload, Trash2, Camera, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EventRecommendation } from '../types';

interface OrganizerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'profile' | 'events';

const OrganizerProfileModal: React.FC<OrganizerProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile, pendingEvents, approvedEvents, rejectedEvents } = useAuth();
  
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    bio: '',
    phone: '',
    address: '',
    website: '',
    logoUrl: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        businessName: user.businessName || '',
        bio: user.bio || '',
        phone: user.phone || '',
        address: user.address || '',
        website: user.website || '',
        logoUrl: user.logoUrl || ''
      });
      setIsEditing(false);
      setActiveTab('profile');
    }
  }, [user, isOpen]);

  // Aggregate and sort user's events
  const myEvents = useMemo(() => {
    if (!user) return [];
    const all = [...pendingEvents, ...approvedEvents, ...rejectedEvents];
    return all.filter(e => e.createdBy === user.id).sort((a, b) => {
        // Sort by approximate creation time (using ID since it is timestamp)
        return Number(b.id) - Number(a.id);
    });
  }, [user, pendingEvents, approvedEvents, rejectedEvents]);

  if (!isOpen || !user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 5MB Limit
      if (file.size > 5 * 1024 * 1024) {
        alert("File too large. Max 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API
    setTimeout(() => {
      updateUserProfile(formData);
      setIsEditing(false);
      setLoading(false);
    }, 800);
  };

  const isOrganizer = user.accountType === 'Organizer' || user.accountType === 'Business';

  const StatusBadge = ({ status }: { status?: string }) => {
    if (status === 'approved') {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                <CheckCircle size={12} /> Published
            </span>
        );
    }
    if (status === 'rejected') {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                <XCircle size={12} /> Rejected
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
            <Clock size={12} /> Pending Approval
        </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up relative max-h-[90vh] flex flex-col">
        {/* Header with Cover-like Background */}
        <div className="h-32 bg-gradient-to-r from-orange-500 to-amber-600 relative flex-shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors z-10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-8 pb-8 flex-1 overflow-y-auto -mt-12 relative flex flex-col">
           <div className="flex flex-col sm:flex-row gap-6 items-start">
             {/* Avatar/Logo Area */}
             <div className="relative group flex-shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-md bg-white flex items-center justify-center overflow-hidden">
                   {formData.logoUrl ? (
                     <img src={formData.logoUrl} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-3xl">
                       {user.firstName.charAt(0)}
                     </div>
                   )}
                </div>
                {isEditing && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 bg-slate-800 text-white p-2 rounded-full shadow-lg hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                    title="Upload Photo"
                  >
                    <Camera size={14} />
                    <span className="text-[10px] font-bold uppercase hidden sm:inline">Photo</span>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </button>
                )}
             </div>

             {/* Header Text */}
             <div className="flex-1 mt-12 sm:mt-14 w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        {isOrganizer ? (formData.businessName || `${formData.firstName} ${formData.lastName}`) : `${formData.firstName} ${formData.lastName}`}
                    </h2>
                    <p className="text-slate-500 font-medium flex items-center gap-1">
                       <span className={`inline-block w-2 h-2 rounded-full ${user.accountType === 'Admin' ? 'bg-red-500' : isOrganizer ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                       {user.accountType} Account
                    </p>
                  </div>
                  {!isEditing && activeTab === 'profile' && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
             </div>
           </div>

           {/* Tabs */}
           {isOrganizer && (
               <div className="flex items-center gap-6 border-b border-slate-200 mt-6 mb-6">
                   <button
                        onClick={() => setActiveTab('profile')}
                        className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'profile' ? 'text-orange-600' : 'text-slate-500 hover:text-slate-800'}`}
                   >
                        Profile Details
                        {activeTab === 'profile' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>}
                   </button>
                   <button
                        onClick={() => setActiveTab('events')}
                        className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'events' ? 'text-orange-600' : 'text-slate-500 hover:text-slate-800'}`}
                   >
                        My Events
                        {activeTab === 'events' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>}
                   </button>
               </div>
           )}

           {/* Tab Content: Profile */}
           {activeTab === 'profile' && (
               <form onSubmit={handleSave} className="space-y-6 mt-2">
                  
                  {isOrganizer && (
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Briefcase size={12} /> Business / Organization Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 outline-none"
                            placeholder="e.g. Houston Jazz Collective"
                          />
                        ) : (
                          <p className="text-slate-900 font-medium text-lg border-b border-slate-100 pb-2">
                            {formData.businessName || 'N/A'}
                          </p>
                        )}
                     </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                            First Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 outline-none"
                          />
                        ) : (
                          <p className="text-slate-800 border-b border-slate-100 pb-2">{formData.firstName}</p>
                        )}
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                            Last Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 outline-none"
                          />
                        ) : (
                          <p className="text-slate-800 border-b border-slate-100 pb-2">{formData.lastName}</p>
                        )}
                     </div>
                  </div>

                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                         Bio / About
                     </label>
                     {isEditing ? (
                       <textarea
                         name="bio"
                         value={formData.bio}
                         onChange={handleChange}
                         rows={3}
                         className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 outline-none resize-none"
                         placeholder="Tell us about yourself..."
                       />
                     ) : (
                       <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm leading-relaxed">
                         {formData.bio || 'No bio provided.'}
                       </p>
                     )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Phone size={12} /> Phone
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 outline-none"
                          />
                        ) : (
                          <p className="text-slate-800 border-b border-slate-100 pb-2">{formData.phone || 'N/A'}</p>
                        )}
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Globe size={12} /> Website
                        </label>
                        {isEditing ? (
                          <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 outline-none"
                            placeholder="https://..."
                          />
                        ) : (
                          <p className="text-slate-800 border-b border-slate-100 pb-2">
                             {formData.website ? (
                                 <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                                     {formData.website}
                                 </a>
                             ) : 'N/A'}
                          </p>
                        )}
                     </div>
                  </div>
                  
                   <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                            <MapPin size={12} /> Address
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 outline-none"
                          />
                        ) : (
                          <p className="text-slate-800 border-b border-slate-100 pb-2">{formData.address || 'N/A'}</p>
                        )}
                     </div>

                  {isEditing && (
                     <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button 
                           type="button" 
                           onClick={() => setIsEditing(false)}
                           className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                           type="submit" 
                           disabled={loading}
                           className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                        </button>
                     </div>
                  )}
               </form>
           )}

           {/* Tab Content: My Events */}
           {activeTab === 'events' && (
               <div className="space-y-4 animate-fade-in mt-2">
                   <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <AlertCircle size={16} className="text-orange-500" />
                        <span>Events must be approved by an admin before becoming visible to the public.</span>
                   </div>

                   {myEvents.length === 0 ? (
                       <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                           <Calendar className="mx-auto text-slate-300 mb-2" size={32} />
                           <p className="text-slate-500 font-medium">You haven't submitted any events yet.</p>
                       </div>
                   ) : (
                       myEvents.map(event => (
                           <div key={event.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg">{event.name}</h4>
                                        <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                            <Calendar size={14} /> {event.date}
                                        </p>
                                    </div>
                                    <StatusBadge status={event.status} />
                                </div>
                                <div className="mt-3 text-sm text-slate-600 line-clamp-1">
                                    {event.description}
                                </div>
                           </div>
                       ))
                   )}
               </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default OrganizerProfileModal;
