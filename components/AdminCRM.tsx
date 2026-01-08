import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Users, Calendar, MessageSquare, TrendingUp, CheckCircle, XCircle, Search, Mail, Phone, MapPin, User as UserIcon } from 'lucide-react';

type AdminTab = 'dashboard' | 'users' | 'events' | 'feedback';

const AdminCRM: React.FC = () => {
  const { user, allUsers, pendingEvents, allFeedback, approveEvent, rejectEvent, approvedEvents } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Protect Route
  if (!user || user.accountType !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  // --- SUB-COMPONENTS ---

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">{title}</h3>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
        <TrendingUp size={12} /> +2.5% from last month
      </p>
    </div>
  );

  const DashboardView = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={allUsers.length} icon={Users} color="bg-orange-500" />
        <StatCard title="Pending Events" value={pendingEvents.length} icon={Calendar} color="bg-amber-500" />
        <StatCard title="Live Events" value={approvedEvents.length + 50} icon={CheckCircle} color="bg-green-500" />
        <StatCard title="Total Feedback" value={allFeedback.length} icon={MessageSquare} color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {allFeedback.slice(0, 3).map((fb) => (
              <div key={fb.id} className="flex gap-3 items-start pb-3 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0">
                  FB
                </div>
                <div>
                  <p className="text-sm text-slate-800 font-medium">New feedback from {fb.userEmail}</p>
                  <p className="text-xs text-slate-500">{fb.type} • {new Date(fb.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {pendingEvents.length > 0 ? (
                pendingEvents.slice(0, 2).map((evt) => (
                    <div key={evt.id} className="flex gap-3 items-start pb-3 border-b border-slate-50 last:border-0">
                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xs flex-shrink-0">
                        EV
                        </div>
                        <div>
                        <p className="text-sm text-slate-800 font-medium">Event pending approval: {evt.name}</p>
                        <p className="text-xs text-slate-500">{evt.organizer?.name} • {evt.date}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-sm text-slate-400 italic">No pending events.</p>
            )}
          </div>
        </div>

        <div className="bg-orange-900 p-6 rounded-xl shadow-sm border border-orange-800 text-white relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Admin Quick Actions</h3>
                <p className="text-orange-200 text-sm mb-6">Review pending items to ensure quality content on Inside The Metro.</p>
                <button 
                    onClick={() => setActiveTab('events')}
                    className="bg-white text-orange-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-50 transition-colors"
                >
                    Review Events
                </button>
            </div>
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-800 rounded-full opacity-50"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-orange-800 rounded-full opacity-50"></div>
        </div>
      </div>
    </div>
  );

  const EventsView = () => (
    <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="text-orange-600" /> Pending Event Approvals
            </h3>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                {pendingEvents.length} Pending
            </span>
        </div>
        
        {pendingEvents.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 border-dashed">
                <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
                <h4 className="text-lg font-medium text-slate-900">No Pending Events</h4>
                <p className="text-slate-500 mt-1">All caught up! Organizers haven't posted anything new to review.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingEvents.map((event) => (
                    <div key={event.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                        <div className="h-40 bg-slate-100 relative group">
                             {event.imageUrl ? (
                                 <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" />
                             ) : (
                                 <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                    <Calendar size={32} className="mb-2 opacity-30" />
                                    <span className="font-medium text-xs">No Image Provided</span>
                                 </div>
                             )}
                             <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider">
                                Pending
                             </div>
                             {event.videoUrl && (
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                                    Includes Video
                                </div>
                             )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h4 className="font-bold text-lg text-slate-900 mb-1 leading-tight">{event.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-semibold">{event.category}</span>
                            </div>
                            
                            <p className="text-sm text-slate-600 mb-4 line-clamp-2 flex-grow">{event.description}</p>
                            
                            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 space-y-1.5 mb-5 border border-slate-100">
                                <p className="flex items-center gap-2"><UserIcon size={12} className="text-orange-500"/> <span className="font-semibold">By:</span> {event.organizer?.name || 'Unknown'}</p>
                                <p className="flex items-center gap-2"><Calendar size={12} className="text-orange-500"/> <span className="font-semibold">Date:</span> {event.date}</p>
                                <p className="flex items-center gap-2"><MapPin size={12} className="text-orange-500"/> <span className="font-semibold">Loc:</span> {event.location.address.slice(0, 25)}...</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                <button 
                                    onClick={() => {
                                        if(window.confirm('Are you sure you want to reject this event?')) {
                                            rejectEvent(event);
                                        }
                                    }}
                                    className="px-4 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                                >
                                    <XCircle size={16} /> Reject
                                </button>
                                <button 
                                    onClick={() => approveEvent(event)}
                                    className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                                >
                                    <CheckCircle size={16} /> Approve
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  const UsersView = () => (
      <div className="animate-fade-in bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800">User Management</h3>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input type="text" placeholder="Search users..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-900 font-semibold uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {allUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold overflow-hidden">
                                        {u.logoUrl ? (
                                            <img src={u.logoUrl} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            u.firstName.charAt(0)
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{u.businessName || `${u.firstName} ${u.lastName}`}</p>
                                        <p className="text-xs text-slate-400">ID: {u.id.slice(0, 6)}...</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2"><Mail size={12} /> {u.email}</div>
                                    <div className="flex items-center gap-2"><Phone size={12} /> {u.phone || 'N/A'}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2"><MapPin size={12} /> {u.address || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                    u.accountType === 'Admin' ? 'bg-orange-100 text-orange-700' :
                                    u.accountType === 'Business' ? 'bg-blue-100 text-blue-700' :
                                    u.accountType === 'Organizer' ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-100 text-slate-700'
                                }`}>
                                    {u.accountType}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
  );

  const FeedbackView = () => (
      <div className="animate-fade-in space-y-6">
          <h3 className="text-xl font-bold text-slate-800">User Feedback</h3>
          <div className="grid gap-4">
              {allFeedback.length === 0 ? (
                  <p className="text-slate-500 italic">No feedback received yet.</p>
              ) : (
                  allFeedback.map((fb) => (
                    <div key={fb.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                fb.type === 'Technical Bug' ? 'bg-red-100 text-red-700' :
                                fb.type === 'Incorrect Information' ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                            }`}>
                                {fb.type}
                            </span>
                            <span className="text-xs text-slate-400">{new Date(fb.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-800 mb-4">{fb.message}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500 pt-4 border-t border-slate-100">
                            <UserIcon size={14} />
                            <span>From: <span className="font-medium text-slate-700">{fb.userEmail || 'Anonymous'}</span></span>
                        </div>
                    </div>
                  ))
              )}
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-orange-900 text-white pb-24 pt-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-orange-200">Manage users, approve events, and review feedback.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 w-full flex-1">
          <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Navigation */}
              <div className="w-full lg:w-64 flex-shrink-0">
                  <nav className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 space-y-1">
                    {[
                        { id: 'dashboard', label: 'Overview', icon: TrendingUp },
                        { id: 'events', label: 'Event Approvals', icon: Calendar, badge: pendingEvents.length },
                        { id: 'users', label: 'User Management', icon: Users },
                        { id: 'feedback', label: 'User Feedback', icon: MessageSquare, badge: allFeedback.length },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as AdminTab)}
                            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                activeTab === item.id 
                                ? 'bg-orange-50 text-orange-700' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-orange-600'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={18} />
                                {item.label}
                            </div>
                            {item.badge ? (
                                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">{item.badge}</span>
                            ) : null}
                        </button>
                    ))}
                  </nav>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 pb-10">
                  {activeTab === 'dashboard' && <DashboardView />}
                  {activeTab === 'events' && <EventsView />}
                  {activeTab === 'users' && <UsersView />}
                  {activeTab === 'feedback' && <FeedbackView />}
              </div>
          </div>
      </div>
    </div>
  );
};

export default AdminCRM;