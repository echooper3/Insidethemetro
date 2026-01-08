
import React, { useState } from 'react';
import { Mail, Send, DollarSign, MessageSquare, Phone, MapPin, Building2, CheckCircle, Loader2 } from 'lucide-react';

const Contact: React.FC = () => {
  const [activeForm, setActiveForm] = useState<'general' | 'rates'>('general');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    budget: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', company: '', budget: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Contact Us</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Have a question or looking to grow your brand? We're here to help you get inside the metro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MessageSquare className="text-orange-600" size={18} /> Get In Touch
              </h3>
              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <Mail className="mt-1 text-slate-400" size={16} />
                  <div>
                    <p className="font-semibold text-slate-800">Email</p>
                    <p>hello@insidethemetro.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-1 text-slate-400" size={16} />
                  <div>
                    <p className="font-semibold text-slate-800">Support</p>
                    <p>(713) 555-0123</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 text-slate-400" size={16} />
                  <div>
                    <p className="font-semibold text-slate-800">HQ</p>
                    <p>Downtown Houston, TX</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-600 p-6 rounded-2xl shadow-lg text-white">
              <h3 className="font-bold mb-2">Partner with Us</h3>
              <p className="text-orange-100 text-sm mb-4">
                Reach over 50,000 monthly active users across Texas and Oklahoma.
              </p>
              <button 
                onClick={() => setActiveForm('rates')}
                className="w-full bg-white text-orange-600 font-bold py-2 rounded-lg text-sm hover:bg-orange-50 transition-colors"
              >
                View Ad Rates
              </button>
            </div>
          </div>

          {/* Form Area */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="flex border-b border-slate-100">
                <button
                  onClick={() => setActiveForm('general')}
                  className={`flex-1 py-4 text-sm font-bold transition-all ${activeForm === 'general' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  General Inquiry
                </button>
                <button
                  onClick={() => setActiveForm('rates')}
                  className={`flex-1 py-4 text-sm font-bold transition-all ${activeForm === 'rates' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  Contact for Rates
                </button>
              </div>

              <div className="p-8">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Message Sent!</h3>
                    <p className="text-slate-500 mt-2">Thanks for reaching out. Our team will get back to you within 24 hours.</p>
                    <button onClick={() => setSubmitted(false)} className="mt-6 text-orange-600 font-bold hover:underline">Send another message</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Your Name</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                          placeholder="jane@example.com"
                        />
                      </div>
                    </div>

                    {activeForm === 'rates' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in-down">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Building2 size={12} /> Company Name
                          </label>
                          <input
                            type="text"
                            name="company"
                            required
                            value={formData.company}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                            placeholder="Your Business Ltd."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                            <DollarSign size={12} /> Estimated Monthly Budget
                          </label>
                          <select
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none bg-white"
                          >
                            <option value="">Select Range...</option>
                            <option value="under-500">Under $500</option>
                            <option value="500-2000">$500 - $2,000</option>
                            <option value="2000-5000">$2,000 - $5,000</option>
                            <option value="5000-plus">$5,000+</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
                      <textarea
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none resize-none"
                        placeholder={activeForm === 'rates' ? "Tell us about the events or products you'd like to promote..." : "How can we help you?"}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-900 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          Send Message <Send size={18} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
