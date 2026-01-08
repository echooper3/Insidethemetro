
import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Bot, Calendar, ShieldCheck, Ticket } from 'lucide-react';
import { FAQ_DATA } from '../constants';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'General': return <HelpCircle size={24} className="text-blue-500" />;
      case 'Event Submissions': return <Calendar size={24} className="text-orange-500" />;
      case 'Account & Security': return <ShieldCheck size={24} className="text-green-500" />;
      default: return <Ticket size={24} className="text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
             <Bot size={18} /> Powered by Gemini AI Support
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Frequently Asked Questions</h1>
          <p className="text-lg text-slate-600">
            Everything you need to know about navigating the metro.
          </p>
        </div>

        <div className="space-y-12">
          {FAQ_DATA.map((category, catIdx) => (
            <div key={catIdx} className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6 px-2">
                {getCategoryIcon(category.category)}
                <h2 className="text-xl font-bold text-slate-800">{category.category}</h2>
              </div>
              
              <div className="space-y-3">
                {category.questions.map((q, qIdx) => {
                  const id = `${catIdx}-${qIdx}`;
                  const isOpen = openIndex === id;
                  
                  return (
                    <div 
                      key={id}
                      className={`bg-white rounded-2xl border transition-all duration-300 ${isOpen ? 'border-orange-300 shadow-lg ring-4 ring-orange-50' : 'border-slate-200 hover:border-slate-300 shadow-sm'}`}
                    >
                      <button
                        onClick={() => toggle(id)}
                        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 group"
                      >
                        <span className={`font-bold transition-colors ${isOpen ? 'text-orange-600' : 'text-slate-800 group-hover:text-orange-600'}`}>
                          {q.q}
                        </span>
                        <ChevronDown 
                          size={20} 
                          className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-orange-600' : ''}`} 
                        />
                      </button>
                      
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="px-6 pb-6 pt-0 text-slate-600 leading-relaxed text-sm">
                          {q.a}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-16 bg-slate-900 rounded-3xl p-10 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-slate-300 mb-8 max-w-lg mx-auto">
              If you didn't find the answer you were looking for, please reach out to our dedicated support team.
            </p>
            <a 
              href="#/contact" 
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-10 rounded-xl transition-all shadow-lg hover:shadow-orange-900/40"
            >
              Contact Support
            </a>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
