import React, { useState, useRef } from 'react';
import { X, Mail, Lock, User as UserIcon, ArrowRight, Phone, Calendar, Globe, MapPin, Briefcase, Camera, Upload, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AccountType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'signup' | 'forgot-password' | 'force-change-password';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<AuthView>('login');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup Profile State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [address, setAddress] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('Member');
  const [profileImage, setProfileImage] = useState('');

  // Force Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { login, signup, validatePassword, changePassword } = useAuth();

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size too large. Max 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate API delay
    setTimeout(() => {
      if (view === 'forgot-password') {
        alert('Password recovery link sent to ' + email);
        setView('login');
        setIsLoading(false);
      } else if (view === 'signup') {
        // Validation check
        if (!firstName || !lastName || !email || !password) {
            setError('Please fill in all required fields');
            setIsLoading(false);
            return;
        }

        const passValidation = validatePassword(password);
        if (!passValidation.isValid) {
            setError("Password too weak. See requirements below.");
            setIsLoading(false);
            return;
        }

        signup({
            firstName,
            lastName,
            email,
            phone,
            birthday,
            ethnicity,
            address,
            accountType,
            logoUrl: profileImage // Save the uploaded image
        });
        setIsLoading(false);
        onClose();
      } else if (view === 'force-change-password') {
          if (newPassword !== confirmPassword) {
              setError("Passwords do not match.");
              setIsLoading(false);
              return;
          }
          const passValidation = validatePassword(newPassword);
          if (!passValidation.isValid) {
              setError("Password too weak. Ensure it meets all criteria.");
              setIsLoading(false);
              return;
          }
          
          try {
            changePassword(newPassword);
            // After changing, try logging in again automatically or ask to sign in
            const result = login(email, newPassword);
            if (result.success) {
                onClose();
            } else {
                setView('login');
                setError("Password changed. Please sign in.");
            }
          } catch (err: any) {
              setError(err.message);
          }
          setIsLoading(false);
      } else {
        // Login
        const result = login(email, password);
        if (result.success) {
            onClose();
        } else {
            if (result.status === 'password_expired') {
                setView('force-change-password');
                setError("Your password has expired (90 days). Please create a new one.");
            } else {
                setError("Invalid credentials. Please try again.");
            }
        }
        setIsLoading(false);
      }
    }, 1000);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setBirthday('');
    setEthnicity('');
    setAddress('');
    setAccountType('Member');
    setProfileImage('');
    setError('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Password Strength Indicators
  const passwordCriteria = (pwd: string) => {
      return [
          { label: '8+ Characters', met: pwd.length >= 8 },
          { label: 'Uppercase', met: /[A-Z]/.test(pwd) },
          { label: 'Lowercase', met: /[a-z]/.test(pwd) },
          { label: 'Number', met: /[0-9]/.test(pwd) },
          { label: 'Special (!@#$)', met: /[\W_]/.test(pwd) },
      ];
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up relative flex flex-col ${view === 'signup' ? 'my-8 max-h-[90vh]' : ''}`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className={`p-8 ${view === 'signup' ? 'overflow-y-auto' : ''}`}>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {view === 'login' && 'Welcome Back'}
              {view === 'signup' && 'Create Profile'}
              {view === 'forgot-password' && 'Reset Password'}
              {view === 'force-change-password' && 'Update Password'}
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              {view === 'login' && 'Sign in to access your planned trips'}
              {view === 'signup' && 'Complete your profile to join the community'}
              {view === 'forgot-password' && 'Enter your email to receive a recovery link'}
              {view === 'force-change-password' && 'Your password has expired. Please secure your account.'}
            </p>
          </div>

          {error && (
            <div className={`mb-4 p-3 text-sm rounded-lg border ${view === 'force-change-password' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
                <div className="flex items-start gap-2">
                    {view === 'force-change-password' ? <AlertTriangle size={16} className="mt-0.5" /> : null}
                    {error}
                </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Signup Fields */}
            {view === 'signup' && (
              <>
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center mb-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all overflow-hidden group"
                  >
                    {profileImage ? (
                      <img src={profileImage} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400 group-hover:text-orange-500">
                        <Camera size={24} />
                        <span className="text-[10px] font-medium mt-1">Add Photo</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase">Account Type</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 text-slate-400" size={18} />
                    <select 
                      value={accountType} 
                      onChange={(e) => setAccountType(e.target.value as AccountType)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all appearance-none bg-white text-slate-700"
                    >
                      <option value="Member">Member</option>
                      <option value="Organizer">Organizer</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase">First Name *</label>
                        <input
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                            placeholder="Jane"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase">Last Name *</label>
                        <input
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                            placeholder="Doe"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase">Birthday</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={birthday}
                                onChange={(e) => setBirthday(e.target.value)}
                                className="w-full pl-3 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all text-sm text-slate-600"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase">Ethnicity</label>
                         <div className="relative">
                            <Globe className="absolute left-3 top-3 text-slate-400" size={18} />
                            <select
                                value={ethnicity}
                                onChange={(e) => setEthnicity(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all appearance-none bg-white text-slate-700"
                            >
                                <option value="">Select...</option>
                                <option value="Hispanic">Hispanic</option>
                                <option value="African American">African American</option>
                                <option value="Caucasian">Caucasian</option>
                                <option value="Asian">Asian</option>
                                <option value="Native American">Native American</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                      placeholder="Street, City, Zip"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Login / Forgot Password / Signup - Email & Password */}
            {view !== 'force-change-password' && (
              <div className="space-y-4">
                 <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {view !== 'forgot-password' && (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-xs font-semibold text-slate-600 uppercase">Password *</label>
                      {view === 'login' && (
                        <button 
                            type="button"
                            onClick={() => { setView('forgot-password'); setError(''); }}
                            className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                        >
                            Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                    {view === 'signup' && (
                         <div className="grid grid-cols-2 gap-1 mt-2">
                             {passwordCriteria(password).map((criterion, idx) => (
                                 <div key={idx} className={`text-[10px] flex items-center gap-1 ${criterion.met ? 'text-green-600' : 'text-slate-400'}`}>
                                     {criterion.met ? <ShieldCheck size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-slate-300"></div>}
                                     {criterion.label}
                                 </div>
                             ))}
                         </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Force Change Password View */}
            {view === 'force-change-password' && (
                 <div className="space-y-4">
                     <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                                placeholder="New Password"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                                placeholder="Confirm New Password"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                        {passwordCriteria(newPassword).map((criterion, idx) => (
                            <div key={idx} className={`text-[10px] flex items-center gap-1 ${criterion.met ? 'text-green-600' : 'text-slate-400'}`}>
                                {criterion.met ? <ShieldCheck size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-slate-300"></div>}
                                {criterion.label}
                            </div>
                        ))}
                    </div>
                 </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-orange-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  {view === 'login' && 'Sign In'}
                  {view === 'signup' && 'Create Account'}
                  {view === 'forgot-password' && 'Send Recovery Link'}
                  {view === 'force-change-password' && 'Update Password'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Switching */}
          <div className="mt-6 text-center text-sm">
            {view === 'login' && (
              <p className="text-slate-500">
                Don't have an account?{' '}
                <button 
                  onClick={() => { setView('signup'); resetForm(); }}
                  className="text-orange-600 font-bold hover:text-orange-700"
                >
                  Sign Up
                </button>
              </p>
            )}
            {view === 'signup' && (
              <p className="text-slate-500">
                Already have an account?{' '}
                <button 
                  onClick={() => { setView('login'); resetForm(); }}
                  className="text-orange-600 font-bold hover:text-orange-700"
                >
                  Sign In
                </button>
              </p>
            )}
            {(view === 'forgot-password' || view === 'force-change-password') && (
              <button 
                onClick={() => { setView('login'); resetForm(); }}
                className="text-slate-500 font-semibold hover:text-slate-700"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;