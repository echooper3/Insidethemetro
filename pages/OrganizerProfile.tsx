
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User as UserIcon, Save, Briefcase, Phone, Globe, MapPin, Camera, Clock, CheckCircle, XCircle, AlertCircle, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const OrganizerProfile: React.FC = () => {
  const { user, updateUserProfile, pendingEvents, approvedEvents, rejectedEvents } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'events'>('profile');
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
    if (user) {
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
    }
  }, [user]);

  const myEvents = useMemo(() => {
    if (!user) return [];
    const all = [...pendingEvents, ...approvedEvents, ...rejectedEvents];
    return all.filter(e => e.createdBy === user.id).sort((a, b) => Number(b.id) - Number(a.id));
  }, [user, pendingEvents, approvedEvents, rejectedEvents]);

  if (!user) return <Navigate to="/" replace />;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    setTimeout(() => {
      updateUserProfile(formData);
      setIsEditing(false);
      setLoading(false);
    }, 800);
  };

  const isOrganizer = user.accountType === 'Organizer' || user.accountType === 'Business';

  const StatusBadge = ({ status }: { status?: string }) => {
    if (status === 'approved') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle size={12} /> Published</span>;
    if (status === 'rejected') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700"><XCircle size={12} /> Rejected</span>;
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><Clock size={12} /> Pending Approval</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          <div className="h-32 bg-gradient-to-r from-orange-500 to-amber-600"></div>
          
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start -mt-12">
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
                    <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 bg-slate-800 text-white p-2 rounded-full shadow-lg hover:bg-slate-700 transition-colors flex items-center gap-1.5">
                      <Camera size={14} />
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </button>
                  )}
               </div>

               <div className="flex-1 mt-14 w-full flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        {isOrganizer ? (formData.businessName || `${formData.firstName} ${formData.lastName}`) : `${formData.firstName} ${formData.lastName}`}
                    </h2>
                    <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                        <span className={`inline-block w-2 h-2 rounded-full ${user.accountType === 'Admin' ? 'bg-red-500' : isOrganizer ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                        {user.accountType} Account
                    </p>
                  </div>
                  {!isEditing && activeTab === 'profile' && (
                    <button onClick={() => setIsEditing(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                      Edit Profile
                    </button>
                  )}
               </div>
            </div>

            {/* Tabs */}
            {isOrganizer && (
               <div className="flex gap-8 border-b border-slate-200 mt-8 mb-6">
                   <button onClick={() => setActiveTab('profile')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'profile' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Profile Details</button>
                   <button onClick={() => setActiveTab('events')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'events' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>My Events</button>
               </div>
            )}

            {activeTab === 'profile' && (
                <form onSubmit={handleSave} className="space-y-6 mt-4 animate-fade-in">
                  
                  {isOrganizer && (
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Briefcase size={12} /> Business Name</label>
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
                          <p className="text-slate-900 font-medium text-lg border-b border-slate-100 pb-2">{formData.businessName || 'N/A'}</p>
                        )}
                     </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                        {isEditing ? <input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:border-orange-500" /> : <p className="text-slate-800 py-2 border-b border-slate-100">{formData.firstName}</p>}
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                        {isEditing ? <input name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:border-orange-500" /> : <p className="text-slate-800 py-2 border-b border-slate-100">{formData.lastName}</p>}
                     </div>
                  </div>

                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">Bio</label>
                     {isEditing ? (
                       <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 outline-none resize-none" />
                     ) : (
                       <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm leading-relaxed">{formData.bio || 'No bio provided.'}</p>
                     )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Phone size={12} /> Phone</label>
                        {isEditing ? <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:border-orange-500" /> : <p className="text-slate-800 py-2 border-b border-slate-100">{formData.phone || 'N/A'}</p>}
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Globe size={12} /> Website</label>
                        {isEditing ? <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:border-orange-500" /> : <p className="text-slate-800 py-2 border-b border-slate-100">{formData.website || 'N/A'}</p>}
                     </div>
                  </div>

                  <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><MapPin size={12} /> Address</label>
                        {isEditing ? <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:border-orange-500" /> : <p className="text-slate-800 py-2 border-b border-slate-100">{formData.address || 'N/A'}</p>}
                  </div>

                  {isEditing && (
                     <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">
                            {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                        </button>
                     </div>
                  )}
                </form>
            )}

            {activeTab === 'events' && (
               <div className="space-y-4 animate-fade-in mt-4">
                   <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <AlertCircle size={16} className="text-orange-500" />
                        <span>Events must be approved by an admin before becoming visible to the public.</span>
                   </div>

                   {myEvents.length === 0 ? (
                       <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                           <Clock className="mx-auto text-slate-300 mb-2" size={32} />
                           <p className="text-slate-500 font-medium">You haven't submitted any events yet.</p>
                       </div>
                   ) : (
                       myEvents.map(event => (
                           <div key={event.id} className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">{event.name}</h4>
                                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                        {event.date} • {event.location?.address}
                                    </p>
                                </div>
                                <StatusBadge status={event.status} />
                           </div>
                       ))
                   )}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default OrganizerProfile;
