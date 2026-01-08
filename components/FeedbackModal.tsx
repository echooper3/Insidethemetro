import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState('Incorrect Information');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { submitFeedback } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
        submitFeedback({ type, message });
        setLoading(false);
        setIsSubmitted(true);
        setTimeout(() => {
            handleClose();
        }, 2500);
    }, 800);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setMessage('');
    setType('Incorrect Information');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up relative">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-8">
            {isSubmitted ? (
                <div className="flex flex-col items-center text-center py-8 animate-fade-in">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Feedback Sent!</h3>
                    <p className="text-slate-600">
                        Thank you for helping us improve Inside The Metro. <br/>
                        An admin has been notified.
                    </p>
                </div>
            ) : (
                <>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <AlertCircle className="text-orange-600" /> Shared Feedback
                        </h2>
                        <p className="text-slate-500 text-sm mt-2">
                            Report incorrect events, times, or suggest improvements.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 uppercase">Issue Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all bg-white text-slate-700"
                            >
                                <option value="Incorrect Information">Incorrect Event Info</option>
                                <option value="Wrong Time/Date">Wrong Time or Date</option>
                                <option value="Wrong Location">Wrong Location</option>
                                <option value="Technical Bug">Technical Bug</option>
                                <option value="Suggestion">Suggestion</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 uppercase">Details</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Please describe the issue or your suggestion..."
                                required
                                rows={4}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !message.trim()}
                            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <>
                                    Submit Feedback <Send size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;